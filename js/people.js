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
                // Section Background Map
                const bgMap = {
                    "運営部": "../assets/page/unei_low_res.png",
                    "飼育区画": "../assets/page/shiiku_low_res.png",
                    "野生区画": "../assets/page/yasei_low_res.png",
                    "妖怪区画": "../assets/page/yo-kai_low_res.png",
                    "スタッフ": "../assets/page/staff_low_res.png"
                };

                // Create Wrapper
                const wrapper = document.createElement("section");
                wrapper.className = "people-section-wrapper reveal"; // Added reveal for animation

                const bgDiv = document.createElement("div");
                bgDiv.className = "people-section-bg";

                const bgPath = bgMap[sec] ? window.fixPath(bgMap[sec]) : "";
                if (bgPath) {
                    bgDiv.style.backgroundImage = `url('${bgPath}')`;
                } else {
                    // Transparent fallback to let wood grain show
                    bgDiv.style.backgroundColor = "transparent";
                }
                wrapper.appendChild(bgDiv);

                // Inner Container
                const innerContainer = document.createElement("div");
                innerContainer.className = "container";

                // Section Header
                const divider = document.createElement("div");
                divider.className = "section-divider"; // Removed reveal here as wrapper handles it
                divider.innerHTML = `<span class="section-label">${sec}</span>`;
                innerContainer.appendChild(divider);

                // Grid
                const grid = document.createElement("div");
                grid.className = "cheki-grid";

                list.forEach(m => {
                    const link = document.createElement("a");
                    const url = m.link || `member/profile.html?id=${m.id}`;
                    link.href = window.fixPath(url);
                    const pinClass = window.getPinClass(m.tags);
                    link.className = `cheki-card ${pinClass}`;
                    const displayName = m.pickupName || m.name;
                    link.setAttribute("data-name", m.name);
                    link.setAttribute("data-tags", m.tags);

                    // Random Image Selection
                    const targetImage = (m.profileImages && m.profileImages.length > 0)
                        ? m.profileImages[Math.floor(Math.random() * m.profileImages.length)]
                        : m.image;

                    link.innerHTML = `
                        <div class="cheki-visual" style="${(() => {
                            const bgPath = window.getMemberBackground(m.tags);
                            return bgPath ? `background-image: url('${window.fixPath(bgPath)}'); background-size: cover; background-position: center;` : '';
                        })()}">
                            <img src="${window.fixPath(targetImage)}" alt="${m.name}" class="cheki-img">
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
                innerContainer.appendChild(grid);
                wrapper.appendChild(innerContainer);
                peopleContainer.appendChild(wrapper);
            }
        });

        // Initialize Observer for the newly created sections
        const wrappers = document.querySelectorAll('.people-section-wrapper.reveal');
        if ("IntersectionObserver" in window && wrappers.length > 0) {
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => {
                        if (e.isIntersecting) {
                            e.target.classList.add("is-visible");
                            // Optional: Stop observing once visible to save resources
                            io.unobserve(e.target);
                        }
                    });
                },
                { threshold: 0.15 } // 15% visible to trigger
            );
            wrappers.forEach(w => io.observe(w));
        } else {
            // Fallback
            wrappers.forEach(w => w.classList.add('is-visible'));
        }
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
            const wrapper = divider.closest('.people-section-wrapper');

            if (nextGrid && nextGrid.classList.contains('cheki-grid')) {
                const visibleCards = Array.from(nextGrid.querySelectorAll('.cheki-card'))
                    .filter(c => c.style.display !== 'none');

                if (visibleCards.length > 0) {
                    divider.style.display = '';
                    nextGrid.style.display = '';
                    if (wrapper) wrapper.style.display = '';
                } else {
                    divider.style.display = 'none';
                    nextGrid.style.display = 'none';
                    if (wrapper) wrapper.style.display = 'none';
                }
            }
        });
    };

    searchInput.addEventListener('input', applyPeopleFilter);
    tagFilter.addEventListener('change', applyPeopleFilter);

    // 初期実行
    setTimeout(applyPeopleFilter, 100);
})();
