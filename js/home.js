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
       1. ランダムピックアップ (index.html)
       ------------------------------------------------------- */
    const pickupContainer = document.getElementById("random-pickup-grid");
    if (pickupContainer && window.membersData) {
        // キャスト表示制御の設定を取得
        const castConfig = window.siteConfig?.castDisplay || {};
        const showAll = castConfig.showAllMembers;
        const visibleList = castConfig.visibleMembers || [];

        // メンバーが表示許可されているか判定する関数
        const isMemberVisible = (member) => {
            if (showAll) return true;
            // 運営部・スタッフは常に表示
            if (member.section === "運営部" || member.section === "スタッフ") return true;
            return visibleList.includes(member.id);
        };

        // Filter members by allowed roles (exclude 'スタッフ')
        const allowedRoles = ['店長', '副店長', '飼育', '野生', '妖怪'];

        // 表示許可されたメンバーのみフィルタ（revealLevel 3のみランダムピックアップに表示）
        const filteredMembers = window.membersData.filter(m => {
            // まず基本フィルタ
            if (!allowedRoles.includes(m.tagLabel)) return false;
            if (!isMemberVisible(m)) return false;
            if (!window.shouldShowItem(m)) return false;

            // revealLevel 3（完全公開）のみランダムピックアップに表示
            const level = window.getRevealLevel ? window.getRevealLevel(m) : 3;
            return level === 3;
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

                // Initialize Switcher or Static Image
                // forms を持つメンバーの場合、最初のフォームの画像を使用
                let effectiveImages = m.profileImages;
                if (m.forms && m.forms.length > 0 && m.forms[0].profileImages && m.forms[0].profileImages.length > 0) {
                    effectiveImages = m.forms[0].profileImages;
                }

                let images = [];
                if (effectiveImages && effectiveImages.length > 0) {
                    images = effectiveImages.map(p => window.fixPath(p));
                } else if (m.image) {
                    images = [window.fixPath(m.image)];
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

                    const badge = document.createElement('span');
                    badge.className = "cheki-tag-badge";
                    badge.textContent = m.tagLabel;
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
