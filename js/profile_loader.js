/**
 * Profile Loader
 * Dynamically loads member profile data based on URL query parameter `?id=...`
 * Requires: site_data.js (membersData), profile_switcher.js (ProfileImageSwitcher)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Manifest to ensure WebP paths are resolved
    if (window.manifestPromise) {
        try { await window.manifestPromise; } catch (e) { console.warn('Manifest wait failed', e); }
    }

    if (typeof membersData === 'undefined') {
        console.error('membersData is not defined. Make sure site_data.js is loaded.');
        return;
    }

    // 1. Get Member ID from URL
    const params = new URLSearchParams(window.location.search);
    let memberId = params.get('id');

    // Fallback: If no ID in URL, check if there's a hardcoded ID in the HTML (e.g. for testing)
    if (!memberId) {
        const testContainer = document.querySelector('[data-member-id]');
        if (testContainer) {
            const val = testContainer.getAttribute('data-member-id');
            if (val && val !== 'INSERT_ID_HERE') {
                memberId = val;
            }
        }
    }

    if (!memberId) {
        console.warn('No member ID specified in URL (?id=...)');
        // Optional: Redirect to member list or show 404
        // window.location.href = '../pages/people.html';
        return;
    }

    const member = membersData.find(m => m.id === memberId);
    if (!member) {
        console.error(`Member not found for ID: ${memberId}`);
        document.querySelector('main').innerHTML = '<div class="container"><p>Member not found.</p></div>';
        return;
    }

    // ==========================================
    // revealLevelに応じたアクセス制御
    // ==========================================
    const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(member) : null;
    const revealLevel = displayInfo ? displayInfo.level : 3;

    // Level 0（非表示）または Level 1（Coming Soon）はプロフィールページにアクセス不可
    if (revealLevel <= 1) {
        // キャスト一覧にリダイレクト
        window.location.href = window.fixPath ? window.fixPath('pages/people.html') : '../pages/people.html';
        return;
    }
    // ==========================================
    // Render Content
    // ==========================================

    // 現在の形態を取得（forms がある場合）
    // URLパラメータから form インデックスを読み取る
    const formParam = params.get('form');
    let currentFormIndex = formParam !== null ? parseInt(formParam, 10) : 0;
    if (isNaN(currentFormIndex) || currentFormIndex < 0) currentFormIndex = 0;
    // forms 配列の範囲内に制限
    if (member.forms && member.forms.length > 0) {
        currentFormIndex = Math.min(currentFormIndex, member.forms.length - 1);
    }
    let activeForm = null;

    // 形態に基づいてメンバー情報をマージする関数
    const getMergedMemberData = (formIndex) => {
        if (!member.forms || member.forms.length === 0) {
            return member;
        }
        const form = member.forms[formIndex] || member.forms[0];
        // フォームのプロパティで親を上書き
        return {
            ...member,
            name: form.name || member.name,
            tagLabel: form.tagLabel || member.tagLabel,
            profileImages: (form.profileImages && form.profileImages.length > 0) ? form.profileImages : member.profileImages,
            motifAnimal: form.motifAnimal || member.motifAnimal,
            motifIcon: form.motifIcon || member.motifIcon,
            introduction: form.introduction || member.introduction,
            goals: form.goals || member.goals,
            socials: form.socials || member.socials,
        };
    };

    // 形態切り替えボタンを生成
    if (member.forms && member.forms.length > 1) {
        const formSwitcherContainer = document.createElement('div');
        formSwitcherContainer.className = 'form-switcher';
        formSwitcherContainer.innerHTML = member.forms.map((form, index) =>
            `<button class="form-switcher-btn${index === currentFormIndex ? ' is-active' : ''}" data-form-index="${index}">${form.label}</button>`
        ).join('');

        // h1 の下に挿入
        const h1El = document.querySelector('h1');
        if (h1El && h1El.parentNode) {
            h1El.parentNode.insertBefore(formSwitcherContainer, h1El.nextSibling);
        }

        // クリックイベント
        formSwitcherContainer.querySelectorAll('.form-switcher-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newIndex = parseInt(btn.dataset.formIndex, 10);
                if (newIndex === currentFormIndex) return;

                currentFormIndex = newIndex;

                // ボタンのアクティブ状態を更新
                formSwitcherContainer.querySelectorAll('.form-switcher-btn').forEach((b, i) => {
                    b.classList.toggle('is-active', i === newIndex);
                });

                // コンテンツを更新
                updateFormContent(newIndex);
            });
        });
    }

    // 形態変更時にコンテンツを更新する関数
    const updateFormContent = (formIndex) => {
        const mergedMember = getMergedMemberData(formIndex);

        // 名前を更新
        const h1Title = document.querySelector('h1');
        if (h1Title) h1Title.textContent = mergedMember.name;
        document.title = `あにあめもりあ | ${mergedMember.name}`;

        // タグを更新
        const tagsContainer = document.getElementById('dynamic-tags-container');
        if (tagsContainer) {
            let tagsHtml = '';
            if (mergedMember.tagLabel) {
                tagsHtml += `<span class="tag" style="background:#000; color:#fff;">${mergedMember.tagLabel}</span>`;
            }
            if (member.tags) {
                const tagsList = member.tags.split(' ');
                tagsList.forEach(t => {
                    if (t !== mergedMember.tagLabel) {
                        tagsHtml += `<span class="tag tag--soft">${t}</span>`;
                    }
                });
            }
            tagsContainer.innerHTML = tagsHtml;
        }

        // モチーフ動物を更新
        const motifContainer = document.getElementById('dynamic-motif-container');
        if (motifContainer && mergedMember.motifAnimal && mergedMember.motifIcon) {
            let iconPath = window.fixPath(mergedMember.motifIcon);
            motifContainer.innerHTML = `
                <div class="motif-container">
                    <div class="motif-icon-box">
                        <img src="${iconPath}" alt="" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div class="motif-text-box">
                        <span>種族ː${mergedMember.motifAnimal}</span>
                    </div>
                </div>
            `;
            motifContainer.style.display = 'block';
        }

        // プロフィール画像を更新
        const switcherContainer = document.querySelector('.profile-switcher-container');
        if (switcherContainer && typeof ProfileImageSwitcher !== 'undefined') {
            let images = [];
            if (mergedMember.profileImages && mergedMember.profileImages.length > 0) {
                images = mergedMember.profileImages.map(p => window.fixPath(p));
            } else if (mergedMember.image) {
                images = [window.fixPath(mergedMember.image)];
            }

            if (images.length > 0) {
                switcherContainer.classList.add('profile-switcher');
                new ProfileImageSwitcher(switcherContainer, images, { showIndicators: true });
            }
        }
    };

    // 初期データを取得（forms がある場合は最初の形態）
    const initialMember = getMergedMemberData(0);

    // 0. Update Page Title and H1
    document.title = `あにあめもりあ | ${initialMember.name}`;
    const h1Title = document.querySelector('h1');
    if (h1Title) h1Title.textContent = initialMember.name;

    // 1. Tags
    const tagsContainer = document.getElementById('dynamic-tags-container');
    if (tagsContainer) {
        let tagsHtml = '';
        if (initialMember.tagLabel) {
            tagsHtml += `<span class="tag" style="background:#000; color:#fff;">${initialMember.tagLabel}</span>`;
        }
        if (member.tags) {
            const tagsList = member.tags.split(' ');
            tagsList.forEach(t => {
                if (t !== initialMember.tagLabel) {
                    tagsHtml += `<span class="tag tag--soft">${t}</span>`;
                }
            });
        }
        tagsContainer.innerHTML = tagsHtml;
    }

    // 2. Introduction (revealLevel 2では非表示)
    if (member.introduction && (revealLevel >= 3 || (displayInfo && displayInfo.showIntro))) {
        const introEl = document.getElementById('dynamic-intro-text');
        if (introEl) introEl.innerHTML = member.introduction;
    } else if (revealLevel === 2) {
        // シルエットモード: 自己紹介を準備中に置き換え
        const introEl = document.getElementById('dynamic-intro-text');
        if (introEl) introEl.innerHTML = '<p style="text-align:center; color: var(--muted);">詳細は近日公開予定です…</p>';
    }

    // 3. Goals (revealLevel 2では非表示)
    const goalsSection = document.querySelector('.goals-section');
    const shouldShowGoals = revealLevel >= 3 || (displayInfo && displayInfo.showGoals);

    if (shouldShowGoals && member.goals && Array.isArray(member.goals) && member.goals.length > 0) {
        if (goalsSection) goalsSection.style.display = 'block';
        const goalsContainer = document.getElementById('dynamic-goals-container');
        if (goalsContainer) {
            const randomGoal = member.goals[Math.floor(Math.random() * member.goals.length)];
            goalsContainer.innerHTML = `<div class="goals-text" style="margin-bottom:8px;">${randomGoal}</div>`;
        }
    } else {
        if (goalsSection) goalsSection.style.display = 'none';
    }

    // 4. Motif Animal
    if (initialMember.motifAnimal && initialMember.motifIcon) {
        const motifContainer = document.getElementById('dynamic-motif-container');
        if (motifContainer) {
            let iconPath = window.fixPath(initialMember.motifIcon);
            motifContainer.innerHTML = `
                <div class="motif-container">
                    <div class="motif-icon-box">
                        <img src="${iconPath}" alt="" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div class="motif-text-box">
                        <span>種族ː${initialMember.motifAnimal}</span>
                    </div>
                </div>
            `;
            motifContainer.style.display = 'block';
        }
    }

    // 5. Sign
    if (member.sign) {
        const signImg = document.getElementById('profile-sign-img');
        if (signImg) {
            signImg.src = window.fixPath(member.sign);
            signImg.style.display = 'block';
        }
    }

    // 6. Social Icons (revealLevel 2では非表示)
    const shouldShowSocials = revealLevel >= 3 || (displayInfo && displayInfo.showSocials);
    if (shouldShowSocials && member.socials && Array.isArray(member.socials)) {
        const socialContainer = document.getElementById('dynamic-socials-container');
        if (socialContainer) {
            let html = '';
            member.socials.forEach(s => {
                const type = s.type.toLowerCase();
                const url = s.url;
                let iconHtml = '';
                let colorClass = 'social-icon--brown';

                // Simple Icon Mapping
                if (type === 'youtube') {
                    colorClass = 'social-icon--red';
                    iconHtml = '<svg viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>';
                } else if (type === 'twitter') {
                    colorClass = 'social-icon--blue';
                    iconHtml = '<svg viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>';
                } else if (type === 'x') {
                    colorClass = 'social-icon--black';
                    iconHtml = '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
                } else if (type === 'facebook') {
                    colorClass = 'social-icon--blue';
                    iconHtml = '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
                } else if (type === 'vrchat') {
                    colorClass = 'social-icon--dark';
                    iconHtml = '<img src="../assets/logo/VRChat Logo Black.png" alt="VRChat" style="width: 50px; height: 50x; object-fit: contain;">';
                } else if (type === 'booth') {
                    colorClass = 'social-icon--red';
                    iconHtml = '<img src="../assets/logo/Booth_logo_icon.svg" alt="Booth" style="width: 45px; height: 45px; object-fit: contain;">';
                } else if (type === 'note') {
                    colorClass = 'social-icon--white'; // Custom class or style handling below
                    iconHtml = '<img src="../assets/icon/note_icon.svg" alt="note" style="width: 85%; height: 85%; object-fit: contain;">';
                } else {
                    iconHtml = '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>';
                }

                let style = '';
                if (type === 'youtube') style = 'background-color: #FF0000; border-color: #FF0000; color: white;';
                if (type === 'x') style = 'background-color: #000000; border-color: #000000; color: white;';
                if (type === 'vrchat') style = 'background-color: #ffffff; border-color: #ccc;';
                if (type === 'note') style = 'background-color: #ffffff; border-color: #ccc; display: flex; align-items: center; justify-content: center;';

                html += `<a href="${url}" class="social-icon ${colorClass}" target="_blank" aria-label="${type}" style="${style}">
                    ${iconHtml}
                </a>`;
            });
            socialContainer.innerHTML = html;
        }
    }

    // 7. Related Cast (revealLevel 2では非表示)
    const relatedContainer = document.getElementById('dynamic-related-cast');
    if (relatedContainer && revealLevel >= 3) {
        const relatedMembers = getRelatedMembers(member, membersData);
        let html = '';
        relatedMembers.forEach(relatedMember => {
            let imgPath;
            if (relatedMember.profileImages && relatedMember.profileImages.length > 0) {
                // Randomly select one image
                const randomIndex = Math.floor(Math.random() * relatedMember.profileImages.length);
                imgPath = relatedMember.profileImages[randomIndex];
            } else {
                imgPath = relatedMember.image;
            }
            imgPath = window.fixPath(imgPath);

            // Link path fix
            let linkPath = relatedMember.link || `member/profile.html?id=${relatedMember.id}`;
            // Assuming we are in member/ directory, we want links to be like "profile.html?id=rayno"
            // BUT existing links in data are "member/profile_rayno.html".
            // We should ideally convert these to the new format if we want fully dynamic,
            // OR keep using the old files if they exist.
            // For now, let's respect the `link` property in data, but fix relative path.

            // Fix: If we are migrating to dynamic, we might want to change this.
            // But user said "Experiment with Ten". So others still use old links.
            // We'll trust the link in data, just fixing relative path.
            if (!linkPath.startsWith('http') && !linkPath.startsWith('../') && !linkPath.startsWith('/')) {
                // linkPath is "member/profile_x.html". Current page is "member/profile.html".
                // So we want "../member/profile_x.html" -> "./profile_x.html"
                // simple fix:
                if (linkPath.startsWith('member/')) {
                    linkPath = linkPath.replace('member/', './');
                } else {
                    linkPath = './' + linkPath;
                }
            }
            // Better robust fix logic:
            if (!linkPath.match(/^(http|\/)/)) {
                // If it's relative, and we are in member/, and link is member/..., remove member/
                if (linkPath.startsWith('member/')) linkPath = linkPath.replace('member/', '');
            }

            html += `
                <a href="${linkPath}" class="cast-slot" title="${relatedMember.name}">
                    <img src="${imgPath}" alt="${relatedMember.name}">
                </a>
            `;
        });
        relatedContainer.innerHTML = html;
    }

    // 8. Profile Image Switcher & Background
    const switcherContainer = document.querySelector('.profile-switcher-container');
    if (switcherContainer) {
        switcherContainer.setAttribute('data-member-id', member.id);

        // revealLevel 2（シルエット）の場合、画像をシルエットに置き換え
        if (revealLevel === 2) {
            const silhouetteImg = displayInfo && displayInfo.imagePath
                ? displayInfo.imagePath[0]
                : (window.siteConfig?.castDisplay?.placeholderImage || member.image);

            // ProfileImageSwitcherが読み込む前に画像パスを上書き
            const chekiImg = switcherContainer.querySelector('.cheki-img');
            if (chekiImg) {
                chekiImg.src = window.fixPath(silhouetteImg);
                chekiImg.style.filter = 'none'; // フィルターをリセット
            }

            // サムネイルも非表示（シルエットは1枚のみ）
            const thumbContainer = switcherContainer.querySelector('.thumbnail-strip');
            if (thumbContainer) {
                thumbContainer.style.display = 'none';
            }
        }

        // Background Logic using utils.js helper
        const bgElement = document.querySelector('.profile-bg-texture');
        const bgPath = window.getMemberBackground(member.tags);
        if (bgPath && bgElement) {
            bgElement.style.backgroundImage = `url('${window.fixPath(bgPath)}')`;
            console.log('Applied background:', bgPath);
        }

        // Frame Overlay Logic (シルエットモードでは非表示)
        const existingFrame = document.querySelector('.profile-frame-overlay');
        if (existingFrame) existingFrame.remove();

        if (revealLevel >= 3) {
            const framePath = window.getMemberFrame(member.tags);
            if (framePath) {
                const visualArea = document.querySelector('.cheki-visual');
                if (visualArea) {
                    const frameEl = document.createElement('div');
                    frameEl.className = 'profile-frame-overlay';
                    frameEl.style.position = 'absolute';
                    frameEl.style.inset = '0';
                    frameEl.style.backgroundImage = `url('${window.fixPath(framePath)}')`;
                    frameEl.style.backgroundSize = '100% 100%';
                    frameEl.style.pointerEvents = 'none';
                    frameEl.style.zIndex = '3';
                    visualArea.appendChild(frameEl);
                    console.log('Applied frame:', framePath);
                } else {
                    console.warn('.cheki-visual not found');
                }
            }
        }

        // Trigger Switcher Init manually for this specific container if possible,
        // or just re-run initAll() (only for full reveal)
        if (revealLevel >= 3 && typeof ProfileImageSwitcher !== 'undefined') {
            ProfileImageSwitcher.initAll();
        }
    }

    // 9. Page Background (Section-based) & Loading Sequence
    const pageBgPath = window.getPageBackground(member.tags);

    // Elements to reveal after background loads
    const contentElements = document.querySelectorAll('.profile-visual-area, .profile-text-area, .profile-related-area');

    // Initially hide content (if not already handled by CSS)
    contentElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.8s ease';
        el.classList.remove('reveal'); // Remove default reveal if present to control manually
    });

    const revealContent = () => {
        // Add a slight delay for dramatic effect
        setTimeout(() => {
            contentElements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.classList.add('is-visible'); // If using CSS animations
                }, index * 200); // Staggered fade in
            });
        }, 300);
    };

    if (pageBgPath) {
        const fixedBgEl = document.getElementById('fixed-page-background');
        const bgUrl = window.fixPath(pageBgPath);

        // Preload Image
        const img = new Image();
        img.src = bgUrl;

        img.onload = () => {
            if (fixedBgEl) {
                fixedBgEl.style.backgroundImage = `url('${bgUrl}')`;
            } else {
                document.body.style.backgroundImage = `url('${bgUrl}')`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundAttachment = 'fixed';
            }
            console.log('Background loaded:', bgUrl);
            revealContent();
        };

        img.onerror = () => {
            console.warn('Failed to load background:', bgUrl);
            revealContent(); // Show content anyway
        };

        // Safety timeout in case onload never fires
        setTimeout(() => {
            if (contentElements[0].style.opacity === '0') {
                console.log('Background load timeout, forcing reveal.');
                revealContent();
            }
        }, 3000);

    } else {
        // No background to load, show content immediately
        revealContent();
    }
});

// ==========================================
// Helper Functions
// ==========================================

// function fixPath(path) { ... } -> Removed to use window.fixPath from utils.js

function getRelatedMembers(currentMember, allMembers) {
    let results = [];
    if (currentMember.related && Array.isArray(currentMember.related)) {
        currentMember.related.forEach(rid => {
            const m = allMembers.find(mem => mem.id === rid);
            if (m) results.push(m);
        });
    }
    if (results.length < 5) {
        let candidates = allMembers.filter(m =>
            m.id !== currentMember.id &&
            !results.some(r => r.id === m.id)
        );
        const currentTags = currentMember.tags ? currentMember.tags.split(' ') : [];
        candidates = candidates.map(c => {
            let score = 0;
            if (c.tags) {
                const cTags = c.tags.split(' ');
                const overlap = cTags.filter(t => currentTags.includes(t)).length;
                score += overlap * 10;
            }
            if (c.section === currentMember.section) {
                // Prioritize same section heavily
                score += 100;
            }
            return { member: c, score: score };
        });
        candidates.sort((a, b) => b.score - a.score);
        for (let i = 0; i < candidates.length; i++) {
            if (results.length >= 5) break;
            results.push(candidates[i].member);
        }
    }
    return results;
}
