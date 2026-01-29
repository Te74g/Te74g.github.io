/**
 * home.js
 * Home page specific logic (Random Pickup, Event Filter)
 * Depends on: utils.js, data_members.js
 */

(function () {
    /* -------------------------------------------------------
       1. ランダムピックアップ (index.html)
       ------------------------------------------------------- */
    const pickupContainer = document.getElementById("random-pickup-grid");
    if (pickupContainer && window.membersData) {
        // シャッフルして3人選ぶ
        const shuffled = [...window.membersData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        selected.forEach((m, index) => {
            const a = document.createElement("a");
            a.className = "cheki-card reveal";
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

            pickupContainer.appendChild(a);

            // Initialize Switcher or Static Image
            let images = [];
            if (m.profileImages && m.profileImages.length > 0) {
                images = m.profileImages.map(p => window.fixPath(p));
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

            setTimeout(() => a.classList.add('is-visible'), 100);
        });
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
