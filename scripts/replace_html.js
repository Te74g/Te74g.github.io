const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && !dirPath.includes('node_modules') && !dirPath.includes('.git') && !dirPath.includes('.github') && !dirPath.includes('js') && !dirPath.includes('css')) {
            walkDir(dirPath, callback);
        } else if (dirPath.endsWith('.html')) {
            callback(dirPath);
        }
    });
}

const replacements = [
    { from: /<script src="\.\.\/js\/common-layout\.js"><\/script>/g, to: '' },
    { from: /<script src="js\/common-layout\.js"><\/script>/g, to: '' },
    { from: /<script src="\.\.\/\.\.\/js\/common-layout\.js"><\/script>/g, to: '' },
    { from: /<script>\s*renderLayout\([^)]*\);\s*<\/script>/g, to: '' },
    { from: /<script src="\.\.\/js\/ui\.js" defer><\/script>/g, to: '<script type="module">import { initUI } from "../js/ui.js"; initUI();</script>' },
    { from: /<script src="js\/ui\.js" defer><\/script>/g, to: '<script type="module">import { initUI } from "./js/ui.js"; initUI();</script>' },
    { from: /<script src="\.\.\/\.\.\/js\/ui\.js" defer><\/script>/g, to: '<script type="module">import { initUI } from "../../js/ui.js"; initUI();</script>' },
    // Catch cases without defer just in case
    { from: /<script src="\.\.\/js\/ui\.js"><\/script>/g, to: '<script type="module">import { initUI } from "../js/ui.js"; initUI();</script>' },
    { from: /<script src="js\/ui\.js"><\/script>/g, to: '<script type="module">import { initUI } from "./js/ui.js"; initUI();</script>' },
    { from: /<script src="\.\.\/\.\.\/js\/ui\.js"><\/script>/g, to: '<script type="module">import { initUI } from "../../js/ui.js"; initUI();</script>' }
];

walkDir('.', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});
