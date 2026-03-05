const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetDirs = [path.join(__dirname, 'assets')];

async function processDirectory(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
        const fullPath = path.join(currentDir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            await processDirectory(fullPath);
        } else if (/\.(png|jpe?g)$/i.test(file)) {
            await convertImage(fullPath);
        }
    }
}

async function convertImage(filePath) {
    const dir = path.dirname(filePath);
    const parsed = path.parse(filePath);
    const webpPath = path.join(dir, `${parsed.name}.webp`);

    try {
        // Convert to webp
        await sharp(filePath)
            // .resize(1500, null, { withoutEnlargement: true }) // optional sizing
            .webp({ quality: 80, effort: 6 })
            .toFile(webpPath);

        console.log(`Converted: ${filePath} -> ${webpPath}`);

        // Delete original PNG
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

(async () => {
    console.log('Starting recursive image conversion & deletion...');
    for (const d of targetDirs) {
        await processDirectory(d);
    }
    console.log('Conversion complete!');
})();
