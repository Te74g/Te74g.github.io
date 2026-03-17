/**
 * preload.js
 * Secure IPC bridge between renderer and main process.
 * Exposed as window.api in all renderer/editor windows.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    /* ── 設定 ── */
    getSetting:    (key)         => ipcRenderer.invoke('get-setting', key),
    setSetting:    (key, value)  => ipcRenderer.invoke('set-setting', key, value),
    getAllSettings: ()            => ipcRenderer.invoke('get-all-settings'),
    isConfigured:  ()            => ipcRenderer.invoke('is-configured'),

    /* ── データ読み書き ── */
    readData:  (dataType)          => ipcRenderer.invoke('data-read', dataType),
    writeData: (dataType, items)   => ipcRenderer.invoke('data-write', dataType, items),

    /* ── GitHub コミット ── */
    commitToGitHub: (filePaths, message) => ipcRenderer.invoke('github-commit', filePaths, message),

    /* ── 画像 ── */
    pickImage:          ()                       => ipcRenderer.invoke('pick-image'),
    pickImages:         ()                       => ipcRenderer.invoke('pick-images'),
    copyImageToAssets:  (localPath, destRelPath) => ipcRenderer.invoke('copy-image-to-assets', localPath, destRelPath),

    /* ── スタブ生成 ── */
    runStubs: (flags) => ipcRenderer.invoke('run-stubs', flags),

    /* ── エディタ ── */
    openEditor:   (type, data) => ipcRenderer.invoke('open-editor', type, data),
    closeEditor:  ()           => ipcRenderer.invoke('close-editor'),

    /* ── 設定ウィンドウ ── */
    openSettings: ()           => ipcRenderer.invoke('open-settings'),
    browseFolder: ()           => ipcRenderer.invoke('browse-folder'),
    restartServer: ()          => ipcRenderer.invoke('restart-server'),
    getPort:      ()           => ipcRenderer.invoke('get-port'),

    /* ── GitHub 接続テスト ── */
    testGitHubConnection: (token, owner, repo) =>
        ipcRenderer.invoke('test-github-connection', token, owner, repo),

    /* ── レンダラー → レンダラー通知 ── */
    onInit:          (cb) => ipcRenderer.on('init-editor',     (_, d) => cb(d)),
    onPreviewReload: (cb) => ipcRenderer.on('reload-preview',  ()     => cb()),
    onEditorDone:    (cb) => ipcRenderer.on('editor-done',     (_, d) => cb(d)),
});
