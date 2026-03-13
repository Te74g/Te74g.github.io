/**
 * js/app/maintenance.js
 * Centralized maintenance mode redirect logic.
 * This should run first before initializing layout or other complex DOM interactions.
 */

import { getSiteConfig } from './data.js';

export function checkMaintenanceMode() {
    // メンテナンスページ自身はスキップ
    if (window.location.pathname.includes('/maintenance/') || window.location.pathname.includes('maintenance.html')) return;

    // メンテナンスモードの裏技解除フラグ（セッション中有効）またはデバッグモードが立っていればスキップ
    const bypass = sessionStorage.getItem('maintenanceBypass') === 'true' || sessionStorage.getItem('debugMode') === 'true';
    if (bypass) return;

    // siteConfigのメンテナンスモードをチェック
    const config = getSiteConfig();
    if (config?.maintenanceMode) {
        // 相対パスでmaintenance.htmlにリダイレクト
        const basePath = window.fixPath ? window.fixPath('maintenance/') : './maintenance/';
        window.location.href = basePath;
    }
}
