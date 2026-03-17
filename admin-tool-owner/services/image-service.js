/**
 * services/image-service.js
 * 選択された画像をサイトの assets/ フォルダにコピーする。
 */

'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * ローカル画像を assets/ 以下の指定パスにコピーする。
 *
 * @param {string} sitePath    サイトルートの絶対パス
 * @param {string} localPath   コピー元ファイルの絶対パス
 * @param {string} destRelPath コピー先のリポジトリ相対パス（例: "assets/blog/2026-03-14/eyecatch.jpg"）
 * @returns {string} destRelPath（成功時）
 */
function copyToAssets(sitePath, localPath, destRelPath) {
    if (!fs.existsSync(localPath)) {
        throw new Error(`ファイルが見つかりません: ${localPath}`);
    }

    const destPath = path.join(sitePath, destRelPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(localPath, destPath);
    console.log(`[image-service] copied: ${localPath} → ${destPath}`);
    return destRelPath;
}

/**
 * ファイル名から安全なスラッグを生成する。
 * 日本語ファイル名対策。
 * @param {string} originalName 元のファイル名（拡張子付き）
 * @returns {string}
 */
function safeName(originalName) {
    const ext  = path.extname(originalName).toLowerCase();
    const base = path.basename(originalName, ext)
        .replace(/[^\w\-]/g, '_')
        .replace(/__+/g, '_')
        .slice(0, 40);
    return `${base || 'image'}${ext}`;
}

/**
 * 今日の日付フォルダ名を返す（例: "2026-03-14"）
 */
function todayFolder() {
    return new Date().toISOString().slice(0, 10);
}

module.exports = { copyToAssets, safeName, todayFolder };
