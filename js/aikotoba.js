/**
 * aikotoba.js
 * 合言葉ページの構築・カード描画
 * ページ構造（cinema stage / section / header）もここで生成するため、
 * HTML 側は <main id="main"></main> だけでよい。
 */
document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('main');
    if (!main) return;

    // master/pages か pages か自動判定（common-layout.js と同じロジック）
    const isMaster = window.location.pathname.includes('/master/');
    const rootPath = isMaster ? '../../' : '../';

    // ---- Cinema Stage Setup ----
    main.classList.add('aikotoba-stage');

    // 映写機シルエット
    const projector = document.createElement('img');
    projector.className = 'aikotoba-projector';
    projector.src = rootPath + 'assets/cinema/projector.svg';
    projector.setAttribute('aria-hidden', 'true');
    projector.alt = '';
    main.appendChild(projector);

    // ---- ページ構造 ----
    main.insertAdjacentHTML('beforeend', `
        <section class="section">
            <div class="container">
                <header class="section-head reveal">
                    <h1 class="section-title cafe-signboard">合言葉</h1>
                    <p class="section-lead">秘密の手紙</p>
                </header>
                <div class="perf-strip" aria-hidden="true"></div>
                <div id="aikotoba-list" class="aikotoba-grid reveal"></div>
                <div style="margin-top: 40px; text-align: center;">
                    <a href="../index.html" class="btn btn--primary">トップへ戻る</a>
                </div>
            </div>
        </section>
    `);

    // ---- カード描画 ----
    const listContainer = document.getElementById('aikotoba-list');
    if (!listContainer) return;

    const emptyHTML = `
        <div class="empty">
            <div class="empty-icon">✉️</div>
            <h3 class="empty-title">お知らせ</h3>
            <p class="empty-desc">現在公開されている合言葉はありません。<br>次回の更新をお待ちください。</p>
        </div>
    `;

    if (typeof aikotobaData === 'undefined' || !Array.isArray(aikotobaData) || aikotobaData.length === 0) {
        listContainer.innerHTML = emptyHTML;
        return;
    }

    const visibleData = aikotobaData.filter(item => window.shouldShowItem(item));

    if (visibleData.length === 0) {
        listContainer.innerHTML = emptyHTML;
        return;
    }

    let html = '';
    visibleData.forEach(item => {
        html += `
            <a href="${item.link}" class="aikotoba-card" target="_blank">
                <div class="aikotoba-card__icon-box">
                    <img src="${item.image}" alt="${item.name}" class="aikotoba-card__icon">
                </div>
                <div class="aikotoba-card__text">${item.text}</div>
                <div class="watermark-logo"></div>
            </a>
        `;
    });

    listContainer.innerHTML = html;
});
