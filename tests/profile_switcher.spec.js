const { test, expect } = require('@playwright/test');

test.describe('Profile Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('maintenanceBypass', 'true');
      window.sessionStorage.setItem('debugMode', 'true');
    });
  });

  test('cast profile has a working image switcher', async ({ page }) => {
    await page.goto('/cast/aki/', { waitUntil: 'networkidle' });

    await expect(page.locator('.profile-switcher-container')).toBeVisible();
    const slideCount = await page.locator('.profile-switcher-container .profile-slide').count();
    expect(slideCount).toBeGreaterThan(1);

    const hasGlobal = await page.evaluate(() => typeof window.ProfileImageSwitcher === 'function');
    expect(hasGlobal).toBeTruthy();

    const container = page.locator('.profile-switcher-container');
    const box = await container.boundingBox();
    expect(box).not.toBeNull();

    const centerY = box.y + box.height / 2;
    await page.mouse.move(box.x + 2, centerY);
    await page.waitForTimeout(180);
    const leftIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.profile-switcher-container .profile-slide'));
      return slides.findIndex((s) => s.classList.contains('is-active'));
    });

    await page.mouse.move(box.x + box.width - 2, centerY);
    await page.waitForTimeout(180);
    const rightIndex = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.profile-switcher-container .profile-slide'));
      return slides.findIndex((s) => s.classList.contains('is-active'));
    });

    expect(leftIndex).toBeGreaterThanOrEqual(0);
    expect(rightIndex).toBeGreaterThanOrEqual(0);
    expect(rightIndex).not.toBe(leftIndex);
  });
});
