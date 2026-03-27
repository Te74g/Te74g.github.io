const { test, expect } = require('@playwright/test');

test.describe('Smoke Tests - General Routing & Interaction', () => {

    test.beforeEach(async ({ page }) => {
        // Bypass the legacy maintenance redirect logic during automated tests
        await page.addInitScript(() => {
            window.sessionStorage.setItem('maintenanceBypass', 'true');
        });
    });

    test('Top page preview resolves and renders without errors', async ({ page }) => {
        // Go to the index page
        await page.goto('/');

        // Check that we don't hit the maintenance page unintentionally
        const title = await page.title();
        expect(title).not.toMatch(/メンテナンス/i);

        // Ensure the main Hero section is visible
        const hero = page.locator('#hero-section');
        await expect(hero).toBeVisible();
    });

    test('People Page - URL tags filter rendering correctly without halting', async ({ page }) => {
        // Direct navigation with the tag "飼育"
        await page.goto('/cast/?tag=飼育');

        // Wait for the tag buttons to render and expect "飼育" to be the only active one
        const activeBtn = page.locator('.tag-filter-btn.is-active');
        await expect(activeBtn).toHaveText('飼育');

        // Make sure the 飼育 section is the only one visible on initial load
        const visibleSections = page.locator('.people-section-wrapper:visible');
        await expect(visibleSections).toHaveCount(1);
        await expect(visibleSections).toHaveAttribute('data-section', '飼育区画');
    });

    test('People Page - Click filtering does not freeze or reset inappropriately', async ({ page }) => {
        await page.goto('/cast/');

        // Initially all should be active
        let activeBtn = page.locator('.tag-filter-btn.is-active');
        await expect(activeBtn).toHaveText('すべて');

        // Click on 妖怪
        await page.locator('.tag-filter-btn[data-value="妖怪"]').click();
        activeBtn = page.locator('.tag-filter-btn.is-active');
        await expect(activeBtn).toHaveText('妖怪');

        // Verify 妖怪 is visible
        const visibleSections = page.locator('.people-section-wrapper:visible');
        await expect(visibleSections).toHaveCount(1);
        await expect(visibleSections).toHaveAttribute('data-section', '妖怪区画');
    });

});
