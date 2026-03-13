const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && !dirPath.includes('node_modules') && !dirPath.includes('.git') && !dirPath.includes('.github')) {
            walkDir(dirPath, callback);
        } else if (dirPath.endsWith('.html')) {
            callback(dirPath);
        }
    });
}

const replacements = [
    { from: /_config\/data_members\.js/g, to: 'data/members.js' },
    { from: /_config\/data_news\.js/g, to: 'data/news.js' },
    { from: /_config\/data_events\.js/g, to: 'data/events.js' },
    { from: /_config\/data_gallery\.js/g, to: 'data/gallery.js' },
    { from: /_config\/data_links\.js/g, to: 'data/links.js' },
    { from: /_config\/data_site\.js/g, to: 'data/site.js' },
    { from: /_config\/data_aikotoba\.js/g, to: 'data/aikotoba.js' }
];

walkDir('.', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Data Paths in ${filePath}`);
    }
});
