/**
 * News Article Loader
 * Dynamically loads news article content based on URL query parameter `?id=...`
 * Requires: site_data.js (newsData)
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof newsData === 'undefined') {
        console.error('newsData is not defined.');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        console.warn('No news ID specified.');
        return;
    }

    const article = newsData.find(item => item.id === id);

    if (article) {
        // Update Title
        document.title = `あにあめもりあ | ${article.title}`;

        // Render Header
        const headerEl = document.getElementById('dynamic-article-header');
        if (headerEl) {
            headerEl.innerHTML = `
                <div style="margin-bottom: 10px; color: var(--muted); font-weight: 700;">
                    <time datetime="${article.date.replace(/\./g, '-')}">${article.date}</time>
                    <span class="tag tag--soft" style="margin-left: 10px;">${article.category}</span>
                </div>
                <h1 style="font-size: clamp(1.5rem, 5vw, 2.2rem); font-weight: 900; margin-bottom: 0;">
                    ${article.title}
                </h1>
            `;
        }

        // Render Image
        const imageContainer = document.getElementById('dynamic-article-image');
        if (imageContainer) {
            if (article.imagePath || article.image) {
                // Use imagePath if available, else image (but handle relative paths)
                let imgPath = article.imagePath || article.image;

                // Fix path helper (simple version)
                if (!imgPath.startsWith('http') && !imgPath.startsWith('../') && !imgPath.startsWith('/')) {
                    imgPath = '../' + imgPath;
                }

                imageContainer.innerHTML = `
                    <div style="margin-bottom: 32px;">
                        <img src="${imgPath}" alt="記事画像"
                            style="width: 100%; height: auto; border-radius: 12px; box-shadow: var(--shadow);">
                    </div>
                `;
            } else {
                imageContainer.innerHTML = '';
            }
        }

        // Render Content
        const contentEl = document.getElementById('dynamic-article-content');
        if (contentEl) {
            contentEl.innerHTML = article.content || '<p>本文がありません。</p>';
        }
    } else {
        document.querySelector('main').innerHTML = '<div class="container"><p>記事が見つかりませんでした。</p></div>';
    }
});
