/**
 * people.js
 * Cast list generation and filtering
 * Depends on: utils.js, data_members.js
 */

(function () {
    /* -------------------------------------------------------
       1. キャスト一覧ページ (people.html) の生成
       ------------------------------------------------------- */
    const peopleContainer = document.getElementById("people-list-container");
    if (peopleContainer && window.membersData) {
        // 表示順序の定義
        const sectionOrder = ["運営部", "飼育区画", "野生区画", "妖怪区画", "スタッフ"];

        // データをセクションごとにグループ化
        const grouped = {};
        sectionOrder.forEach(sec => grouped[sec] = []);

        window.membersData.forEach(member => {
            const sec = member.section || "その他";
            if (!grouped[sec]) grouped[sec] = [];
            grouped[sec].push(member);
        });

        // HTML生成
        sectionOrder.forEach(sec => {
            const list = grouped[sec];
            if (list && list.length > 0) {
                // セクション見出し
                const divider = document.createElement("div");
                divider.className = "section-divider reveal is-visible";
                divider.innerHTML = `<span class="section-label">${sec}</span>`;
                peopleContainer.appendChild(divider);

                // グリッド
                const grid = document.createElement("div");
                grid.className = "cheki-grid";

                list.forEach(m => {
                    const link = document.createElement("a");
                    link.href = window.fixPath(m.link);
                    link.className = "cheki-card reveal is-visible";
                    const displayName = m.pickupName || m.name;
                    link.setAttribute("data-name", m.name); // Keep original name for search if needed, or use displayName? Usually search should match what's seen. Let's use m.name for search for now as it might be more complete, or maybe both. The prompt asked for separate *display*.
                    link.setAttribute("data-tags", m.tags);

                    link.innerHTML = `
                        <div class="cheki-visual" style="${(() => {
                            const bgPath = window.getMemberBackground(m.tags);
                            return bgPath ? `background-image: url('${window.fixPath(bgPath)}'); background-size: cover; background-position: center;` : '';
                        })()}">
                            <img src="${window.fixPath(m.image)}" alt="${m.name}" class="cheki-img">
                            <span class="cheki-tag-badge">${m.tagLabel}</span>
                            ${(() => {
                            const fPath = window.getMemberFrame(m.tags);
                            return fPath ? `<div style="position:absolute; inset:0; background-image:url('${window.fixPath(fPath)}'); background-size:100% 100%; pointer-events:none; z-index:3;"></div>` : '';
                        })()}
                        </div>
                        <div class="cheki-name">${displayName}</div>
                    `;
                    grid.appendChild(link);
                });
                peopleContainer.appendChild(grid);
            }
        });
    }

    /* -------------------------------------------------------
       2. PEOPLE FILTERING SYSTEM (絞り込み)
       ------------------------------------------------------- */
    const searchInput = document.getElementById('people-search');
    const tagFilter = document.getElementById('people-tag-filter');

    if (!searchInput || !tagFilter) return;

    const applyPeopleFilter = () => {
        const query = (searchInput.value || '').trim().toLowerCase();
        const tag = tagFilter.value || 'all';

        const dividers = document.querySelectorAll('.section-divider');
        const allCards = document.querySelectorAll('.cheki-card');

        // 1. 各カードの表示判定
        allCards.forEach(card => {
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const tags = (card.getAttribute('data-tags') || '').toLowerCase();

            const matchesQuery = !query || name.includes(query);
            const matchesTag = tag === 'all' || tags.includes(tag.toLowerCase());

            if (matchesQuery && matchesTag) {
                card.style.display = '';
                card.classList.add('is-visible');
            } else {
                card.style.display = 'none';
            }
        });

        // 2. 空になったセクションを隠す
        dividers.forEach(divider => {
            const nextGrid = divider.nextElementSibling;
            if (nextGrid && nextGrid.classList.contains('cheki-grid')) {
                const visibleCards = Array.from(nextGrid.querySelectorAll('.cheki-card'))
                    .filter(c => c.style.display !== 'none');

                if (visibleCards.length > 0) {
                    divider.style.display = '';
                    nextGrid.style.display = '';
                } else {
                    divider.style.display = 'none';
                    nextGrid.style.display = 'none';
                }
            }
        });
    };

    searchInput.addEventListener('input', applyPeopleFilter);
    tagFilter.addEventListener('change', applyPeopleFilter);

    // 初期実行
    setTimeout(applyPeopleFilter, 100);
})();
