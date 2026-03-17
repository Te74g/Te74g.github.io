/**
 * services/github-api.js
 * GitHub REST API を使ってファイルをコミットする。
 * @octokit/rest を使用。
 */

'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * 複数ファイルをまとめてコミット（1ファイルずつ PUT）。
 *
 * @param {string}   token      GitHub Personal Access Token
 * @param {string}   owner      リポジトリオーナー（例: "Te74g"）
 * @param {string}   repo       リポジトリ名（例: "Te74g.github.io"）
 * @param {string}   branch     ブランチ名（例: "main"）
 * @param {string}   sitePath   ローカルのサイトルートパス
 * @param {string[]} filePaths  コミット対象ファイルのリポジトリ相対パス（例: ["data/members.js"]）
 * @param {string}   message    コミットメッセージ
 */
async function commitFiles(token, owner, repo, branch, sitePath, filePaths, message) {
    // @octokit/rest は ESM と CJS 両方対応（v20）
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: token });

    for (const repoPath of filePaths) {
        const localPath = path.join(sitePath, repoPath);
        if (!fs.existsSync(localPath)) {
            console.warn(`[github-api] ファイルが存在しません: ${localPath}`);
            continue;
        }

        const content = fs.readFileSync(localPath);
        const encoded = content.toString('base64');

        // 既存 SHA を取得（ファイル更新に必要。新規なら undefined でOK）
        let sha;
        try {
            const { data } = await octokit.repos.getContent({
                owner, repo, path: repoPath, ref: branch,
            });
            sha = data.sha;
        } catch (e) {
            if (e.status !== 404) throw e;
            // 404 = 新規ファイル → sha なしで作成
        }

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path:    repoPath,
            message: `[admin] ${message}`,
            content: encoded,
            sha,
            branch,
        });

        console.log(`[github-api] committed: ${repoPath}`);
    }
}

/**
 * 画像ファイルをバイナリでアップロード。
 * commitFiles と同じ仕組みだが localPath を直接受け取る。
 */
async function uploadImage(token, owner, repo, branch, localPath, repoPath) {
    return commitFiles(token, owner, repo, branch, path.dirname(localPath), [path.basename(localPath)], `upload image: ${repoPath}`);
}

module.exports = { commitFiles, uploadImage };
