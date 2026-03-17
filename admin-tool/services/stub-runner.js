/**
 * services/stub-runner.js
 * scripts/generate_stubs.js を child_process で実行する。
 */

'use strict';

const { execFile } = require('child_process');
const path = require('path');
const fs   = require('fs');

/**
 * @param {string}   sitePath サイトルートの絶対パス
 * @param {string[]} flags    追加フラグ（例: ['--cast'], ['--news'], ['--blog'], ['--force']）
 */
function run(sitePath, flags = []) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(sitePath, 'scripts', 'generate_stubs.js');

        if (!fs.existsSync(scriptPath)) {
            return reject(new Error(`generate_stubs.js が見つかりません: ${scriptPath}`));
        }

        const args = [scriptPath, '--force', ...flags];

        // process.execPath は Electron バイナリを指すため使えない。
        // 'node' コマンドを PATH から使用する（Node.js インストール必須環境を前提）
        const nodePath = 'node';

        execFile(nodePath, args, { cwd: sitePath, timeout: 30000 }, (err, stdout, stderr) => {
            if (err) {
                console.error('[stub-runner] Error:', err.message);
                console.error('[stub-runner] stderr:', stderr);
                reject(new Error(`スタブ生成に失敗しました: ${err.message}`));
            } else {
                console.log('[stub-runner] stdout:', stdout);
                resolve({ stdout, stderr });
            }
        });
    });
}

module.exports = { run };
