/**
 * js/bootstrap/people.bootstrap.js
 * Entry point for the People page.
 */

import { bootCore } from './core.bootstrap.js';
import { loadManifest } from '../app/url.js';
import { initPeoplePage } from '../pages/people.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Core Boot (Maintenance redirect, Common UI bindings, Layout injection)
    await bootCore();

    // 2. Pre-load WebP manifest for efficient image swaps
    await loadManifest();

    // 3. Mount specific Page logic
    await initPeoplePage();
});
