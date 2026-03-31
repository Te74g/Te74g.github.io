#!/usr/bin/env node
/**
 * scripts/generate_stubs.js
 *
 * data_members.js と data_news.js を読み込んで、
 * クリーン URL 用のスタブ HTML を一括生成する。
 *
 * 生成先:
 *   cast/{id}/index.html          ← profile_loader.js が window.__memberId を読む
 *   news/{slug}/index.html        ← news_loader.js が window.__newsId を読む
 *
 * 使い方:
 *   node scripts/generate_stubs.js           # 全スタブ生成（既存はスキップ）
 *   node scripts/generate_stubs.js --dry     # 書き込まずパスだけ表示
 *   node scripts/generate_stubs.js --force   # 既存ファイルも上書き
 *   node scripts/generate_stubs.js --cast    # キャストのみ
 *   node scripts/generate_stubs.js --news    # ニュースのみ
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const DRY       = process.argv.includes('--dry');
const FORCE     = process.argv.includes('--force');
const CAST_ONLY = process.argv.includes('--cast');
const NEWS_ONLY = process.argv.includes('--news');
const BLOG_ONLY = process.argv.includes('--blog');

/* ─────────────────────────────────────────
   データファイルのロード
   window.xxx = [...] 形式を Node.js で読む
───────────────────────────────────────── */
function loadDataFile(relPath) {
    const code = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    const mock = {};
    // new Function で window を注入して評価
    // eslint-disable-next-line no-new-func
    const fn = new Function('window', code);
    fn(mock);
    return mock;
}

const siteCtx    = loadDataFile('data/site.js');
const membersCtx = loadDataFile('data/members.js');
const newsCtx    = loadDataFile('data/news.js');
const blogCtx    = (() => {
    try { return loadDataFile('data/blog.js'); } catch (e) { return {}; }
})();

const members    = membersCtx.membersData || [];
const newsItems  = newsCtx.newsData       || [];
const blogItems  = blogCtx.blogData       || [];

/* ─────────────────────────────────────────
   ユーティリティ
───────────────────────────────────────── */
function escHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** news.id → URL slug: アンダースコアをハイフンに変換 */
function toSlug(id) {
    return String(id).replace(/_/g, '-').toLowerCase();
}

/** ファイルを書き出す（DRY/FORCE/スキップ制御込み） */
function writeFile(relPath, content) {
    const full = path.join(ROOT, relPath);

    if (DRY) {
        console.log('  [DRY]   ', relPath);
        return;
    }
    if (!FORCE && fs.existsSync(full)) {
        console.log('  [SKIP]  ', relPath, '(既存)');
        return;
    }

    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    console.log('  [OK]    ', relPath);
}

/* ─────────────────────────────────────────
   キャストスタブ生成
   cast/{id}/index.html
───────────────────────────────────────── */
function generateCastStubs() {
    console.log('\n── キャストスタブ ──────────────────────');
    let ok = 0, skip = 0;

    for (const m of members) {
        if (!m.id) continue;

        // revealLevel 0 かつ hidden: true は公開 URL 不要
        const level = typeof m.revealLevel === 'number' ? m.revealLevel : 3;
        if (m.hidden === true && level === 0) {
            console.log('  [HIDE]  ', `cast/${m.id}/  (hidden+level0)`);
            skip++;
            continue;
        }

        const name  = escHtml(m.pickupName || m.name || m.id);
        const html  = castStubHtml(m.id, name);
        writeFile(`cast/${m.id}/index.html`, html);
        ok++;
    }

    console.log(`  → ${ok} 件生成対象 / ${skip} 件スキップ`);
}

function castStubHtml(id, name) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — あにあめもりあ</title>
  <!-- スタブ: profile_loader.js が window.__memberId を優先して読む -->
  <script>window.__memberId = '${id}';</script>
  <link rel="icon" href="/assets/favicon/multi_favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="../../css/styles.css">
</head>
<body>
  <div id="header-placeholder"></div>
  <main id="main"></main>
  <div id="footer-placeholder"></div>

  <script src="../../data/site.js"></script>
  <script src="../../data/members.js"></script>
  <script src="../../js/common/utils.js"></script>
  <script src="../../js/common-layout.js"></script>
  <script>renderLayout('../../');</script>
  <script src="../../js/profile_loader.js"></script>
</body>
</html>
`;
}

/* ─────────────────────────────────────────
   ニューススタブ生成
   news/{slug}/index.html
───────────────────────────────────────── */
function generateNewsStubs() {
    console.log('\n── ニューススタブ ──────────────────────');
    let ok = 0, skip = 0;

    for (const item of newsItems) {
        if (!item.id) continue;
        if (item.hidden === true) {
            console.log('  [HIDE]  ', `news/${toSlug(item.id)}/  (hidden)`);
            skip++;
            continue;
        }

        // slug: data_news.js に slug フィールドがあればそれを優先
        const slug  = item.slug || toSlug(item.id);
        const title = escHtml(item.title || item.id);
        const html  = newsStubHtml(item.id, slug, title);
        writeFile(`news/${slug}/index.html`, html);
        ok++;
    }

    console.log(`  → ${ok} 件生成対象 / ${skip} 件スキップ`);
}

function newsStubHtml(id, slug, title) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — あにあめもりあ</title>
  <!-- スタブ: news_loader.js が window.__newsId を優先して読む -->
  <script>window.__newsId = '${id}';</script>
  <link rel="icon" href="/assets/favicon/multi_favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="../../css/styles.css">
</head>
<body>
  <div id="header-placeholder"></div>
  <main id="main"></main>
  <div id="footer-placeholder"></div>

  <script src="../../data/site.js"></script>
  <script src="../../data/news.js"></script>
  <script src="../../js/common/utils.js"></script>
  <script src="../../js/common-layout.js"></script>
  <script>renderLayout('../../');</script>
  <script src="../../js/news_loader.js"></script>
</body>
</html>
`;
}

/* ─────────────────────────────────────────
   ブログスタブ生成
   blog/{id}/index.html
───────────────────────────────────────── */
function generateBlogStubs() {
    console.log('\n── ブログスタブ ──────────────────────');
    let ok = 0, skip = 0;

    for (const item of blogItems) {
        if (!item.id) continue;
        if (item.hidden === true) {
            console.log('  [HIDE]  ', `blog/${toSlug(item.id)}/  (hidden)`);
            skip++;
            continue;
        }

        const slug  = item.slug || toSlug(item.id);
        const title = escHtml(item.title || item.id);
        const html  = blogStubHtml(item.id, slug, title);
        writeFile(`blog/${slug}/index.html`, html);
        ok++;
    }

    console.log(`  → ${ok} 件生成対象 / ${skip} 件スキップ`);
}

function blogStubHtml(id, slug, title) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — あにあめもりあ</title>
  <!-- スタブ: blog_loader.js が window.__blogId を優先して読む -->
  <script>window.__blogId = '${id}';<\/script>
  <link rel="icon" href="/assets/favicon/multi_favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="../../css/styles.css">
</head>
<body>
  <div id="header-placeholder"></div>
  <main id="main"></main>
  <div id="footer-placeholder"></div>

  <script src="../../data/site.js"><\/script>
  <script src="../../data/members.js"><\/script>
  <script src="../../data/blog.js"><\/script>
  <script src="../../js/common/utils.js"><\/script>
  <script src="../../js/common-layout.js"><\/script>
  <script>renderLayout('../../');<\/script>
  <script src="../../js/blog_loader.js"><\/script>
</body>
</html>
`;
}

/* ─────────────────────────────────────────
   メイン
───────────────────────────────────────── */
console.log('');
console.log('=== generate_stubs.js ===');
console.log(DRY   ? '[DRY RUN — ファイルを書かない]' : FORCE ? '[FORCE — 既存も上書き]' : '[通常 — 既存はスキップ]');

if (!NEWS_ONLY && !BLOG_ONLY) generateCastStubs();
if (!CAST_ONLY && !BLOG_ONLY) generateNewsStubs();
if (!CAST_ONLY && !NEWS_ONLY) generateBlogStubs();

console.log('\n完了。');

