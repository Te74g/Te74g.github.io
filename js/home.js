/**
 * home.js
 * Home page specific logic (Random Pickup, Event Filter)
 * Depends on: utils.js, data_members.js
 */

(async function () {
    // Wait for Manifest
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    /* -------------------------------------------------------
       0. 本日・翌日公開キャストバナー
       ------------------------------------------------------- */
    const revealBanner = document.getElementById('cast-reveal-banner');
    const revealSection = document.getElementById('cast-reveal-overlay');

    if (revealBanner && revealSection && window.membersData) {
        const isDebugMode = sessionStorage.getItem('debugMode') === 'true';
        const allowedRoles = ['店長', '副店長', '飼育', '野生', '妖怪'];
        const REVEAL_HOUR_JST = 18;

        const todayTargets = [];
        const tomorrowTargets = [];

        window.membersData.forEach(m => {
            if (!allowedRoles.includes(m.tagLabel)) return;
            if (!m.revealDate) return;

            const revealDt = new Date(m.revealDate + `T${String(REVEAL_HOUR_JST).padStart(2, '0')}:00:00+09:00`);
            const now = new Date();
            const diffMs = revealDt - now;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (isDebugMode) {
                // デバッグ: revealDate がある全員を today 扱いで表示
                todayTargets.push(m);
            } else {
                if (diffDays <= 0) {
                    // 今日公開済み（当日18時以降）
                    const midnight = new Date();
                    midnight.setHours(0, 0, 0, 0);
                    if (revealDt >= midnight) todayTargets.push(m);
                } else if (diffDays === 1) {
                    tomorrowTargets.push(m);
                }
            }
        });

        const buildCard = (member, isToday) => {
            const images = member.profileImages || [];
            const silPath = window.fixPath('assets/member/silhouette.webp');
            let imgBase, imgHover;

            if (isToday) {
                imgBase = images[0] ? window.fixPath(images[0]) : silPath;
                imgHover = images[1] ? window.fixPath(images[1]) : imgBase;
            } else {
                // 明日: シルエット固定
                const sil = images[0]
                    ? window.fixPath(images[0]).replace('.webp', '_silhouette.webp')
                    : silPath;
                imgBase = sil;
                imgHover = sil;
            }

            const href = window.fixPath(`member/profile.html?id=${member.id}`);
            const revealDt = member.revealDate
                ? new Date(member.revealDate + `T${String(REVEAL_HOUR_JST).padStart(2, '0')}:00:00+09:00`)
                : null;
            const dateLabel = !isToday && revealDt
                ? `明日 ${revealDt.getMonth() + 1}月${revealDt.getDate()}日 ${REVEAL_HOUR_JST}:00 公開予定`
                : `本日 ${new Date().getMonth() + 1}月${new Date().getDate()}日 公開`;

            return `
            <a class="cast-reveal-card ${isToday ? 'is-today' : 'is-tomorrow'} reveal" href="${href}">
                <div class="cast-reveal-img-wrap">
                    <img class="img-base" src="${imgBase}" alt="${member.name}" loading="lazy">
                    <img class="img-hover" src="${imgHover}" alt="${member.name}" loading="lazy">
                </div>
                <div class="cast-reveal-info">
                    <span class="cast-reveal-tag">${member.tagLabel}</span>
                    <span class="cast-reveal-name">${isToday ? member.name : '？？？'}</span>
                    <span class="cast-reveal-date">${dateLabel}</span>
                </div>
            </a>`;
        };

        let html = '';

        if (todayTargets.length > 0) {
            html += `<div class="cast-reveal-group">
                <div class="cast-reveal-group-label">✦ 本日公開</div>
                <div class="cast-reveal-cards">
                    ${todayTargets.map(m => buildCard(m, true)).join('')}
                </div>
            </div>`;
        }

        if (tomorrowTargets.length > 0) {
            html += `<div class="cast-reveal-group">
                <div class="cast-reveal-group-label">◈ 明日公開</div>
                <div class="cast-reveal-cards">
                    ${tomorrowTargets.map(m => buildCard(m, false)).join('')}
                </div>
            </div>`;
        }

        if (html) {
            // Section banner (mobile: above News)
            revealBanner.innerHTML = html;
            revealSection.style.display = '';

            // Hero overlay (desktop: right side of hero)
            const heroOverlay = document.getElementById('cast-reveal-hero');
            if (heroOverlay) {
                heroOverlay.innerHTML = html;
                heroOverlay.style.display = '';
            }
        }
    }

    /* -------------------------------------------------------
       1. ランダムピックアップ (index.html)
       ------------------------------------------------------- */
    const pickupContainer = document.getElementById("random-pickup-grid");
    if (pickupContainer && window.membersData) {
        // キャスト表示制御の設定を取得
        const castConfig = window.siteConfig?.castDisplay || {};
        const showAll = castConfig.showAllMembers;
        const visibleList = castConfig.visibleMembers || [];

        // Filter members by allowed roles (exclude 'スタッフ')
        const allowedRoles = ['店長', '副店長', '飼育', '野生', '妖怪'];

        // 表示許可されたメンバーのみフィルタ（revealLevel 2以上のみランダムピックアップに表示）
        const filteredMembers = window.membersData.filter(m => {
            if (!allowedRoles.includes(m.tagLabel)) return false;
            if (!window.isMemberVisible(m, castConfig)) return false;
            if (!window.shouldShowItem(m)) return false;

            const level = window.getRevealLevel ? window.getRevealLevel(m) : 3;
            return level >= 2; // revealLevel 2（シルエット）も表示する
        });

        // 表示可能なメンバーがいない場合はセクションを非表示
        if (filteredMembers.length === 0) {
            const section = pickupContainer.closest('section');
            if (section) section.style.display = 'none';
        } else {
            // シャッフルして3人選ぶ
            const shuffled = [...filteredMembers].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);

            selected.forEach((m, index) => {
                // Create Wrapper for Animation
                const wrapper = document.createElement("div");
                wrapper.className = "reveal";
                wrapper.style.width = "100%"; // Ensure it fills grid cell
                wrapper.style.display = "flex"; // Ensure centering if needed
                wrapper.style.justifyContent = "center";

                const a = document.createElement("a");
                const pinClass = window.getPinClass(m.tags);
                a.className = `cheki-card ${pinClass}`; // Add specific pin color class
                const url = m.link || `member/profile.html?id=${m.id}`;
                a.href = window.fixPath(url);

                // Create container for image
                const visualDiv = document.createElement('div');
                visualDiv.className = "cheki-visual";

                const bgPath = window.getMemberBackground(m.tags);
                if (bgPath) {
                    visualDiv.style.backgroundImage = `url('${window.fixPath(bgPath)}')`;
                    visualDiv.style.backgroundSize = "cover";
                    visualDiv.style.backgroundPosition = "center";
                }

                a.appendChild(visualDiv);

                // Name label
                const nameDiv = document.createElement('div');
                nameDiv.className = "cheki-name";
                nameDiv.textContent = m.pickupName || m.name;
                a.appendChild(nameDiv);

                a.appendChild(nameDiv);

                wrapper.appendChild(a);
                pickupContainer.appendChild(wrapper);

                // getMemberDisplayInfo を通じて正しい画像パスを取得（シルエット対応）
                const castConfig2 = window.siteConfig?.castDisplay || {};
                const displayInfo = window.getMemberDisplayInfo
                    ? window.getMemberDisplayInfo(m, castConfig2)
                    : null;

                const effectiveImagePaths = displayInfo?.imagePath || m.profileImages || (m.image ? [m.image] : []);

                let images = [];
                if (effectiveImagePaths && effectiveImagePaths.length > 0) {
                    images = effectiveImagePaths.map(p => window.fixPath(p));
                }

                if (images.length > 0) {
                    // If multiple, interactive switcher without indicators
                    if (images.length > 1) {
                        visualDiv.classList.add('profile-switcher');
                        // Ensure ProfileImageSwitcher is available
                        if (window.ProfileImageSwitcher) {
                            new ProfileImageSwitcher(visualDiv, images, { showIndicators: false });
                        } else {
                            // Fallback
                            visualDiv.innerHTML = `<img src="${images[0]}" alt="${m.name}" class="cheki-img"><span class="cheki-tag-badge">${m.tagLabel}</span>`;
                        }
                    } else {
                        // Single image standard
                        visualDiv.innerHTML = `<img src="${images[0]}" alt="${m.name}" class="cheki-img"><span class="cheki-tag-badge">${m.tagLabel}</span>`;
                    }

                    // Re-append badge (if not simple img)
                    // Note: If using ProfileImageSwitcher, it clears content. So we append badge after.

                    const badgeText = m.tagLabel.split(/[\s/／]+/)[0] || m.tagLabel;
                    const badge = document.createElement('span');
                    badge.className = "cheki-tag-badge";
                    badge.textContent = badgeText;
                    badge.style.zIndex = "5";
                    visualDiv.appendChild(badge);
                }

                // Frame Overlay
                const fPath = window.getMemberFrame(m.tags);
                if (fPath) {
                    const frameEl = document.createElement('div');
                    frameEl.style.position = 'absolute';
                    frameEl.style.inset = '0';
                    frameEl.style.backgroundImage = `url('${window.fixPath(fPath)}')`;
                    frameEl.style.backgroundSize = '100% 100%';
                    frameEl.style.pointerEvents = 'none';
                    frameEl.style.zIndex = '4'; // Badge is 5, so 4 is below badge but above image
                    visualDiv.appendChild(frameEl);
                }

                // Staggered Entry (Animates the wrapper)
                const delay = 100 + index * 200;
                setTimeout(() => {
                    wrapper.classList.add('is-visible');
                }, delay);
            });
        }
    }

    /* -------------------------------------------------------
       2. Event filtering (search + status) for Home Page
       ------------------------------------------------------- */
    const q = document.getElementById("q");
    const status = document.getElementById("status");
    const grid = document.getElementById("eventGrid");
    const empty = document.getElementById("empty");

    if (grid) {
        const applyFilter = () => {
            const query = (q?.value || "").trim().toLowerCase();
            const st = status?.value || "all";
            const cards = Array.from(grid.querySelectorAll("[data-status]"));

            let visible = 0;

            cards.forEach((card) => {
                const s = card.getAttribute("data-status") || "";
                const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
                const text = (card.textContent || "").toLowerCase();

                const okStatus = st === "all" || s === st;
                const okQuery = !query || keywords.includes(query) || text.includes(query);

                const ok = okStatus && okQuery;
                card.style.display = ok ? "" : "none";
                if (ok) visible += 1;
            });

            if (empty) empty.hidden = visible !== 0;
        };

        q?.addEventListener("input", applyFilter);
        status?.addEventListener("change", applyFilter);
        applyFilter();
    }
})();
