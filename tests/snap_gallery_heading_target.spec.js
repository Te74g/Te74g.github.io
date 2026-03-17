const { test } = require('@playwright/test');

test('snap gallery heading target', async ({ page }) => {
  await page.addInitScript(() => window.sessionStorage.setItem('maintenanceBypass', 'true'));
  await page.setViewportSize({ width: 1440, height: 949 });
  await page.goto('/gallery/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'tmp_gallery_heading_target.png', fullPage: false });
});
