const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
    page.on('pageerror', err => console.log(`PAGE ERR: ${err}`));

    try {
        await page.goto('http://localhost:8000/gallery/index.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        const html = await page.content();
        console.log("HTML DUMP START");
        console.log(html.substring(0, 1500)); // Just the head and start of body
        console.log("HTML DUMP END");

    } catch (e) {
        console.error("Script failed", e);
    }
    await browser.close();
})();
