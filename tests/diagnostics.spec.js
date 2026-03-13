const { test, expect } = require('@playwright/test');

test.describe('Diagnostics - Runtime Errors and Broken Requests', () => {
    const routes = [
        '/',
        '/pages/top_preview.html',
        '/cast/',
        '/gallery/',
        '/gallery/more/',
        '/news/',
        '/news/article/?id=grand-open-20260308',
        '/partner/',
        '/partner_events/event/?id=kitsunekotan',
        '/links/',
        '/aikotoba/',
        '/maintenance/'
    ];

    test('no same-origin runtime errors across key routes', async ({ context, baseURL }) => {
        const origin = new URL(baseURL).origin;
        const pageErrors = [];
        const failed = [];

        for (const route of routes) {
            const page = await context.newPage();

            page.on('pageerror', (err) => {
                pageErrors.push(`${route}: ${String(err)}`);
            });

            page.on('requestfailed', (request) => {
                const url = request.url();
                if (!url.startsWith(origin)) return;
                const reason = request.failure()?.errorText || 'unknown';
                // Navigation/page-close timing can produce benign aborted requests.
                if (reason.includes('ERR_ABORTED')) return;
                failed.push(`${route}: requestfailed: ${request.method()} ${url} (${reason})`);
            });

            page.on('response', (response) => {
                const url = response.url();
                if (!url.startsWith(origin)) return;
                if (response.status() >= 400) {
                    failed.push(`${route}: http${response.status()}: ${response.request().method()} ${url}`);
                }
            });

            await page.goto(route, { waitUntil: 'networkidle' });
            await page.waitForTimeout(300);
            await page.close();
        }

        expect(pageErrors, `Page errors:\n${pageErrors.join('\n')}`).toEqual([]);
        expect(failed, `Failed same-origin requests:\n${failed.join('\n')}`).toEqual([]);
    });
});
