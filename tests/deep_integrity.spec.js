const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

function getCastRoutes() {
    const castRoot = path.resolve(__dirname, '../cast');
    return fs.readdirSync(castRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => `/cast/${entry.name}/`)
        .sort();
}

function getNewsStubRoutes() {
    const newsRoot = path.resolve(__dirname, '../news');
    return fs.readdirSync(newsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => name !== 'article')
        .map((name) => `/news/${name}/`)
        .sort();
}

function isSkippableHref(href) {
    if (!href) return true;
    const lower = href.trim().toLowerCase();
    return (
        lower.startsWith('#') ||
        lower.startsWith('mailto:') ||
        lower.startsWith('tel:') ||
        lower.startsWith('javascript:') ||
        lower === '/'
    );
}

test.describe('Deep integrity diagnostics', () => {
    test('no same-origin runtime/request failures across key routes and cast profiles', async ({ context, baseURL }) => {
        test.setTimeout(240000);
        const origin = new URL(baseURL).origin;
        const castRoutes = getCastRoutes();
        const newsStubRoutes = getNewsStubRoutes();
        const routes = [
            '/',
            '/pages/top_preview.html',
            '/cast/',
            '/news/',
            '/gallery/',
            '/partner/',
            '/links/',
            '/aikotoba/',
            '/privacy/',
            '/terms/',
            '/contact/',
            ...newsStubRoutes,
            ...castRoutes
        ];

        const pageErrors = [];
        const consoleErrors = [];
        const requestFailures = [];

        for (const route of routes) {
            const page = await context.newPage();
            await page.addInitScript(() => {
                window.sessionStorage.setItem('maintenanceBypass', 'true');
            });

            page.on('pageerror', (err) => {
                pageErrors.push(`${route}: ${String(err)}`);
            });

            page.on('console', (msg) => {
                if (msg.type() !== 'error') return;
                const text = msg.text();
                if (!text) return;
                if (text.includes('Failed to load resource')) return;
                consoleErrors.push(`${route}: ${text}`);
            });

            page.on('requestfailed', (request) => {
                const url = request.url();
                if (!url.startsWith(origin)) return;
                const reason = request.failure()?.errorText || 'unknown';
                if (reason.includes('ERR_ABORTED')) return;
                requestFailures.push(`${route}: requestfailed: ${request.method()} ${url} (${reason})`);
            });

            page.on('response', (response) => {
                const url = response.url();
                if (!url.startsWith(origin)) return;
                const status = response.status();
                if (status >= 400) {
                    requestFailures.push(`${route}: http${status}: ${response.request().method()} ${url}`);
                }
            });

            await page.goto(route, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(100);

            // Resolve every internal anchor on the page and verify it does not 404.
            const hrefs = await page.$$eval('a[href]', (nodes) => (
                nodes.map((node) => node.getAttribute('href') || '')
            ));

            const uniqueTargets = [...new Set(hrefs)]
                .filter((href) => !isSkippableHref(href));

            for (const href of uniqueTargets) {
                let target;
                try {
                    target = new URL(href, page.url());
                } catch {
                    continue;
                }
                if (target.origin !== origin) continue;
                const targetPath = `${target.pathname}${target.search}`;
                const response = await page.request.get(targetPath, { timeout: 5000 });
                if (response.status() >= 400) {
                    requestFailures.push(`${route}: anchor->${targetPath} returned ${response.status()}`);
                }
            }

            await page.close();
        }

        expect(pageErrors, `Page errors:\n${pageErrors.join('\n')}`).toEqual([]);
        expect(consoleErrors, `Console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
        expect(requestFailures, `Request failures:\n${requestFailures.join('\n')}`).toEqual([]);
    });
});
