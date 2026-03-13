/**
 * js/bootstrap/core.bootstrap.js
 * The foundational bootstrapper for all pages.
 * Handles App Kernel booting, maintenance checks, layout generation, and core UI events.
 */

import { checkMaintenanceMode } from '../app/maintenance.js';
import { renderLayout } from '../app/layout.js';
import { initMenu, initScrollEffects, initRevealAnimations } from '../common/index.js';

export async function bootCore() {
    // 1. Immediately block access if in maintenance mode
    checkMaintenanceMode();

    // 2. Build common layout (header/footer) automatically
    await renderLayout();

    // 3. Attach common UI interaction logic
    initMenu();
    initScrollEffects();
    initRevealAnimations();
}
