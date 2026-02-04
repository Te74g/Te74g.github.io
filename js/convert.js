const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputRoot = path.join(__dirname, '../assets');
const outputRoot = path.join(__dirname, '../assets_webp');
const manifestPath = path.join(__dirname, 'image_manifest.json');

const imageManifest = {};

/**
 * フォルダ内を再帰的に探索して画像を変換する
 */
async function processDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
        const fullPath = path.join(currentDir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // フォルダなら中身を探索
            await processDirectory(fullPath);
        } else if (/\.(png|jpe?g)$/i.test(file)) {
            // 画像なら変換処理
            await convertImage(fullPath);
        }
    }
}

/**
 * 個別の画像を変換し、出力先ディレクトリを自動生成する
 */
async function convertImage(filePath) {
    // assets/ からの相対パスを取得 (例: characters/miku.png)
    const relativePath = path.relative(inputRoot, filePath);
    const parsed = path.parse(relativePath);
    const filename = parsed.name;
    const subDir = parsed.dir;

    // 出力先のフルパスとフォルダを作成
    const outputDir = path.join(outputRoot, subDir);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFilename = `${filename}.webp`;
    const outputPath = path.join(outputDir, outputFilename);

    // 既に存在し、更新日時が新しければスキップなどの判定も可能だが、今回は常に上書きまたは生成
    try {
        await sharp(filePath)
            .resize(1200, null, { withoutEnlargement: true })
            .webp({ quality: 75 })
            .toFile(outputPath);

        console.log(`Converted: ${relativePath} -> assets_webp/${subDir ? subDir + '/' : ''}${outputFilename}`);

        // マニフェストへの登録
        // キー: assets/path/to/image.png (Web上のパス形式に合わせるため / 区切りに統一)
        // 値: assets_webp/path/to/image.webp

        // Windows環境(バックスラッシュ)対応
        const normalize = (p) => p.split(path.sep).join('/');

        const originalKey = `assets/${normalize(relativePath)}`;
        const webpValue = `assets_webp/${normalize(path.join(subDir, outputFilename))}`;

        imageManifest[originalKey] = webpValue;

    } catch (err) {
        console.error(`Error processing ${relativePath}:`, err);
    }
}

// 実行開始
(async () => {
    console.log('Starting recursive image conversion...');

    // 出力ディレクトリ作成
    if (!fs.existsSync(outputRoot)) {
        fs.mkdirSync(outputRoot, { recursive: true });
    }

    await processDirectory(inputRoot);

    // マニフェスト書き出し
    fs.writeFileSync(manifestPath, JSON.stringify(imageManifest, null, 2));
    console.log(`Manifest generated at: ${manifestPath}`);
})();