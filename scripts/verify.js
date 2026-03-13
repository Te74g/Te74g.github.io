#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORED_DIRS = new Set([
    '.git',
    'node_modules',
    'playwright-report',
    'test-results'
]);
const CHECK_EXTENSIONS = new Set(['.html', '.js', '.css', '.py']);
const ASSET_EXT = '(?:webp|png|jpe?g|gif|svg|ico|avif)';
const HTML_REF_RE = /(?:src|href)\s*=\s*["']([^"'#]+)["']/gi;
const ASSET_STRING_RE = new RegExp(
    `['"\`]((?:\\/|\\.\\.\\/|\\.\\/)?assets\\/[^'"\\\`\\n\\r?#]+\\.${ASSET_EXT})['"\`]`,
    'gi'
);
const ASSET_URL_RE = new RegExp(
    `url\\((?:'|")?((?:\\/|\\.\\.\\/|\\.\\/)?assets\\/[^)'"\\n\\r?#]+\\.${ASSET_EXT})(?:'|")?\\)`,
    'gi'
);
const LEGACY_DATA_RE = /_config[\\/](?:data_[a-z]+|site_data)\.js/ig;
const EXTERNAL_RE = /^(https?:|mailto:|tel:|javascript:|data:|\/\/|about:|#)/i;
const LEGACY_IGNORE_FILES = new Set([
    normalizeSlashes(path.join('scripts', 'replace_data_paths.js'))
]);

function normalizeSlashes(p) {
    return p.replace(/\\/g, '/');
}

function toRelative(filePath) {
    return normalizeSlashes(path.relative(ROOT, filePath));
}

function shouldSkipDir(name) {
    return IGNORED_DIRS.has(name);
}

function listFiles(dir) {
    const out = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (shouldSkipDir(entry.name)) continue;
            out.push(...listFiles(abs));
            continue;
        }
        const ext = path.extname(entry.name).toLowerCase();
        if (CHECK_EXTENSIONS.has(ext)) {
            out.push(abs);
        }
    }
    return out;
}

function resolveRef(filePath, ref) {
    const clean = ref.split(/[?#]/, 1)[0];
    if (!clean) return null;
    if (clean.startsWith('/')) {
        return path.join(ROOT, clean.slice(1).replace(/\//g, path.sep));
    }
    if (clean.startsWith('assets/')) {
        return path.join(ROOT, clean.replace(/\//g, path.sep));
    }
    return path.resolve(path.dirname(filePath), clean.replace(/\//g, path.sep));
}

function rootAssetRef(ref) {
    const clean = ref.split(/[?#]/, 1)[0];
    let v = clean;
    while (v.startsWith('../')) v = v.slice(3);
    while (v.startsWith('./')) v = v.slice(2);
    return v.startsWith('assets/') ? v : null;
}

function existsTarget(absPath) {
    try {
        fs.accessSync(absPath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function isCommentOnlyLine(ext, line) {
    const t = line.trim();
    if (!t) return true;
    if (ext === '.py') {
        return t.startsWith('#');
    }
    if (ext === '.js' || ext === '.css') {
        return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('*/');
    }
    if (ext === '.html') {
        return t.startsWith('<!--');
    }
    return false;
}

function scanFile(filePath, issues) {
    const ext = path.extname(filePath).toLowerCase();
    const rel = toRelative(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 1) {
        const lineNo = i + 1;
        const line = lines[i];

        if (ext === '.html') {
            if (isCommentOnlyLine(ext, line)) {
                continue;
            }
            let m;
            HTML_REF_RE.lastIndex = 0;
            while ((m = HTML_REF_RE.exec(line)) !== null) {
                const ref = m[1].trim();
                if (!ref || EXTERNAL_RE.test(ref)) continue;
                const abs = resolveRef(filePath, ref);
                if (abs && !existsTarget(abs)) {
                    issues.missingHtmlRefs.push({ file: rel, line: lineNo, ref });
                }
            }
        }

        if (!isCommentOnlyLine(ext, line)) {
            const seenRefs = new Set();
            let m;

            ASSET_STRING_RE.lastIndex = 0;
            while ((m = ASSET_STRING_RE.exec(line)) !== null) {
                seenRefs.add(m[1]);
            }

            ASSET_URL_RE.lastIndex = 0;
            while ((m = ASSET_URL_RE.exec(line)) !== null) {
                seenRefs.add(m[1]);
            }

            for (const ref of seenRefs) {
                if (!ref || EXTERNAL_RE.test(ref)) continue;
                const abs = resolveRef(filePath, ref);
                if (abs && !existsTarget(abs)) {
                    const rootRef = rootAssetRef(ref);
                    if (rootRef && existsTarget(path.join(ROOT, rootRef.replace(/\//g, path.sep)))) {
                        continue;
                    }
                    issues.missingAssets.push({ file: rel, line: lineNo, ref });
                }
            }
        }

        if (!LEGACY_IGNORE_FILES.has(rel)) {
            let m;
            LEGACY_DATA_RE.lastIndex = 0;
            while ((m = LEGACY_DATA_RE.exec(line)) !== null) {
                issues.legacyDataRefs.push({ file: rel, line: lineNo, ref: m[0] });
            }
        }
    }
}

function printSection(title, rows) {
    if (rows.length === 0) return;
    console.error(`\n[${title}] ${rows.length}`);
    for (const row of rows.slice(0, 200)) {
        console.error(`  - ${row.file}:${row.line} -> ${row.ref}`);
    }
    if (rows.length > 200) {
        console.error(`  ... ${rows.length - 200} more`);
    }
}

function main() {
    const files = listFiles(ROOT);
    const issues = {
        missingHtmlRefs: [],
        missingAssets: [],
        legacyDataRefs: []
    };

    for (const filePath of files) {
        scanFile(filePath, issues);
    }

    const total = issues.missingHtmlRefs.length + issues.missingAssets.length + issues.legacyDataRefs.length;

    if (total === 0) {
        console.log('verify passed: no missing refs/assets and no legacy _config data refs.');
        process.exit(0);
    }

    printSection('Missing HTML src/href targets', issues.missingHtmlRefs);
    printSection('Missing asset files', issues.missingAssets);
    printSection('Legacy _config data references', issues.legacyDataRefs);
    console.error(`\nverify failed: ${total} issue(s)`);
    process.exit(1);
}

main();
