#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const NEWS_DATA_PATH = path.join(ROOT, 'data', 'news.js');

function loadWindowData(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: filePath });
    return sandbox.window;
}

function parseArgs(argv) {
    const args = {
        dryRun: false,
        force: false,
        eventDate: null,
        publishDate: null
    };

    for (const arg of argv) {
        if (arg === '--dry-run') args.dryRun = true;
        else if (arg === '--force') args.force = true;
        else if (arg.startsWith('--event-date=')) args.eventDate = arg.slice('--event-date='.length);
        else if (arg.startsWith('--publish-date=')) args.publishDate = arg.slice('--publish-date='.length);
    }

    return args;
}

function pad2(value) {
    return String(value).padStart(2, '0');
}

function formatYmdCompact(date) {
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

function formatPublishDate(date) {
    return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

function formatEventDateJP(date) {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
}

function parseIsoDate(value) {
    if (!value) return null;
    const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) {
        throw new Error(`Invalid date format: ${value}. Expected YYYY-MM-DD`);
    }
    const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    date.setHours(0, 0, 0, 0);
    return date;
}

function nextSunday(baseDate) {
    const date = new Date(baseDate);
    date.setHours(0, 0, 0, 0);
    let delta = (7 - date.getDay()) % 7;
    if (delta === 0) delta = 7;
    date.setDate(date.getDate() + delta);
    return date;
}

function latestEventNotice(newsData) {
    return newsData
        .filter((item) => item && /^event_notice_\d{8}$/.test(String(item.id || '')))
        .sort((a, b) => String(b.id).localeCompare(String(a.id)))[0] || null;
}

function nextEventNumber(newsData) {
    const eventItems = newsData.filter((item) => item && /^event_notice_\d{8}$/.test(String(item.id || '')));
    let maxNumber = 0;

    for (const item of eventItems) {
        const match = String(item.title || '').match(/第\s*(\d+)\s*回/);
        if (match) {
            maxNumber = Math.max(maxNumber, Number(match[1]));
        }
    }

    if (maxNumber > 0) return maxNumber + 1;
    return eventItems.length + 1;
}

function routeStubHtml(id, titleText) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleText} | あにあめもりあ</title>
  <script>window.__newsId = '${id}';</script>
  <link rel="icon" href="/assets/favicon/multi_favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="../../css/styles.css">
</head>
<body>
  <div id="header-placeholder"></div>
  <main id="main">
    <section class="section news-article-section">
      <div class="container news-article-container">
        <article class="news-article">
          <header id="dynamic-article-header" class="news-article-header"></header>
          <div id="dynamic-article-image" class="news-article-image"></div>
          <div class="news-article-content-frame">
            <div id="dynamic-article-content"><p>読み込み中...</p></div>
            <div class="watermark-logo"></div>
          </div>
          <div class="news-article-actions">
            <a href="../../news/" class="btn btn--ghost">ニュース一覧に戻る</a>
          </div>
        </article>
      </div>
    </section>
  </main>
  <div id="footer-placeholder"></div>

  <script src="../../data/site.js"></script>
  <script src="../../data/news.js"></script>
  <script src="../../js/common/utils.js"></script>
  <script src="../../js/common-layout.js"></script>
  <script>renderLayout('../../');</script>
  <script src="../../js/news_loader.js?v=20260323b"></script>
</body>
</html>
`;
}

function articleBlock({ id, linkPath, title, publishDate, imagePath, desc, eventDateLabel, eventNumber }) {
    return `    {
        id: '${id}',
        hidden: false,
        linkPath: '${linkPath}',
        title: '${title}',
        date: '${publishDate}',
        category: 'お知らせ',
        image: '${imagePath}',
        imagePath: '${imagePath}',
        desc: '${desc}',
        content: \`
            <p>
                いつも【あにあめもりあ】を見守ってくださり、ありがとうございます。<br>
                情報収集型ロールプレイイベント【あにあめもりあ】第${eventNumber}回の開催日が決定しました！
            </p>

            <p>
                📅${eventDateLabel}<br>
                ⏰21:00～22:00 OPEN✨<br>
                🌙22:00~アフター<br>
                📍Group ID：ANYMEM.3432
            </p>

            <p>
                人間さんのご来店を、キャスト一同楽しみにお待ちしています。<br>
                初めましての方も、お久しぶりの方も、どうぞお気軽に遊びに来てください！
            </p>

            <p style="text-align: center; margin-top: 2em; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                <a href="https://x.com/ANIAMEMORIA" target="_blank" rel="noopener noreferrer" class="btn btn--primary">Xで告知を見る</a>
                <a href="https://vrchat.com/home/group/grp_6d3e7179-6353-4e8b-9f78-c9a2430bfa06" target="_blank" rel="noopener noreferrer" class="btn btn--ghost">VRChatグループを見る</a>
            </p>
        \`
    },`;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const newsWindow = loadWindowData(NEWS_DATA_PATH);
    const newsData = Array.isArray(newsWindow.newsData) ? newsWindow.newsData : [];

    const publishDate = args.publishDate ? parseIsoDate(args.publishDate) : new Date();
    publishDate.setHours(0, 0, 0, 0);
    const eventDate = args.eventDate ? parseIsoDate(args.eventDate) : nextSunday(publishDate);

    const compact = formatYmdCompact(eventDate);
    const id = `event_notice_${compact}`;
    const slug = `event-notice-${compact}`;
    const linkPath = `news/${slug}/`;

    if (newsData.some((item) => item && item.id === id) && !args.force) {
        console.error(`Article already exists: ${id}`);
        process.exit(1);
    }

    const latest = latestEventNotice(newsData);
    const imagePath = latest?.imagePath || latest?.image || 'assets/news/2026-03-14/329.webp';
    const eventNumber = nextEventNumber(newsData);
    const title = `🌸【第${eventNumber}回開催のお知らせ】🌸`;
    const desc = `情報収集型ロールプレイイベント【あにあめもりあ】第${eventNumber}回の開催日が確定しました。`;
    const publishDateText = formatPublishDate(publishDate);
    const eventDateLabel = formatEventDateJP(eventDate);

    const block = articleBlock({
        id,
        linkPath,
        title,
        publishDate: publishDateText,
        imagePath,
        desc,
        eventDateLabel,
        eventNumber
    });

    let text = fs.readFileSync(NEWS_DATA_PATH, 'utf8');
    text = text.replace(/window\.newsData = \[/, `window.newsData = [\n${block}`);

    const aliasLine = `    '${slug}': '${id}',`;
    if (!text.includes(aliasLine)) {
        text = text.replace(/window\.newsIdAliases = \{/, `window.newsIdAliases = {\n${aliasLine}`);
    }

    const routeDir = path.join(ROOT, 'news', slug);
    const routeFile = path.join(routeDir, 'index.html');
    const stubHtml = routeStubHtml(id, `第${eventNumber}回開催のお知らせ`);

    if (args.dryRun) {
        console.log(JSON.stringify({
            id,
            linkPath,
            title,
            publishDate: publishDateText,
            eventDate: eventDateLabel,
            imagePath,
            routeFile: path.relative(ROOT, routeFile).replace(/\\/g, '/')
        }, null, 2));
        return;
    }

    fs.writeFileSync(NEWS_DATA_PATH, text, 'utf8');
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(routeFile, stubHtml, 'utf8');

    console.log(`Added article: ${id}`);
    console.log(`Route: ${linkPath}`);
}

main();

