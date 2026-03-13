const { test, expect } = require('@playwright/test');

test.describe('Top Preview - Links and Motion', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            window.sessionStorage.setItem('maintenanceBypass', 'true');
        });
    });

    test('injects content and keeps key links valid', async ({ page }) => {
        await page.goto('/pages/top_preview.html', { waitUntil: 'networkidle' });

        const kvImg = page.locator('#top-kv-img');
        const logoImg = page.locator('#top-logo-img');
        await expect(kvImg).toHaveAttribute('src', /.+/);
        await expect(logoImg).toHaveAttribute('src', /.+/);

        const castCards = page.locator('#top-cast-grid .top-cast-card');
        const newsCards = page.locator('#top-latest-cards .top-news-card');
        await expect(castCards).toHaveCount(4);
        await expect(newsCards).toHaveCount(1);

        const castHref = await castCards.first().getAttribute('href');
        const newsHref = await newsCards.first().getAttribute('href');
        expect(castHref).toMatch(/\/cast\/[^/]+\/$/);
        expect(newsHref).toMatch(/(?:^|\.{2}\/)news\/$/);

        await expect(page.locator('a.top-btn--primary')).toHaveAttribute('href', /(?:^|\.{2}\/)cast\/$/);
        await expect(page.locator('a.top-btn--secondary')).toHaveAttribute('href', /(?:^|\.{2}\/)schedule\/$/);
        await expect(page.locator('#top-guide a[href$=\"news/\"]')).toBeVisible();
    });

    test('updates KV transform on scroll (morph animation works)', async ({ page }) => {
        await page.goto('/pages/top_preview.html', { waitUntil: 'networkidle' });

        const before = await page.locator('#top-kv').evaluate((el) => getComputedStyle(el).transform);

        await page.evaluate(() => {
            const hero = document.getElementById('top-hero');
            if (!hero) return;
            const travel = hero.offsetHeight - window.innerHeight;
            window.scrollTo(0, hero.offsetTop + travel * 0.72);
        });
        await page.waitForTimeout(200);

        const after = await page.locator('#top-kv').evaluate((el) => getComputedStyle(el).transform);
        expect(after).not.toBe(before);
    });
});
