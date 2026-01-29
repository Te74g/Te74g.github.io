/**
 * Event Page Loader
 * Dynamically loads event content based on URL query parameter `?id=...`
 * Requires: site_data.js (partnerEventsData)
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!window.partnerEventsData) {
        console.error('partnerEventsData is not defined.');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        console.warn('No event ID specified.');
        return;
    }

    const eventItem = window.partnerEventsData.find(item => item.id === id);

    if (eventItem) {
        // Update Title
        document.title = `あにあめもりあ | ${eventItem.name}`;

        // Render Header
        const headerEl = document.getElementById('dynamic-event-header');
        if (headerEl) {
            headerEl.innerHTML = `
                <div style="margin-bottom: 10px; color: var(--muted); font-weight: 700;">
                    <time datetime="${eventItem.date.replace(/\./g, '-')}">${eventItem.date}</time>
                    <span class="tag tag--soft" style="margin-left: 10px;">${eventItem.organizer}</span>
                </div>
                <h1 style="font-size: clamp(1.5rem, 5vw, 2.2rem); font-weight: 900; margin-bottom: 0;">
                    ${eventItem.name}
                </h1>
            `;
        }

        // Render Image
        const imageContainer = document.getElementById('dynamic-event-image');
        if (imageContainer && eventItem.image) {
            let imgPath = eventItem.image;
            if (!imgPath.startsWith('http') && !imgPath.startsWith('../') && !imgPath.startsWith('/')) {
                imgPath = '../' + imgPath;
            }

            imageContainer.innerHTML = `
                <div style="margin-bottom: 32px;">
                    <img src="${imgPath}" alt="イベント画像"
                        style="width: 100%; height: auto; border-radius: 12px; box-shadow: var(--shadow);">
                </div>
            `;
        }

        // Render Content
        const contentEl = document.getElementById('dynamic-event-content');
        if (contentEl) {
            contentEl.innerHTML = eventItem.content || '<p>詳細情報がありません。</p>';
        }
    } else {
        document.querySelector('main').innerHTML = '<div class="container"><p>イベントが見つかりませんでした。</p></div>';
    }
});
