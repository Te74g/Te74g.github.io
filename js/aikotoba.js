document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('aikotoba-list');
    if (!listContainer) return;

    if (typeof aikotobaData === 'undefined' || !Array.isArray(aikotobaData)) {
        console.error('aikotobaData is not defined or is not an array.');
        listContainer.innerHTML = '<p>データが見つかりませんでした。</p>';
        return;
    }

    let html = '';
    aikotobaData.forEach(item => {
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
