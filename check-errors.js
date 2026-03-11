const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`PAGE ERROR: "${msg.text()}"`);
        } else {
            console.log(`LOG: ${msg.text()}`);
        }
    });

    page.on('pageerror', exception => {
        console.log(`UNCAUGHT EXCEPTION: "${exception}"`);
    });

    try {
        await page.goto('http://localhost:8000/pages/people.html', { waitUntil: 'networkidle' });
        console.log('Page loaded completely.');

        await page.screenshot({ path: 'debug_people.png' });
        const mainHtml = await page.$eval('main', el => el.innerHTML);
        console.log('MAIN HTML IS:', mainHtml);
    } catch (e) {
        console.error("Failed to load page", e);
    }
    await browser.close();
})();
