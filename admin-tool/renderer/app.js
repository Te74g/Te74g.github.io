/**
 * renderer/app.js
 * メインウィンドウのロジック。
 * サイドバーナビ・iframe プレビュー・＋ボタンオーバーレイを管理する。
 */

'use strict';

/* ─── DOM 参照 ─── */
const setupOverlay  = document.getElementById('setup-overlay');
const openSetBtn    = document.getElementById('open-settings-btn');
const navList       = document.getElementById('nav-list');
const navItems      = Array.from(document.querySelectorAll('.nav-item'));
const settingsBtn   = document.getElementById('settings-btn');
const navReload     = document.getElementById('nav-reload');
const currentUrlEl  = document.getElementById('current-url');
const publishStatus = document.getElementById('publish-status');
const preview       = document.getElementById('preview-frame');
const overlay       = document.getElementById('overlay');

let PORT = 3939;
let currentPage = '/';

/* ─────────────────────────────
   起動チェック
───────────────────────────── */
async function init() {
    PORT = await window.api.getPort();
    const configured = await window.api.isConfigured();

    if (!configured) {
        setupOverlay.classList.add('visible');
    } else {
        navigate('/');
    }
}

/* ─────────────────────────────
   ナビゲーション
───────────────────────────── */
function navigate(url) {
    currentPage = url;
    const full = `http://127.0.0.1:${PORT}${url}`;
    preview.src = full;
    currentUrlEl.textContent = full;
    publishStatus.textContent = '';

    // サイドバーのアクティブ状態
    navItems.forEach(item => {
        item.classList.toggle('is-active', item.dataset.url === url);
    });

    // オーバーレイ更新
    updateOverlay(url);
}

/* ─────────────────────────────
   オーバーレイ（＋ボタン）
───────────────────────────── */
const OVERLAY_MAP = {
    '/cast/':             { label: 'キャストを追加',      type: 'cast' },
    '/news/':             { label: 'ニュースを追加',      type: 'news' },
    '/blog/':             { label: 'ブログ記事を追加',   type: 'blog' },
    '/aikotoba/':         { label: '合言葉を編集',        type: 'aikotoba' },
    '/partner/':          { label: 'イベントを追加',      type: 'event' },
};

function updateOverlay(url) {
    overlay.innerHTML = '';

    // 完全一致 or 前方一致でヒットするキーを探す
    let matched = null;
    for (const key of Object.keys(OVERLAY_MAP)) {
        if (url === key || url.startsWith(key)) {
            matched = OVERLAY_MAP[key];
            break;
        }
    }
    if (!matched) return;

    const btn = document.createElement('button');
    btn.className = 'add-btn';
    btn.innerHTML = `<span class="plus">＋</span><span>${matched.label}</span>`;
    btn.addEventListener('click', () => openEditor(matched.type));
    overlay.appendChild(btn);
}

/* ─────────────────────────────
   エディタを開く
───────────────────────────── */
async function openEditor(type, data) {
    await window.api.openEditor(type, data || {});
}

/* ─────────────────────────────
   プレビュー再読み込み
───────────────────────────── */
function reloadPreview() {
    // iframe を再ロード（src を再設定）
    const url = preview.src;
    preview.src = 'about:blank';
    setTimeout(() => { preview.src = url; }, 80);
}

/* ─────────────────────────────
   イベントリスナー
───────────────────────────── */
openSetBtn.addEventListener('click', () => {
    window.api.openSettings();
});

settingsBtn.addEventListener('click', () => {
    window.api.openSettings();
});

navReload.addEventListener('click', reloadPreview);

navItems.forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.url));
});

// メインプロセスからのプレビュー再読み込み要求
window.api.onPreviewReload(() => {
    reloadPreview();
    setStatus('✅ 公開しました', 'ok');
    setTimeout(() => setStatus('', ''), 5000);
});

// エディタ完了通知
window.api.onEditorDone((data) => {
    reloadPreview();
    if (data && data.message) setStatus(`✅ ${data.message}`, 'ok');
    setTimeout(() => setStatus('', ''), 5000);
});

/* ─────────────────────────────
   ステータス表示
───────────────────────────── */
function setStatus(msg, type) {
    publishStatus.textContent = msg;
    publishStatus.className = type ? `status-${type}` : '';
}

/* ─────────────────────────────
   起動
───────────────────────────── */
init();
