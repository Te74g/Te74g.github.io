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
            <div class="ledger-page">
                <div class="ledger-bg"></div>
                <div class="ledger-book">
                    <header class="ledger-header reveal">
                        <p class="people-nav-label">キャスト紹介</p>
                        <h1 class="section-title cafe-signboard">あにあめもりあ 案内帳</h1>
                    </header>
                    <nav id="people-tag-filter" class="ledger-tabs reveal" aria-label="セクション絞り込み">
                        <button class="ledger-tab is-active" data-value="all">すべて</button>
                        <button class="ledger-tab" data-value="運営">運営</button>
                        <button class="ledger-tab" data-value="飼育">飼育</button>
                        <button class="ledger-tab" data-value="野生">野生</button>
                        <button class="ledger-tab" data-value="妖怪">妖怪</button>
                        <button class="ledger-tab" data-value="キャスト">キャスト</button>
                        <button class="ledger-tab" data-value="スタッフ">スタッフ</button>
                    </nav>
                    <aside class="ledger-note reveal" id="ledger-note" aria-live="polite">
                        <p class="ledger-note-label">この章の顔ぶれ</p>
                        <ul class="ledger-note-list" id="ledger-roster-list"></ul>
                    </aside>
                    <div class="ledger-body" id="people-list-container"></div>
                </div>
            </div>
        `);
    }

    // ---- 設定定数 ----
    const SECTION_ORDER = ["運営部", "飼育区画", "野生区画", "妖怪区画", "スタッフ"];
    const SECTION_LOAD_MS = 300;   // renderSequentially のセクション間ウェイト
    const CARD_STAGGER_MS = 50;    // フィルタアニメのカード間ディレイ
    const NOT_FOUND_MSG = '該当するキャストが見つかりませんでした。';

    // フィルター初期化完了後に renderSequentially から呼び出すためのコールバック
    // var を使うことで TDZ を回避（const/let は early return 時に TDZ で TypeError になる）
    var _filterCallback = null;

    // ロスター関連（if block 内外でスコープ共有）
    let rosterData = {};
    let _currentRosterSection = null;
    let _updateRoster = () => {};

    // HTML を除去し最初の1文を取得（最大 40 文字）
    function extractBlurb(html) {
        if (!html) return '';
        const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const m = text.match(/^[^。！？]+[。！？]/);
        const sent = m ? m[0] : text;
        return sent.length > 40 ? sent.slice(0, 40) + '…' : sent;
    }

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

        // ---- 章（セクション）要素生成 ----
        const createLedgerChapter = (sec, list) => {
            // 帳面の章コンテナ（背景なし・点線なし）
            const chapter = document.createElement("div");
            chapter.className = "ledger-chapter reveal";
            chapter.dataset.section = sec;

            // 章見出し（紙面内のインライン見出し）
            const title = document.createElement("h2");
            title.className = "ledger-chapter-title";
            title.textContent = sec;
            chapter.appendChild(title);

            // 名簿グリッド
            const grid = document.createElement("div");
            grid.className = "meibo-grid";

            // キャスト表示制御の設定を取得
            const castConfig = window.siteConfig?.castDisplay || {};

            // ---- カード生成 ----
            const createMemberCard = (m, form, formIndex, revealLevel) => {
                const link = document.createElement("a");

                // form がある場合は画像だけマージ（名前は親のnameを使用）
                const effectiveMember = form ? {
                    ...m,
                    name: m.name,
                    pickupName: m.pickupName || m.name,
                    tagLabel: m.tagLabel,
                    profileImages: (form.profileImages && form.profileImages.length > 0) ? form.profileImages : m.profileImages,
                    image: form.image || m.image,
                } : m;

                link.className = "meibo-card";
                link.setAttribute("data-name", effectiveMember.name);
                link.setAttribute("data-tags", m.tags);

                const visible = window.isMemberVisible(m, castConfig);

                if (revealLevel >= 3) {
                    let url = m.link || `member/profile.html?id=${m.id}`;
                    if (form && formIndex !== undefined) {
                        url += `${url.includes('?') ? '&' : '?'}form=${formIndex}`;
                    }
                    link.href = window.fixPath(url);
                    const displayName = effectiveMember.pickupName || effectiveMember.name;

                    const targetImage = (effectiveMember.profileImages && effectiveMember.profileImages.length > 0)
                        ? effectiveMember.profileImages[Math.floor(Math.random() * effectiveMember.profileImages.length)]
                        : effectiveMember.image;

                    const fPath = window.getMemberFrame ? window.getMemberFrame(m.tags) : null;
                    const frameOverlay = fPath
                        ? `<div style="position:absolute;inset:0;background-image:url('${window.fixPath(fPath)}');background-size:100% 100%;pointer-events:none;z-index:3;"></div>`
                        : '';

                    link.innerHTML = `
                        <div class="meibo-photo">
                            <img src="${window.fixPath(targetImage)}" alt="${effectiveMember.name}" class="meibo-img" loading="lazy">
                            <span class="meibo-tag">${effectiveMember.tagLabel}</span>
                            ${frameOverlay}
                        </div>
                        <div class="meibo-info">
                            <p class="meibo-name">${displayName}</p>
                        </div>
                    `;

                    // 説明文（revealLevel >= 3 のみ）
                    const blurb = extractBlurb(m.introduction);
                    if (blurb) {
                        const descP = link.querySelector('.meibo-info');
                        if (descP) {
                            const d = document.createElement('p');
                            d.className = 'meibo-desc';
                            d.textContent = blurb;
                            descP.appendChild(d);
                        }
                    }

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
                        <div class="meibo-photo silhouette-mode">
                            <img src="${window.fixPath(silhouetteImg)}" alt="${effectiveMember.name}" class="meibo-img silhouette" loading="lazy">
                            <span class="meibo-tag">${effectiveMember.tagLabel}</span>
                        </div>
                        <div class="meibo-info">
                            <p class="meibo-name">${effectiveMember.name}</p>
                        </div>
                    `;

                } else if (revealLevel === 1) {
                    // Coming Soon表示
                    link.href = "javascript:void(0)";
                    link.style.cursor = "default";
                    link.classList.add("coming-soon");

                    const comingSoonImg = castConfig.comingSoonImage || '';
                    const comingSoonName = castConfig.comingSoonName || "???";

                    link.innerHTML = `
                        <div class="meibo-photo coming-soon">
                            <img src="${window.fixPath(comingSoonImg)}" alt="Coming Soon" class="meibo-img" loading="lazy">
                            <span class="meibo-tag">???</span>
                            <div class="coming-soon-overlay">Coming Soon</div>
                        </div>
                        <div class="meibo-info">
                            <p class="meibo-name">${comingSoonName}</p>
                        </div>
                    `;

                } else if (!visible) {
                    // 旧式の準備中表示（互換性のため残す）
                    const placeholderImage = castConfig.placeholderImage || '';
                    const preparingText = castConfig.preparingText || '準備中';

                    link.href = "javascript:void(0)";
                    link.style.cursor = "default";
                    link.classList.add("preparing");

                    link.innerHTML = `
                        <div class="meibo-photo preparing">
                            <img src="${window.fixPath(placeholderImage)}" alt="準備中" class="meibo-img silhouette" loading="lazy">
                            <span class="meibo-tag">${m.tagLabel}</span>
                        </div>
                        <div class="meibo-info">
                            <p class="meibo-name">???</p>
                        </div>
                    `;
                }

                return link;
            };

            list.forEach(m => {
                const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(m) : null;
                const revealLevel = displayInfo ? displayInfo.level : 3;
                if (revealLevel === 0) return;

                const firstForm = (m.forms && m.forms.length > 0) ? m.forms[0] : null;
                const card = createMemberCard(m, firstForm, 0, revealLevel);
                grid.appendChild(card);
            });

            // 少数カード中央揃え
            const cardCount = grid.children.length;
            if (cardCount === 1) grid.classList.add('meibo-grid--solo');
            else if (cardCount === 2) grid.classList.add('meibo-grid--duo');

            chapter.appendChild(grid);
            return chapter;
        };

        // 順次読み込み (Async Sequential Loading)
        const renderSequentially = async () => {
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            for (const sec of sectionOrder) {
                const list = grouped[sec];
                if (list && list.length > 0) {
                    const chapterEl = createLedgerChapter(sec, list);
                    peopleContainer.appendChild(chapterEl);

                    requestAnimationFrame(() => {
                        chapterEl.classList.add('is-visible');
                    });

                    await delay(SECTION_LOAD_MS);
                }
            }

            // rosterData 構築
            (window.membersData || []).forEach(m => {
                const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(m) : null;
                const level = displayInfo ? displayInfo.level : 3;
                if (level < 3) return;
                const sec = m.section;
                if (!sec) return;
                if (!rosterData[sec]) rosterData[sec] = [];
                const displayName = m.pickupName || (m.name || '').split('（')[0];
                rosterData[sec].push({ name: displayName, blurb: extractBlurb(m.introduction) });
            });

            // ロスター更新関数
            _updateRoster = (sectionName) => {
                const list = document.getElementById('ledger-roster-list');
                if (!list) return;
                const chars = rosterData[sectionName] || [];
                list.style.opacity = '0';
                setTimeout(() => {
                    list.innerHTML = chars.map(c =>
                        `<li><span class="roster-name">${c.name}</span>${c.blurb ? `<span class="roster-sep"> — </span><span class="roster-blurb">${c.blurb}</span>` : ''}</li>`
                    ).join('');
                    list.style.opacity = '1';
                }, 150);
            };

            // ScrollSpy: viewport 中央付近のセクションを検知
            const spy = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        const sec = e.target.dataset.section;
                        if (sec && sec !== _currentRosterSection) {
                            _currentRosterSection = sec;
                            _updateRoster(sec);
                        }
                    }
                });
            }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });

            document.querySelectorAll('.ledger-chapter[data-section]').forEach(el => spy.observe(el));

            // 初期表示
            const firstSection = Object.keys(rosterData)[0];
            if (firstSection) { _currentRosterSection = firstSection; _updateRoster(firstSection); }

            // 全て読み込み終わったら絞り込み機能を適用
            if (_filterCallback) _filterCallback();
        };

        renderSequentially();
    }

    /* -------------------------------------------------------
       2. PEOPLE FILTERING SYSTEM (絞り込み)
       ------------------------------------------------------- */
    const searchInput = document.getElementById('people-search');
    const tagFilterContainer = document.getElementById('people-tag-filter');
    const filterBtns = tagFilterContainer ? tagFilterContainer.querySelectorAll('.ledger-tab') : [];

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

    // フィルタ状態を返す純粋関数
    const getFilterState = () => {
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        const activeBtn = tagFilterContainer.querySelector('.ledger-tab.is-active');
        const tag = (activeBtn ? activeBtn.dataset.value : null) || 'all';
        const isFiltering = tag !== 'all' || query.length > 0;

        const targetSectionName = TAG_TO_SECTION[tag];
        const targetWrapper = targetSectionName
            ? document.querySelector(`#people-list-container .ledger-chapter[data-section="${targetSectionName}"]`)
            : null;

        const allCards = Array.from(document.querySelectorAll('#people-list-container .meibo-grid:not(.filter-injected-grid) .meibo-card'));
        const matchingCards = allCards.filter(card => {
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const tags = (card.getAttribute('data-tags') || '').toLowerCase();
            const nameMatch = !query || name.includes(query);
            if (targetWrapper) {
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
        document.querySelectorAll('#people-list-container .ledger-chapter').forEach(w => {
            w.style.display = '';
            const origGrid = w.querySelector('.meibo-grid:not(.filter-injected-grid)');
            const injGrid = w.querySelector('.filter-injected-grid');
            if (origGrid) origGrid.style.display = '';
            if (injGrid) injGrid.style.display = 'none';
        });
        document.querySelectorAll('#people-list-container .meibo-card').forEach(c => {
            c.style.display = '';
            c.classList.add('is-visible');
        });
    };

    // セクション絞り込み（章を1つだけ表示）
    const renderSectionFilter = (targetWrapper, matchingCards) => {
        const flatContainer = document.getElementById('people-filter-results');
        if (flatContainer) flatContainer.style.display = 'none';
        if (peopleContainer) peopleContainer.style.display = '';

        document.querySelectorAll('#people-list-container .ledger-chapter').forEach(w => {
            w.style.display = 'none';
        });

        targetWrapper.style.display = '';
        targetWrapper.classList.remove('is-visible');
        void targetWrapper.offsetWidth;
        requestAnimationFrame(() => targetWrapper.classList.add('is-visible'));

        const origGrid = targetWrapper.querySelector('.meibo-grid:not(.filter-injected-grid)');
        if (origGrid) origGrid.style.display = 'none';

        let injGrid = targetWrapper.querySelector('.filter-injected-grid');
        if (!injGrid) {
            injGrid = document.createElement('div');
            injGrid.className = 'meibo-grid filter-injected-grid';
            targetWrapper.appendChild(injGrid);
        }
        injGrid.style.display = '';
        injGrid.innerHTML = '';

        if (matchingCards.length === 0) {
            injGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted);">${NOT_FOUND_MSG}</p>`;
        } else {
            animateCardsIn(matchingCards, injGrid);
        }
    };

    // キャスト名絞り込み → フラットビュー（帳面内に展開）
    const renderFlatFilter = (matchingCards) => {
        let flatContainer = document.getElementById('people-filter-results');
        if (!flatContainer && peopleContainer) {
            flatContainer = document.createElement('div');
            flatContainer.id = 'people-filter-results';
            flatContainer.className = 'people-filter-results';
            const grid = document.createElement('div');
            grid.id = 'people-filter-grid';
            grid.className = 'meibo-grid';
            flatContainer.appendChild(grid);
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
    _filterCallback = applyPeopleFilter;

    if (searchInput) searchInput.addEventListener('input', applyPeopleFilter);

    // タブクリック
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            applyPeopleFilter();
            // ロスターも更新
            const clickedValue = btn.dataset.value;
            if (clickedValue !== 'all') {
                const sectionName = TAG_TO_SECTION[clickedValue];
                if (sectionName) { _currentRosterSection = sectionName; _updateRoster(sectionName); }
            } else {
                if (_currentRosterSection) _updateRoster(_currentRosterSection);
            }
        });
    });

    // URLパラメータからタグ自動適用
    const urlParams = new URLSearchParams(window.location.search);
    const urlTag = urlParams.get('tag');
    if (urlTag) {
        const matchBtn = tagFilterContainer.querySelector(`.ledger-tab[data-value="${urlTag}"]`);
        if (matchBtn) {
            filterBtns.forEach(b => b.classList.remove('is-active'));
            matchBtn.classList.add('is-active');
        }
    }
})();
