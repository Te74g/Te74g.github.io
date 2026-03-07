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

    // ---- ページ構造構築 ----
    // HTML 側は <main id="main"></main> だけでよい。
    const main = document.getElementById('main');
    if (main) {
        main.insertAdjacentHTML('beforeend', `
            <section class="section people-page-section">
                <div class="container">
                    <header class="section-head reveal">
                        <h1 class="section-title cafe-signboard">キャスト紹介</h1>
                    </header>
                    <div class="toolbar reveal">
                        <div class="field">
                            <div id="people-tag-filter" class="tag-filter-buttons">
                                <button class="tag-filter-btn is-active" data-value="all">すべて</button>
                                <button class="tag-filter-btn" data-value="運営">運営</button>
                                <button class="tag-filter-btn" data-value="飼育">飼育</button>
                                <button class="tag-filter-btn" data-value="野生">野生</button>
                                <button class="tag-filter-btn" data-value="妖怪">妖怪</button>
                                <button class="tag-filter-btn" data-value="キャスト">キャスト</button>
                                <button class="tag-filter-btn" data-value="スタッフ">スタッフ</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div id="people-list-container"></div>
        `);
    }

    // ---- 設定定数 ----
    const SECTION_ORDER = ["運営部", "飼育区画", "野生区画", "妖怪区画", "スタッフ"];
    const KUKAKU_SECTION_IMGS = {
        '飼育区画': 'assets/kukaku/shiiku.png',
        '野生区画': 'assets/kukaku/yasei.png',
        '妖怪区画': 'assets/kukaku/youkai.png',
    };
    const SECTION_LOAD_MS = 300;   // renderSequentially のセクション間ウェイト
    const CARD_STAGGER_MS = 50;    // フィルタアニメのカード間ディレイ
    const NOT_FOUND_MSG = '該当するキャストが見つかりませんでした。';

    // フィルター初期化完了後に renderSequentially から呼び出すためのコールバック
    // var を使うことで TDZ を回避（const/let は early return 時に TDZ で TypeError になる）
    var _filterCallback = null;

    /* -------------------------------------------------------
       1. キャスト一覧ページ (people.html) の生成
       ------------------------------------------------------- */
    const peopleContainer = document.getElementById("people-list-container");

    if (peopleContainer && window.membersData) {
        // 表示順序の定義
        const sectionOrder = SECTION_ORDER;

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
                "運営部": "../assets/page/unei_low_res.webp",
                "飼育区画": "../assets/page/shiiku_low_res.webp",
                "野生区画": "../assets/page/yasei_low_res.webp",
                "妖怪区画": "../assets/page/yo-kai_low_res.webp",
                "スタッフ": "../assets/page/staff_low_res.webp"
            };

            // Create Wrapper
            const wrapper = document.createElement("section");
            wrapper.className = "people-section-wrapper reveal"; // reveal class triggers fadeIn animation
            wrapper.dataset.section = sec; // フィルタリングで特定するための識別子

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
            const kukakuImg = KUKAKU_SECTION_IMGS[sec];
            if (kukakuImg) {
                const header = document.createElement("div");
                header.className = "kukaku-section-header";
                header.innerHTML = `
                    <div class="perf-strip" aria-hidden="true"></div>
                    <div class="kukaku-section-sign">
                        <img src="${window.fixPath(kukakuImg)}" alt="${sec}" class="kukaku-section-img" loading="lazy">
                    </div>
                    <div class="perf-strip" aria-hidden="true"></div>
                `;
                innerContainer.appendChild(header);
            } else {
                // 運営部・スタッフ：画像が揃い次第置き換え予定
                const divider = document.createElement("div");
                divider.className = "section-divider";
                divider.innerHTML = `<span class="section-label">${sec}</span>`;
                innerContainer.appendChild(divider);
            }

            // Grid
            const grid = document.createElement("div");
            grid.className = "cheki-grid";

            // キャスト表示制御の設定を取得
            const castConfig = window.siteConfig?.castDisplay || {};
            const showAll = castConfig.showAllMembers;
            const visibleList = castConfig.visibleMembers || [];

            // カード生成関数
            const createMemberCard = (m, form, formIndex, revealLevel) => {
                const link = document.createElement("a");

                // form がある場合は画像だけマージ（名前は親のnameを使用）
                const effectiveMember = form ? {
                    ...m,
                    // 表示名は親のnameを維持（一覧では「えの / エノ」のような統合名を使用）
                    name: m.name,
                    pickupName: m.pickupName || m.name,
                    tagLabel: m.tagLabel,  // 親のタグを使用
                    // 画像だけフォームから取得
                    profileImages: (form.profileImages && form.profileImages.length > 0) ? form.profileImages : m.profileImages,
                    image: form.image || m.image,
                } : m;

                const pinClass = window.getPinClass(m.tags);
                link.className = `cheki-card ${pinClass}`;
                link.setAttribute("data-name", effectiveMember.name);
                link.setAttribute("data-tags", m.tags);

                // 既存の表示許可チェック（互換性のため残す）
                const visible = window.isMemberVisible(m, castConfig);

                // revealLevel 3（完全公開）の場合
                if (revealLevel >= 3) {
                    // forms がある場合は form パラメータを URL に追加
                    let url = m.link || `member/profile.html?id=${m.id}`;
                    if (form && formIndex !== undefined) {
                        url += `${url.includes('?') ? '&' : '?'}form=${formIndex}`;
                    }
                    link.href = window.fixPath(url);
                    const displayName = effectiveMember.pickupName || effectiveMember.name;

                    // Random Image Selection
                    const targetImage = (effectiveMember.profileImages && effectiveMember.profileImages.length > 0)
                        ? effectiveMember.profileImages[Math.floor(Math.random() * effectiveMember.profileImages.length)]
                        : effectiveMember.image;

                    link.innerHTML = `
                        <div class="cheki-visual" style="${(() => {
                            const bgPath = window.getMemberBackground(m.tags);
                            return bgPath ? `background-image: url('${window.fixPath(bgPath)}'); background-size: cover; background-position: center;` : '';
                        })()}">
                            <img src="${window.fixPath(targetImage)}" alt="${effectiveMember.name}" class="cheki-img" loading="lazy">
                            <span class="cheki-tag-badge">${effectiveMember.tagLabel}</span>
                            ${(() => {
                            const fPath = window.getMemberFrame(m.tags);
                            return fPath ? `<div style="position:absolute; inset:0; background-image:url('${window.fixPath(fPath)}'); background-size:100% 100%; pointer-events:none; z-index:3;"></div>` : '';
                        })()}
                        </div>
                        <div class="cheki-name">${displayName}</div>
                    `;
                } else if (revealLevel === 2) {
                    // シルエット表示
                    const url = m.link || `member/profile.html?id=${m.id}`;
                    link.href = window.fixPath(url);
                    link.classList.add("silhouette-mode");

                    const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(m) : null;
                    const silhouetteImg = displayInfo && displayInfo.imagePath
                        ? displayInfo.imagePath[0]
                        : (castConfig.placeholderImage || m.image);

                    link.innerHTML = `
                        <div class="cheki-visual silhouette-mode" style="${(() => {
                            const bgPath = window.getMemberBackground(m.tags);
                            return bgPath ? `background-image: url('${window.fixPath(bgPath)}'); background-size: cover; background-position: center;` : '';
                        })()}">
                            <img src="${window.fixPath(silhouetteImg)}" alt="${effectiveMember.name}" class="cheki-img silhouette" loading="lazy">
                            <span class="cheki-tag-badge">${effectiveMember.tagLabel}</span>
                        </div>
                        <div class="cheki-name">${effectiveMember.name}</div>
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

                return link;
            };

            list.forEach(m => {
                // revealLevelを確認（0の場合は表示しない）
                const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(m) : null;
                const revealLevel = displayInfo ? displayInfo.level : 3;

                // Level 0 は完全非表示
                if (revealLevel === 0) return;

                // forms を持つメンバーの場合、最初の形態のデータを使用（1枚のカードで表示）
                const firstForm = (m.forms && m.forms.length > 0) ? m.forms[0] : null;
                const card = createMemberCard(m, firstForm, 0, revealLevel);
                grid.appendChild(card);
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
                    await delay(SECTION_LOAD_MS);
                }
            }

            // 全て読み込み終わったら絞り込み機能を適用（初期化）
            // _filterCallback は applyPeopleFilter が定義された後にセットされるため安全
            if (_filterCallback) _filterCallback();
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
    const searchInput = document.getElementById('people-search'); // 削除済みの場合は null
    const tagFilterContainer = document.getElementById('people-tag-filter');
    const filterBtns = tagFilterContainer ? tagFilterContainer.querySelectorAll('.tag-filter-btn') : [];

    if (!tagFilterContainer) return;

    // タグ → 対応するセクション名のマッピング
    const TAG_TO_SECTION = {
        '運営': '運営部',
        '店長': '運営部',
        '副店長': '運営部',
        '飼育': '飼育区画',
        '野生': '野生区画',
        '妖怪': '妖怪区画',
        'スタッフ': 'スタッフ',
    };

    // カードをアニメーション付きでコンテナに挿入するヘルパー
    const animateCardsIn = (cards, container) => {
        cards.forEach((card, i) => {
            const clone = card.cloneNode(true);
            clone.style.setProperty('--card-delay', `${i * CARD_STAGGER_MS}ms`);
            clone.classList.add('card-enter', 'is-visible');
            container.appendChild(clone);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                clone.classList.add('is-entering');
            }));
        });
    };

    // フィルタ状態（tag・query・マッチカード・対象ラッパー）を返す純粋関数
    const getFilterState = () => {
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        const activeBtn = tagFilterContainer.querySelector('.tag-filter-btn.is-active');
        const tag = (activeBtn ? activeBtn.dataset.value : null) || 'all';
        const isFiltering = tag !== 'all' || query.length > 0;

        // セクション系タグ（飼育・野生・妖怪等）は targetWrapper を先に確定する
        const targetSectionName = TAG_TO_SECTION[tag];
        const targetWrapper = targetSectionName
            ? document.querySelector(`#people-list-container .people-section-wrapper[data-section="${targetSectionName}"]`)
            : null;

        const allCards = Array.from(document.querySelectorAll('#people-list-container .cheki-grid:not(.filter-injected-grid) .cheki-card'));
        const matchingCards = allCards.filter(card => {
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const tags = (card.getAttribute('data-tags') || '').toLowerCase();
            const nameMatch = !query || name.includes(query);
            if (targetWrapper) {
                // セクション絞り込み: タグではなく「そのセクションに属するカード」で判定
                // → 複合タグ（例: "妖怪 飼育"）を持つメンバーが別セクションに漏れるのを防ぐ
                return nameMatch && targetWrapper.contains(card);
            }
            return nameMatch && (tag === 'all' || tags.includes(tag.toLowerCase()));
        });

        return { tag, query, isFiltering, matchingCards, targetWrapper };
    };

    // "すべて" 表示：元のセクション別ビューに戻す
    const resetToAllSections = () => {
        const flatContainer = document.getElementById('people-filter-results');
        if (flatContainer) flatContainer.style.display = 'none';
        if (peopleContainer) peopleContainer.style.display = '';
        document.querySelectorAll('#people-list-container .people-section-wrapper').forEach(w => {
            w.style.display = '';
            const origGrid = w.querySelector('.cheki-grid:not(.filter-injected-grid)');
            const injGrid = w.querySelector('.filter-injected-grid');
            if (origGrid) origGrid.style.display = '';
            if (injGrid) injGrid.style.display = 'none';
        });
        document.querySelectorAll('#people-list-container .cheki-card').forEach(c => {
            c.style.display = '';
            c.classList.add('is-visible');
        });
    };

    // セクション背景を維持してマッチカードを集約（タグ絞り込み時）
    const renderSectionFilter = (targetWrapper, matchingCards) => {
        const flatContainer = document.getElementById('people-filter-results');
        if (flatContainer) flatContainer.style.display = 'none';
        if (peopleContainer) peopleContainer.style.display = '';

        document.querySelectorAll('#people-list-container .people-section-wrapper').forEach(w => {
            w.style.display = 'none';
        });

        targetWrapper.style.display = '';
        targetWrapper.classList.remove('is-visible');
        void targetWrapper.offsetWidth; // force reflow
        requestAnimationFrame(() => targetWrapper.classList.add('is-visible'));

        const origGrid = targetWrapper.querySelector('.cheki-grid:not(.filter-injected-grid)');
        if (origGrid) origGrid.style.display = 'none';

        let injGrid = targetWrapper.querySelector('.filter-injected-grid');
        if (!injGrid) {
            injGrid = document.createElement('div');
            injGrid.className = 'cheki-grid filter-injected-grid';
            const container = targetWrapper.querySelector('.container');
            if (container) container.appendChild(injGrid);
        }
        injGrid.style.display = '';
        injGrid.innerHTML = '';

        if (matchingCards.length === 0) {
            injGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:2rem;color:#fff;">${NOT_FOUND_MSG}</p>`;
        } else {
            animateCardsIn(matchingCards, injGrid);
        }
    };

    // セクション対応なし（キャスト絞り込み）→ フラットビュー
    const renderFlatFilter = (matchingCards) => {
        let flatContainer = document.getElementById('people-filter-results');
        if (!flatContainer && peopleContainer) {
            flatContainer = document.createElement('div');
            flatContainer.id = 'people-filter-results';
            flatContainer.className = 'people-filter-results';
            const inner = document.createElement('div');
            inner.className = 'container';
            const grid = document.createElement('div');
            grid.id = 'people-filter-grid';
            grid.className = 'cheki-grid';
            inner.appendChild(grid);
            flatContainer.appendChild(inner);
            peopleContainer.insertAdjacentElement('afterend', flatContainer);
        }

        const flatGrid = document.getElementById('people-filter-grid');
        if (flatGrid) {
            flatGrid.innerHTML = '';
            if (matchingCards.length === 0) {
                flatGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted);">${NOT_FOUND_MSG}</p>`;
            } else {
                animateCardsIn(matchingCards, flatGrid);
            }
        }

        if (peopleContainer) peopleContainer.style.display = 'none';
        if (flatContainer) {
            flatContainer.style.opacity = '0';
            flatContainer.style.transition = 'opacity 0.5s ease';
            flatContainer.style.display = '';
            requestAnimationFrame(() => requestAnimationFrame(() => {
                flatContainer.style.opacity = '1';
            }));
        }
    };

    const applyPeopleFilter = () => {
        const { isFiltering, matchingCards, targetWrapper } = getFilterState();
        if (!isFiltering) { resetToAllSections(); return; }
        if (targetWrapper) { renderSectionFilter(targetWrapper, matchingCards); return; }
        renderFlatFilter(matchingCards);
    };
    // renderSequentially から安全に呼び出せるようコールバックをセット
    _filterCallback = applyPeopleFilter;

    if (searchInput) searchInput.addEventListener('input', applyPeopleFilter);

    // タグボタンのクリックでアクティブ切り替え＆フィルタ実行
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            applyPeopleFilter();
        });
    });

    // URLパラメータからタグ自動適用（プロフィールページのタグリンクから遷移した場合など）
    const urlParams = new URLSearchParams(window.location.search);
    const urlTag = urlParams.get('tag');
    if (urlTag) {
        const matchBtn = tagFilterContainer.querySelector(`.tag-filter-btn[data-value="${urlTag}"]`);
        if (matchBtn) {
            filterBtns.forEach(b => b.classList.remove('is-active'));
            matchBtn.classList.add('is-active');
        }
    }

    // 初期実行は renderSequentially 完了後に _filterCallback() で行う
    // （全セクション DOM 構築後の実行を保証するため setTimeout は使わない）
})();
