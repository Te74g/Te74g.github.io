/**
 * renderer/app.js [運営版]
 * メインウィンドウのロジック。
 * 運営パネル（アイテム一覧 + 編集/削除）付き。
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

let previewBase = '';
let currentPage = '/';

/* ─────────────────────────────
   起動チェック
───────────────────────────── */
async function init() {
    const info = await window.api.getPreviewInfo();
    previewBase = info.base;
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
    const full = previewBase + url;
    preview.src = full;
    currentUrlEl.textContent = full;
    publishStatus.textContent = '';

    navItems.forEach(item => {
        item.classList.toggle('is-active', item.dataset.url === url);
    });

    updateOverlay(url);
}

/* ─────────────────────────────
   オーバーレイ設定
───────────────────────────── */
const OVERLAY_MAP = {
    '/cast/':     { label: 'キャストを追加',    type: 'cast',    dataType: 'members' },
    '/news/':     { label: 'ニュースを追加',    type: 'news',    dataType: 'news'    },
    '/blog/':     { label: 'ブログ記事を追加',  type: 'blog',    dataType: 'blog'    },
    '/aikotoba/': { label: '合言葉を編集',      type: 'aikotoba',dataType: 'aikotoba'},
    '/partner/':  { label: 'イベントを追加',    type: 'event',   dataType: 'events'  },
};

/* アイテムの表示ラベルを作る */
function itemLabel(dataType, item) {
    if (dataType === 'members') return item.name || item.id;
    if (dataType === 'events')  return item.name || item.id;
    // news / blog
    const date = item.date ? ` (${item.date})` : '';
    return (item.title || item.id) + date;
}

/* エディタに渡すデータキー */
function itemKey(dataType) {
    return { members: 'member', news: 'article', blog: 'article', events: 'event' }[dataType] || 'item';
}

/* ─────────────────────────────
   運営パネル描画
───────────────────────────── */
async function updateOverlay(url) {
    overlay.innerHTML = '';

    let matched = null;
    for (const key of Object.keys(OVERLAY_MAP)) {
        if (url === key || url.startsWith(key)) {
            matched = { urlKey: key, ...OVERLAY_MAP[key] };
            break;
        }
    }
    if (!matched) return;

    /* ── ＋追加ボタン ── */
    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn';
    addBtn.innerHTML = `<span class="plus">＋</span><span>${matched.label}</span>`;
    addBtn.addEventListener('click', () => openEditor(matched.type));
    overlay.appendChild(addBtn);

    /* ── aikotoba は一覧不要（エディタ側で全件表示）── */
    if (matched.dataType === 'aikotoba') return;

    /* ── 運営パネル（アイテム一覧）── */
    const panel = document.createElement('div');
    panel.className = 'op-panel';

    const panelHeader = document.createElement('div');
    panelHeader.className = 'op-panel-header';
    panelHeader.textContent = '既存アイテム';
    panel.appendChild(panelHeader);

    // データ読み込み
    let items = [];
    try {
        items = await window.api.readData(matched.dataType);
    } catch (e) {
        const errEl = document.createElement('p');
        errEl.className = 'op-empty';
        errEl.textContent = 'データ読み込み失敗';
        panel.appendChild(errEl);
        overlay.appendChild(panel);
        return;
    }

    if (!items || items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'op-empty';
        empty.textContent = 'アイテムがありません';
        panel.appendChild(empty);
    } else {
        const list = document.createElement('div');
        list.className = 'op-list';

        for (const item of items) {
            const row = document.createElement('div');
            row.className = 'op-item';

            const nameEl = document.createElement('span');
            nameEl.className = 'op-item-name';
            nameEl.textContent = itemLabel(matched.dataType, item);
            row.appendChild(nameEl);

            const actions = document.createElement('span');
            actions.className = 'op-item-actions';

            /* ✏️ 編集 */
            const editBtn = document.createElement('button');
            editBtn.className = 'op-edit';
            editBtn.title = '編集';
            editBtn.textContent = '✏️';
            editBtn.addEventListener('click', () => {
                const data = { [itemKey(matched.dataType)]: item };
                openEditor(matched.type, data);
            });

            /* 🗑️ 削除 */
            const delBtn = document.createElement('button');
            delBtn.className = 'op-delete';
            delBtn.title = '削除';
            delBtn.textContent = '🗑️';
            delBtn.addEventListener('click', async () => {
                const label = itemLabel(matched.dataType, item);
                if (!confirm(`「${label}」を削除しますか？\nこの操作は元に戻せません。`)) return;

                delBtn.disabled = true;
                delBtn.textContent = '⏳';
                setStatus('削除中...', '');
                try {
                    await window.api.deleteItem(matched.dataType, item.id);
                    setStatus('✅ 削除しました', 'ok');
                    setTimeout(() => setStatus('', ''), 4000);
                    reloadPreview();
                } catch (err) {
                    setStatus(`❌ ${err.message}`, 'err');
                    delBtn.disabled = false;
                    delBtn.textContent = '🗑️';
                }
            });

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            row.appendChild(actions);
            list.appendChild(row);
        }
        panel.appendChild(list);
    }

    overlay.appendChild(panel);
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
    const url = preview.src;
    preview.src = 'about:blank';
    setTimeout(() => {
        preview.src = url;
        // 再読み込み後にパネルも更新
        setTimeout(() => updateOverlay(currentPage), 800);
    }, 80);
}

/* ─────────────────────────────
   イベントリスナー
───────────────────────────── */
openSetBtn.addEventListener('click', () => window.api.openSettings());
settingsBtn.addEventListener('click', () => window.api.openSettings());
navReload.addEventListener('click', reloadPreview);

navItems.forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.url));
});

window.api.onPreviewReload(() => {
    reloadPreview();
    setStatus('✅ 公開しました', 'ok');
    setTimeout(() => setStatus('', ''), 5000);
});

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
