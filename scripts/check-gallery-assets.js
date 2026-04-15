#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const GALLERY_DATA_PATH = path.join(ROOT, 'data', 'gallery.js');

function normalizeSlashes(value) {
    return String(value).replace(/\\/g, '/');
}

function loadWindowData(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: filePath });
    return sandbox.window;
}

function existsTarget(relPath) {
    const absPath = path.join(ROOT, relPath.replace(/\//g, path.sep));
    try {
        fs.accessSync(absPath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function isTrackedByGit(relPath) {
    try {
        execFileSync(
            'git',
            ['-C', ROOT, 'ls-files', '--error-unmatch', normalizeSlashes(relPath)],
            { stdio: 'ignore' }
        );
        return true;
    } catch {
        return false;
    }
}

function printIssues(title, items) {
    if (items.length === 0) return;
    console.error(`\n[${title}] ${items.length}`);
    for (const item of items) {
        console.error(`  - ${item}`);
    }
}

function main() {
    const galleryWindow = loadWindowData(GALLERY_DATA_PATH);
    const galleryData = Array.isArray(galleryWindow.galleryData) ? galleryWindow.galleryData : [];

    const issues = {
        missingFiles: [],
        untrackedFiles: []
    };

    for (const item of galleryData) {
        if (!item || item.hidden === true) continue;

        const albumName = item.title || '(untitled album)';
        const refs = [];

        if (item.thumb) refs.push({ kind: 'thumb', path: item.thumb });
        if (Array.isArray(item.images)) {
            for (const imagePath of item.images) {
                refs.push({ kind: 'image', path: imagePath });
            }
        }

        for (const ref of refs) {
            const relPath = normalizeSlashes(ref.path);
            if (!existsTarget(relPath)) {
                issues.missingFiles.push(`${albumName}: ${ref.kind} missing -> ${relPath}`);
                continue;
            }
            if (!isTrackedByGit(relPath)) {
                issues.untrackedFiles.push(`${albumName}: ${ref.kind} not tracked -> ${relPath}`);
            }
        }
    }

    const total = Object.values(issues).reduce((sum, list) => sum + list.length, 0);
    if (total === 0) {
        console.log('check-gallery-assets passed');
        return;
    }

    printIssues('Missing gallery files', issues.missingFiles);
    printIssues('Untracked gallery files', issues.untrackedFiles);
    process.exit(1);
}

main();
