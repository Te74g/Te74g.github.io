/**
 * people.js
 * Cast list generation and filtering
 */

import { State, updateState } from '../app/state.js';
import { getUrlParam, updateUrlParam, removeUrlParam, fixPath } from '../app/url.js';
import { getMembersData, getSiteConfig } from '../app/data.js';
import { shouldShowItem, isMemberVisible, getMemberDisplayInfo, getPinClass, getMemberBackground, getMemberFrame, normalizePathList } from '../app/member-utils.js';

export async function initPeoplePage() {
    // Wait for Manifest
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    // ---- ページ構造構築 ----
    const main = document.getElementById('main');
    if (main) {
        main.insertAdjacentHTML('beforeend', `
            <section class="section people-page-section">
                <div class="container">
                    <header class="section-head reveal is-visible">
                        <h1 class="section-title cafe-signboard">キャスト紹介</h1>
                    </header>
                    <div class="toolbar reveal is-visible">
                        <div class="field">
                            <div id="people-tag-filter" class="tag-filter-buttons">
                                <button class="tag-filter-btn" data-value="all">すべて</button>
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
            <div id="people-filter-results" class="people-filter-results" style="display: none;">
                <div class="container">
                    <div id="people-filter-grid" class="cheki-grid"></div>
                </div>
            </div>
        `);
    }

    const peopleContainer = document.getElementById('people-list-container');
    const flatContainer = document.getElementById('people-filter-results');
    const flatGrid = document.getElementById('people-filter-grid');
    const membersData = getMembersData();

    if (!peopleContainer || !membersData || membersData.length === 0) return;

    // ---- 設定定数 ----
    const SECTION_ORDER = ['運営部', '飼育区画', '野生区画', '妖怪区画', 'スタッフ'];
    const KUKAKU_SECTION_IMGS = {
        '飼育区画': 'assets/kukaku/shiiku.webp',
        '野生区画': 'assets/kukaku/yasei.webp',
        '妖怪区画': 'assets/kukaku/youkai.webp',
    };
    const NOT_FOUND_MSG = '該当するキャストが見つかりませんでした。';
    const TAG_TO_SECTION = {
        '運営': '運営部', '店長': '運営部', '副店長': '運営部',
        '飼育': '飼育区画', '野生': '野生区画',
        '妖怪': '妖怪区画', 'スタッフ': 'スタッフ',
    };

    // --- State Initialization ---
    // App Kernel の State 管理へ委譲
    const searchInput = document.getElementById('people-search');
    const tagFilterContainer = document.getElementById('people-tag-filter');
    const filterBtns = tagFilterContainer ? Array.from(tagFilterContainer.querySelectorAll('.tag-filter-btn')) : [];

    // Parse URL on init via url.js
    const urlTag = getUrlParam('tag');
    if (urlTag && filterBtns.some(b => b.dataset.value === urlTag)) {
        updateState('people', { tag: urlTag });
    }

    // Set initial button active state
    filterBtns.forEach(b => {
        if (b.dataset.value === State.people.tag) b.classList.add('is-active');
        else b.classList.remove('is-active');
    });

    // --- DOM Construction (一回だけ描く) ---
    const visibleMembers = membersData.filter(m => shouldShowItem(m));
    const grouped = {};
    SECTION_ORDER.forEach(sec => grouped[sec] = []);

    visibleMembers.forEach(member => {
        const sec = member.section || 'その他';
        if (!grouped[sec]) grouped[sec] = [];
        grouped[sec].push(member);
    });

    const castConfig = getSiteConfig().castDisplay || {};
    const allCardElements = []; // { card: HTMLElement, data: Object, section: string, isVisible: boolean }

    const resolveHref = (href) => {
        if (!href) return '#';
        if (/^(https?:|mailto:|tel:|#|\/)/.test(href)) return href;
        return fixPath(href);
    };

    const getProfileHref = (memberId, formIndex) => {
        const base = `cast/${memberId}/`;
        if (typeof formIndex === 'number' && formIndex > 0) {
            return `${base}?form=${formIndex}`;
        }
        return base;
    };

    const createMemberCard = (m, form, formIndex, revealLevel) => {
        const link = document.createElement('a');
        const formProfileImages = normalizePathList(form && form.profileImages);
        const memberProfileImages = normalizePathList(m.profileImages);
        const formImage = normalizePathList(form && form.image)[0];
        const memberImage = normalizePathList(m.image)[0];
        const effectiveMember = form ? {
            ...m,
            name: m.name,
            pickupName: m.pickupName || m.name,
            tagLabel: m.tagLabel,
            profileImages: formProfileImages.length > 0 ? formProfileImages : memberProfileImages,
            image: formImage || memberImage || m.image,
        } : m;

        const pinClass = getPinClass(m.tags);
        link.className = `cheki-card ${pinClass}`;
        // clone等でアニメーションを再発火させないため、最初から表示状態のクラスをもたせる。
        // （表示/非表示は display: none などの CSS 切替で済ませる）
        link.classList.add('reveal', 'is-visible');

        link.setAttribute('data-name', effectiveMember.name);
        link.setAttribute('data-tags', m.tags);

        if (revealLevel >= 3) {
            const url = m.link || getProfileHref(m.id, form && formIndex !== undefined ? formIndex : null);
            link.href = resolveHref(url);
            const displayName = effectiveMember.pickupName || effectiveMember.name;
            const profileImages = normalizePathList(effectiveMember.profileImages);
            const fallbackImage = normalizePathList(effectiveMember.image)[0];
            const targetImage = profileImages.length > 0
                ? profileImages[Math.floor(Math.random() * profileImages.length)]
                : fallbackImage;

            const bgPath = getMemberBackground(m.tags);
            const bgStyle = bgPath ? `style="background-image: url('${fixPath(bgPath)}'); background-size: cover; background-position: center;"` : '';
            const fPath = getMemberFrame(m.tags);
            const frameHtml = fPath ? `<div class="cheki-frame" style="background-image:url('${fixPath(fPath)}');"></div>` : '';

            link.innerHTML = `
                <div class="cheki-visual" ${bgStyle}>
                    <img src="${fixPath(targetImage || 'assets/member/silhouette.webp')}" alt="${effectiveMember.name}" class="cheki-img" loading="lazy">
                    <span class="cheki-tag-badge">${effectiveMember.tagLabel}</span>
                    ${frameHtml}
                </div>
                <div class="cheki-name">${displayName}</div>
            `;
        } else if (revealLevel === 2) {
            const url = m.link || getProfileHref(m.id);
            link.href = resolveHref(url);
            link.classList.add('silhouette-mode');
            const displayInfo = getMemberDisplayInfo ? getMemberDisplayInfo(m) : null;
            const silhouetteImg = normalizePathList(displayInfo && displayInfo.imagePath)[0]
                || normalizePathList(castConfig.placeholderImage)[0]
                || normalizePathList(m.image)[0]
                || 'assets/member/silhouette.webp';
            const bgPath = getMemberBackground(m.tags);
            const bgStyle = bgPath ? `style="background-image: url('${fixPath(bgPath)}'); background-size: cover; background-position: center;"` : '';

            link.innerHTML = `
                <div class="cheki-visual silhouette-mode" ${bgStyle}>
                    <img src="${fixPath(silhouetteImg)}" alt="${effectiveMember.name}" class="cheki-img silhouette" loading="lazy">
                    <span class="cheki-tag-badge">${effectiveMember.tagLabel}</span>
                </div>
                <div class="cheki-name">${effectiveMember.name}</div>
            `;
        } else if (revealLevel === 1) {
            link.href = 'javascript:void(0)';
            link.style.cursor = 'default';
            link.classList.add('coming-soon');
            const comingSoonImg = castConfig.comingSoonImage || '';
            const comingSoonName = castConfig.comingSoonName || '???';
            link.innerHTML = `
                <div class="cheki-visual coming-soon">
                    <img src="${fixPath(comingSoonImg)}" alt="Coming Soon" class="cheki-img" loading="lazy">
                    <span class="cheki-tag-badge">???</span>
                    <div class="coming-soon-overlay">Coming Soon</div>
                </div>
                <div class="cheki-name">${comingSoonName}</div>
            `;
        } else {
            const visible = isMemberVisible(m, castConfig);
            if (!visible) {
                const placeholderImage = castConfig.placeholderImage || '';
                const preparingText = castConfig.preparingText || '準備中';
                link.href = 'javascript:void(0)';
                link.style.cursor = 'default';
                link.classList.add('preparing');
                link.innerHTML = `
                    <div class="cheki-visual preparing">
                        <img src="${fixPath(placeholderImage)}" alt="準備中" class="cheki-img silhouette" loading="lazy">
                        <span class="cheki-tag-badge">${m.tagLabel}</span>
                        <div class="preparing-overlay">${preparingText}</div>
                    </div>
                    <div class="cheki-name">???</div>
                `;
            }
        }
        return link;
    };

    const bgMap = {
        '運営部': '../assets/page/unei_low_res.webp',
        '飼育区画': '../assets/page/shiiku_low_res.webp',
        '野生区画': '../assets/page/yasei_low_res.webp',
        '妖怪区画': '../assets/page/yo-kai_low_res.webp',
        'スタッフ': '../assets/page/staff_low_res.webp'
    };

    // Construct the DOM for all sections ONCE
    const sectionElements = {};
    SECTION_ORDER.forEach(sec => {
        const list = grouped[sec];
        if (!list || list.length === 0) return;

        const wrapper = document.createElement('section');
        wrapper.className = 'people-section-wrapper reveal is-visible';
        wrapper.dataset.section = sec;

        // Hide by default unless it's needed in the initial state
        wrapper.style.display = 'none';

        const bgDiv = document.createElement('div');
        bgDiv.className = 'people-section-bg';
        const bgPath = bgMap[sec] ? fixPath(bgMap[sec]) : '';
        if (bgPath) bgDiv.style.backgroundImage = `url('${bgPath}')`;
        else bgDiv.style.backgroundColor = 'transparent';
        wrapper.appendChild(bgDiv);

        const innerContainer = document.createElement('div');
        innerContainer.className = 'container';

        const kukakuImg = KUKAKU_SECTION_IMGS[sec];
        if (kukakuImg) {
            const header = document.createElement('div');
            header.className = 'kukaku-section-header';
            header.innerHTML = `
                <div class="perf-strip" aria-hidden="true"></div>
                <div class="kukaku-section-sign">
                    <img src="${fixPath(kukakuImg)}" alt="${sec}" class="kukaku-section-img" loading="lazy">
                </div>
                <div class="perf-strip" aria-hidden="true"></div>
            `;
            innerContainer.appendChild(header);
        } else {
            const divider = document.createElement('div');
            divider.className = 'section-divider';
            divider.innerHTML = `<span class="section-label">${sec}</span>`;
            innerContainer.appendChild(divider);
        }

        const grid = document.createElement('div');
        grid.className = 'cheki-grid';

        list.forEach(m => {
            const displayInfo = getMemberDisplayInfo ? getMemberDisplayInfo(m) : null;
            const revealLevel = displayInfo ? displayInfo.level : 3;
            if (revealLevel === 0) return;

            const firstForm = (m.forms && m.forms.length > 0) ? m.forms[0] : null;
            const card = createMemberCard(m, firstForm, 0, revealLevel);

            allCardElements.push({
                card: card,
                name: (card.getAttribute('data-name') || '').toLowerCase(),
                tags: (card.getAttribute('data-tags') || '').toLowerCase(),
                section: sec,
                originalParent: grid
            });

            grid.appendChild(card);
        });

        // Add "Not found" message container
        const noResults = document.createElement('p');
        noResults.className = 'no-results-msg';
        noResults.style.display = 'none';
        noResults.style.gridColumn = '1/-1';
        noResults.style.textAlign = 'center';
        noResults.style.padding = '2rem';
        noResults.style.color = '#fff';
        noResults.textContent = NOT_FOUND_MSG;
        grid.appendChild(noResults);

        innerContainer.appendChild(grid);
        wrapper.appendChild(innerContainer);
        peopleContainer.appendChild(wrapper);

        sectionElements[sec] = { wrapper, grid, noResults };
    });

    // --- Core Filter Render Engine ---
    // 絞り込みは表示切替だけにする。DOMを破棄しない。
    const renderFilterState = () => {
        const { tag, query } = State.people;
        const isFiltering = tag !== 'all' || query.length > 0;
        const targetSection = TAG_TO_SECTION[tag] || null;

        // Determine which cards match the current state
        let visibleCount = 0;
        allCardElements.forEach(item => {
            const nameMatch = !query || item.name.includes(query);

            // For section tags (e.g. 飼育), matching shouldn't be by the string "タグ" on the card,
            // but by the card's native section, just in case "運営" is tagged on a "飼育" member.
            let tagMatch = false;
            if (targetSection) {
                tagMatch = item.section === targetSection;
            } else {
                tagMatch = (tag === 'all' || item.tags.includes(tag.toLowerCase()));
            }

            item.isVisible = nameMatch && tagMatch;
            if (item.isVisible) visibleCount++;
        });

        // Toggle display logic
        if (!isFiltering) {
            // "全て" 表示 -> 全セクション表示
            flatContainer.style.display = 'none';
            peopleContainer.style.display = '';

            Object.keys(sectionElements).forEach(sec => {
                const { wrapper, grid, noResults } = sectionElements[sec];
                wrapper.style.display = ''; // Show all wrappers
                noResults.style.display = 'none';

                // Return cards to native grids
                allCardElements.filter(i => i.section === sec).forEach(i => {
                    i.card.style.display = ''; // Show all native cards
                    if (i.card.parentElement !== grid) grid.appendChild(i.card);
                });
            });

        } else if (targetSection) {
            // 特定セクション絞り込み -> 該当セクションだけ表示
            flatContainer.style.display = 'none';
            peopleContainer.style.display = '';

            Object.keys(sectionElements).forEach(sec => {
                const { wrapper, grid, noResults } = sectionElements[sec];

                if (sec === targetSection) {
                    wrapper.style.display = '';

                    const sectionCards = allCardElements.filter(i => i.section === sec);
                    let localCount = 0;

                    sectionCards.forEach(i => {
                        i.card.style.display = i.isVisible ? '' : 'none';
                        if (i.card.parentElement !== grid) grid.appendChild(i.card);
                        if (i.isVisible) localCount++;
                    });

                    noResults.style.display = localCount === 0 ? 'block' : 'none';

                } else {
                    wrapper.style.display = 'none';
                }
            });

        } else {
            // フラット絞り込み (e.g. キャスト、スタッフ)
            peopleContainer.style.display = 'none';
            flatContainer.style.display = '';

            flatGrid.innerHTML = ''; // clear flat grid

            // append active cards into flat container
            allCardElements.forEach(i => {
                if (i.isVisible) {
                    i.card.style.display = '';
                    flatGrid.appendChild(i.card);
                } else {
                    i.card.style.display = 'none';
                }
            });

            if (visibleCount === 0) {
                flatGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted);">${NOT_FOUND_MSG}</p>`;
            }
        }
    };

    // --- Interaction Events ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            updateState('people', { query: e.target.value.trim().toLowerCase() });
            renderFilterState();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextTag = btn.dataset.value;
            if (State.people.tag === nextTag) return; // Guard: 同じタグなら何もしない

            updateState('people', { tag: nextTag });

            // Sync with URL 
            if (nextTag === 'all') removeUrlParam('tag');
            else updateUrlParam('tag', nextTag);

            filterBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            renderFilterState();
        });
    });

    // Run initial state render entirely synchronous, blocking empty layouts before paint!
    renderFilterState();
}
