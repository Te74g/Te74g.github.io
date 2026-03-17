const { test, expect } = require('@playwright/test');

test.describe('Footer links', () => {
  const routes = [
    '/',
    '/news/',
    '/gallery/',
    '/cast/',
    '/cast/aki/',
    '/partner/',
    '/links/',
    '/aikotoba/',
    '/pages/top_preview.html',
    '/terms/',
    '/privacy/',
    '/contact/',
    '/news/grand-open-20260308/',
    '/news/article/',
    '/partner_events/event/',
    '/member/profile/',
    '/member/profile.html?id=aki',
    '/maintenance/',
    '/maintenance.html',
  ];

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('maintenanceBypass', 'true');
    });
  });

  test('terms/privacy/contact links resolve on each route', async ({ page, request, baseURL }) => {
    const failures = [];

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const hrefs = await page.$$eval('.footer-links a', (anchors) =>
        anchors.map((a) => a.getAttribute('href')).filter(Boolean)
      );
      const headerHrefs = await page.$$eval('.pc-nav .nav-item', (anchors) =>
        anchors.map((a) => a.getAttribute('href')).filter(Boolean)
      );

      if (hrefs.length === 0) {
        failures.push(`${route}: no footer links found`);
        continue;
      }

      for (const href of hrefs) {
        const isNestedStubRoute =
          (route.startsWith('/cast/') && route !== '/cast/')
          || route.startsWith('/news/grand-open-')
          || route.startsWith('/member/profile.html');

        if (isNestedStubRoute) {
          if (!href.startsWith('../../')) {
            failures.push(`${route}: nested page footer href should start with ../../ but got ${href}`);
          }
        }

        const url = new URL(href, page.url());
        const response = await request.get(url.toString());
        if (!response.ok()) {
          failures.push(`${route}: ${href} -> HTTP ${response.status()} (${url.toString()})`);
        }
      }

      for (const href of headerHrefs) {
        const isNestedStubRoute =
          (route.startsWith('/cast/') && route !== '/cast/')
          || route.startsWith('/news/grand-open-')
          || route.startsWith('/member/profile.html');
        if (isNestedStubRoute && !href.startsWith('../../')) {
          failures.push(`${route}: nested page header href should start with ../../ but got ${href}`);
        }
      }
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('profile routes resolve header partner link to /partner/', async ({ page, baseURL }) => {
    const routesToCheck = ['/cast/aki/', '/member/profile.html?id=aki'];
    const failures = [];

    for (const route of routesToCheck) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const href = await page.locator('.pc-nav .nav-item[href*="partner/"]').first().getAttribute('href');
      if (!href) {
        failures.push(`${route}: PARTNER href missing`);
        continue;
      }

      const resolved = new URL(href, page.url());
      if (resolved.pathname !== '/partner/') {
        failures.push(`${route}: PARTNER resolves to ${resolved.pathname}`);
      }
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('legal page content is visible without ui.js reveal init', async ({ page }) => {
    const legalRoutes = ['/privacy/', '/terms/', '/contact/', '/pages/privacy.html', '/pages/terms.html', '/pages/contact.html'];

    for (const route of legalRoutes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const hiddenRevealCount = await page.$$eval('.reveal:not(.is-visible)', (nodes) =>
        nodes.filter((n) => getComputedStyle(n).opacity === '0').length
      );
      expect(hiddenRevealCount, `${route}: reveal elements remained hidden`).toBe(0);
    }
  });
});
