/**
 * js/bootstrap/blog.bootstrap.js
 * Entry point for the Blog listing page.
 */

import { bootCore } from './core.bootstrap.js';
import { loadManifest } from '../app/url.js';
import { initBlogPage } from '../pages/blog.js';

document.addEventListener('DOMContentLoaded', async () => {
    await bootCore();
    await loadManifest();
    await initBlogPage();
});
