/**
 * js/bootstrap/home.bootstrap.js
 * Entry point for the Home (Top) page.
 */

import { bootCore } from './core.bootstrap.js';
import { loadManifest } from '../app/url.js';
import { initHomePage } from '../pages/top.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Core Boot (Maintenance redirect, Common UI bindings, Layout injection)
    await bootCore();

    // 2. Pre-load WebP manifest for efficient image swaps
    await loadManifest();

    // 3. Mount specific Page logic
    await initHomePage();
});
