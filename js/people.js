/**
 * people.js
 * Cast list generation and filtering
 * Depends on: utils.js, data_members.js
 */

(async function () {
    // Wait for Manifest
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

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

        // フィルタリングして振り分け
        const visibleMembers = window.membersData.filter(m => window.shouldShowItem(m));

        visibleMembers.forEach(member => {
            const sec = member.section || "その他";
            if (!grouped[sec]) grouped[sec] = [];
            grouped[sec].push(member);
        });

        // HTML生成
        // HTML生成関数
        const createSectionElement = (sec, list) => {
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
            wrapper.className = "people-section-wrapper reveal"; // reveal class triggers fadeIn animation

            const bgDiv = document.createElement("div");
            bgDiv.className = "people-section-bg";

            const bgPath = bgMap[sec] ? window.fixPath(bgMap[sec]) : "";
            if (bgPath) {
                bgDiv.style.backgroundImage = `url('${bgPath}')`;
            } else {
                bgDiv.style.backgroundColor = "transparent";
            }
            wrapper.appendChild(bgDiv);

            // Inner Container
            const innerContainer = document.createElement("div");
            innerContainer.className = "container";

            // Section Header
            const divider = document.createElement("div");
            divider.className = "section-divider";
            divider.innerHTML = `<span class="section-label">${sec}</span>`;
            innerContainer.appendChild(divider);

            // Grid
            const grid = document.createElement("div");
            grid.className = "cheki-grid";

            // キャスト表示制御の設定を取得
            const castConfig = window.siteConfig?.castDisplay || {};
            const showAll = castConfig.showAllMembers;
            const visibleList = castConfig.visibleMembers || [];

            // メンバーが表示許可されているか判定する関数（既存の互換性維持）
            const isMemberVisible = (member) => {
                if (showAll) return true;
                // 運営部・スタッフは常に表示
                if (member.section === "運営部" || member.section === "スタッフ") return true;
                return visibleList.includes(member.id);
            };

            list.forEach(m => {
                // revealLevelを確認（0の場合は表示しない）
                const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(m) : null;
                const revealLevel = displayInfo ? displayInfo.level : 3;

                // Level 0 は完全非表示
                if (revealLevel === 0) return;

                const link = document.createElement("a");
                const pinClass = window.getPinClass(m.tags);
                link.className = `cheki-card ${pinClass}`;
                link.setAttribute("data-name", displayInfo ? displayInfo.name : m.name);
                link.setAttribute("data-tags", m.tags);

                // 既存の表示許可チェック（互換性のため残す）
                const visible = isMemberVisible(m);

                // revealLevel 3（完全公開）の場合
                // 注意: revealLevel >= 3 であれば既存のvisible制限は適用しない
                if (revealLevel >= 3) {
                    // 完全公開表示
                    const url = m.link || `member/profile.html?id=${m.id}`;
                    link.href = window.fixPath(url);
                    const displayName = displayInfo ? displayInfo.name : (m.pickupName || m.name);

                    // Random Image Selection
                    const targetImage = (m.profileImages && m.profileImages.length > 0)
                        ? m.profileImages[Math.floor(Math.random() * m.profileImages.length)]
                        : m.image;

                    link.innerHTML = `
                        <div class="cheki-visual" style="${(() => {
                            const bgPath = window.getMemberBackground(m.tags);
                            return bgPath ? `background-image: url('${window.fixPath(bgPath)}'); background-size: cover; background-position: center;` : '';
                        })()}">
                            <img src="${window.fixPath(targetImage)}" alt="${m.name}" class="cheki-img" loading="lazy">
                            <span class="cheki-tag-badge">${m.tagLabel}</span>
                            ${(() => {
                            const fPath = window.getMemberFrame(m.tags);
                            return fPath ? `<div style="position:absolute; inset:0; background-image:url('${window.fixPath(fPath)}'); background-size:100% 100%; pointer-events:none; z-index:3;"></div>` : '';
                        })()}
                        </div>
                        <div class="cheki-name">${displayName}</div>
                    `;
                } else if (revealLevel === 2) {
                    // シルエット表示（名前・タグは表示、画像はシルエット）
                    const url = m.link || `member/profile.html?id=${m.id}`;
                    link.href = window.fixPath(url);
                    link.classList.add("silhouette-mode");

                    const silhouetteImg = displayInfo && displayInfo.imagePath
                        ? displayInfo.imagePath[0]
                        : (castConfig.placeholderImage || m.image);

                    link.innerHTML = `
                        <div class="cheki-visual silhouette-mode">
                            <img src="${window.fixPath(silhouetteImg)}" alt="${displayInfo ? displayInfo.name : m.name}" class="cheki-img silhouette" loading="lazy">
                            <span class="cheki-tag-badge">${displayInfo ? displayInfo.tagLabel : m.tagLabel}</span>
                        </div>
                        <div class="cheki-name">${displayInfo ? displayInfo.name : m.name}</div>
                    `;
                } else if (revealLevel === 1) {
                    // Coming Soon表示
                    link.href = "javascript:void(0)";
                    link.style.cursor = "default";
                    link.classList.add("coming-soon");

                    const comingSoonImg = castConfig.comingSoonImage || '';
                    const comingSoonName = castConfig.comingSoonName || "???";

                    link.innerHTML = `
                        <div class="cheki-visual coming-soon">
                            <img src="${window.fixPath(comingSoonImg)}" alt="Coming Soon" class="cheki-img" loading="lazy">
                            <span class="cheki-tag-badge">???</span>
                            <div class="coming-soon-overlay">Coming Soon</div>
                        </div>
                        <div class="cheki-name">${comingSoonName}</div>
                    `;
                } else if (!visible) {
                    // 旧式の準備中表示（互換性のため残す）
                    const placeholderImage = castConfig.placeholderImage || '';
                    const preparingText = castConfig.preparingText || '準備中';

                    link.href = "javascript:void(0)";
                    link.style.cursor = "default";
                    link.classList.add("preparing");

                    link.innerHTML = `
                        <div class="cheki-visual preparing">
                            <img src="${window.fixPath(placeholderImage)}" alt="準備中" class="cheki-img silhouette" loading="lazy">
                            <span class="cheki-tag-badge">${m.tagLabel}</span>
                            <div class="preparing-overlay">${preparingText}</div>
                        </div>
                        <div class="cheki-name">???</div>
                    `;
                }
                grid.appendChild(link);
            });
            innerContainer.appendChild(grid);
            wrapper.appendChild(innerContainer);

            return wrapper;
        };

        // 順次読み込み (Async Sequential Loading)
        const renderSequentially = async () => {
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            for (const sec of sectionOrder) {
                const list = grouped[sec];
                if (list && list.length > 0) {
                    const sectionEl = createSectionElement(sec, list);
                    peopleContainer.appendChild(sectionEl);

                    // アニメーション用クラス付与 (Force reflow to ensure animation triggers if needed, though reveal handles it)
                    // existing .reveal in CSS handles fadeIn. 
                    // We can also add 'is-visible' to match existing logic explicitly if needed, but .reveal handles it.
                    // Adding is-visible for consistency with text/other reveal elements.
                    requestAnimationFrame(() => {
                        sectionEl.classList.add('is-visible');
                    });

                    // Wait before showing next section
                    await delay(300);
                }
            }

            // 全て読み込み終わったら絞り込み機能を適用（初期化）
            // Initialize filter after all contents are loaded
            if (typeof applyPeopleFilter === 'function') {
                applyPeopleFilter();
            }
        };

        // Start Loading
        renderSequentially();

        // Note: IntersectionObserver is removed because we are forcing visibility sequentially.
        // If we want to keep scroll-triggering for sections *outside* the initial viewport, 
        // we might need a hybrid approach. But the user request specifically asked to 
        // "load Management, Breeding... in order with animation", which implies a sequence.
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
