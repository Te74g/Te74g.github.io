const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

function read(relativePath) {
    const fullPath = path.resolve(__dirname, '..', relativePath);
    return fs.readFileSync(fullPath, 'utf8');
}

function expectIncludes(html, marker) {
    expect(html.includes(marker), `Expected marker not found: ${marker}`).toBeTruthy();
}

function expectExcludes(html, marker) {
    expect(html.includes(marker), `Unexpected marker found: ${marker}`).toBeFalsy();
}

test.describe('Entrypoint consistency (bootstrap vs legacy)', () => {
    test('home page uses bootstrap entry only', async () => {
        const html = read('index.html');
        expectIncludes(html, 'js/bootstrap/home.bootstrap.js');
        expectExcludes(html, 'js/ui.js');
        expectExcludes(html, 'js/common-layout.js');
    });

    test('cast page uses people bootstrap entry only', async () => {
        const html = read('cast/index.html');
        expectIncludes(html, 'js/bootstrap/people.bootstrap.js');
        expectExcludes(html, 'js/ui.js');
        expectExcludes(html, 'js/common-layout.js');
        expectExcludes(html, 'js/people.js');
    });

    test('news and gallery pages use bootstrap entry only', async () => {
        const newsHtml = read('news/index.html');
        expectIncludes(newsHtml, 'js/bootstrap/news.bootstrap.js');
        expectExcludes(newsHtml, 'js/ui.js');
        expectExcludes(newsHtml, 'js/common-layout.js');

        const galleryHtml = read('gallery/index.html');
        expectIncludes(galleryHtml, 'js/bootstrap/gallery.bootstrap.js');
        expectExcludes(galleryHtml, 'js/ui.js');
        expectExcludes(galleryHtml, 'js/common-layout.js');
    });

    test('top preview route does not depend on legacy top.js', async () => {
        const html = read('pages/top_preview.html');
        expectExcludes(html, 'js/top.js');
        expectIncludes(html, 'window.location.replace');
    });
});
