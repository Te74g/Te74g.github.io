/**
 * js/bootstrap/news.bootstrap.js
 * Entry point for the News page.
 */

import { bootCore } from './core.bootstrap.js';
import { loadManifest } from '../app/url.js';
import { initNewsPage } from '../pages/news.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Core Boot (Maintenance redirect, Common UI bindings, Layout injection)
    await bootCore();

    // 2. Pre-load WebP manifest for efficient image swaps
    await loadManifest();

    // 3. Mount specific Page logic
    await initNewsPage();
});
