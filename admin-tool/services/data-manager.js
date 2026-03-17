/**
 * services/data-manager.js
 * data/*.js ファイルの読み書きを担当。
 * generate_stubs.js と同じ `new Function('window', code)` パターンで読み込む。
 */

'use strict';

const fs   = require('fs');
const path = require('path');

/* ── データ型 → ファイル名 / window変数名 マッピング ── */
const DATA_MAP = {
    members:  { file: 'data/members.js',  varName: 'membersData'      },
    news:     { file: 'data/news.js',      varName: 'newsData'         },
    blog:     { file: 'data/blog.js',      varName: 'blogData'         },
    aikotoba: { file: 'data/aikotoba.js',  varName: 'aikotobaData'     },
    events:   { file: 'data/events.js',    varName: null               }, // 複数候補あり
    gallery:  { file: 'data/gallery.js',   varName: 'galleryData'      },
    links:    { file: 'data/links.js',     varName: 'linksData'        },
};

/**
 * data/*.js を読み込んでオブジェクト（配列）を返す。
 * @param {string} sitePath サイトルートの絶対パス
 * @param {string} dataType 'members' | 'news' | 'blog' | 'aikotoba' | 'events' | ...
 * @returns {Array}
 */
function readData(sitePath, dataType) {
    const def = DATA_MAP[dataType];
    if (!def) throw new Error(`不明なデータ型: ${dataType}`);

    const filePath = path.join(sitePath, def.file);
    if (!fs.existsSync(filePath)) return [];

    const code   = fs.readFileSync(filePath, 'utf8');
    const mock   = {};
    // eslint-disable-next-line no-new-func
    new Function('window', code)(mock);

    if (def.varName) return mock[def.varName] || [];

    // events.js は varName が不定（partnerEventsData or eventsData）
    return mock.partnerEventsData || mock.eventsData || [];
}

/**
 * data/*.js を書き戻す。
 * @param {string} sitePath
 * @param {string} dataType
 * @param {Array}  items
 */
function writeData(sitePath, dataType, items) {
    if (!Array.isArray(items)) throw new Error('items は配列である必要があります');

    const def = DATA_MAP[dataType];
    if (!def) throw new Error(`不明なデータ型: ${dataType}`);

    // events の varName を自動判定
    let varName = def.varName;
    if (!varName) {
        const filePath = path.join(sitePath, def.file);
        if (fs.existsSync(filePath)) {
            const src = fs.readFileSync(filePath, 'utf8');
            varName = src.includes('partnerEventsData') ? 'partnerEventsData' : 'eventsData';
        } else {
            varName = 'eventsData';
        }
    }

    const header = buildHeader(dataType);
    const js = `${header}window.${varName} = ${serializeArray(items)};\n`;
    const filePath = path.join(sitePath, def.file);
    fs.writeFileSync(filePath, js, 'utf8');
}

/** 配列を読みやすい形にシリアライズ（template literal 内の改行は維持しない） */
function serializeArray(arr) {
    return JSON.stringify(arr, null, 4);
}

/** ファイル先頭コメント */
function buildHeader(dataType) {
    const labels = {
        members:  '* キャスト・メンバー一覧',
        news:     '* ニュース一覧',
        blog:     '* ブログ一覧',
        aikotoba: '* 合言葉一覧',
        events:   '* 提携イベント一覧',
    };
    const label = labels[dataType] || `* ${dataType}`;
    return `/*\n ${label}\n * 管理ツールによって自動生成されたファイルです。\n */\n`;
}

/* ── CRUD ヘルパー（呼び出し側で read/write を組み合わせて使う）── */

/** ID でアイテムを追加 or 更新（upsert） */
function upsertItem(sitePath, dataType, item) {
    const items  = readData(sitePath, dataType);
    const idx    = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = { ...items[idx], ...item };
    else          items.unshift(item); // 新しい順に先頭に追加
    writeData(sitePath, dataType, items);
    return items;
}

/** ID でアイテムを削除 */
function deleteItem(sitePath, dataType, id) {
    const items  = readData(sitePath, dataType);
    const filtered = items.filter(i => i.id !== id);
    writeData(sitePath, dataType, filtered);
    return filtered;
}

module.exports = { readData, writeData, upsertItem, deleteItem, DATA_MAP };
