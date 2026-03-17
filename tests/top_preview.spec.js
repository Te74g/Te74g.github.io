const { test, expect } = require('@playwright/test');

test.describe('Top Preview Route', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            window.sessionStorage.setItem('maintenanceBypass', 'true');
        });
    });

    test('redirects to root and renders the production top page', async ({ page }) => {
        await page.goto('/pages/top_preview.html', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/\/$/);
        await expect(page.locator('#hero-section')).toBeVisible();
        await expect(page.locator('.scroll-indicator')).toBeVisible();
    });

    test('preserves query and hash when redirecting', async ({ page }) => {
        await page.goto('/pages/top_preview.html?from=preview#peek', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        const current = new URL(page.url());
        expect(current.pathname).toBe('/');
        expect(current.searchParams.get('from')).toBe('preview');
        expect(current.hash).toBe('#peek');
    });
});
