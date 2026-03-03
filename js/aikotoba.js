document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('aikotoba-list');
    if (!listContainer) return;

    // データが空または未定義の場合
    if (typeof aikotobaData === 'undefined' || !Array.isArray(aikotobaData) || aikotobaData.length === 0) {
        listContainer.innerHTML = `
            <div class="empty">
                <div class="empty-icon">✉️</div>
                <h3 class="empty-title">お知らせ</h3>
                <p class="empty-desc">現在公開されている合言葉はありません。<br>次回の更新をお待ちください。</p>
            </div>
        `;
        return;
    }

    // フィルタリング
    const visibleData = aikotobaData.filter(item => window.shouldShowItem(item));

    if (visibleData.length === 0) {
        listContainer.innerHTML = `
            <div class="empty">
                <div class="empty-icon">✉️</div>
                <h3 class="empty-title">お知らせ</h3>
                <p class="empty-desc">現在公開されている合言葉はありません。<br>次回の更新をお待ちください。</p>
            </div>
        `;
        return;
    }

    let html = '';
    visibleData.forEach(item => {
        // Fallback for image if needed, though we expect it to exist
        const imgSrc = item.image;

        html += `
            <a href="${item.link}" class="aikotoba-card" target="_blank">
                <div class="aikotoba-card__icon-box">
                    <img src="${imgSrc}" alt="${item.name}" class="aikotoba-card__icon">
                </div>
                <div class="aikotoba-card__text">${item.text}</div>
                <div class="watermark-logo"></div>
            </a>
        `;
    });

    listContainer.innerHTML = html;
});
