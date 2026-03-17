/* global ProfileImageSwitcher */
/**
 * home.js
 * Unified Top Page Engine
 * Handles Initial Loading, Hero Animations, Scroll Morphing, Pickups & Event Filters
 */

import { sleep, fadeIn } from '../app/motion.js';
import { State, updateState } from '../app/state.js';
import { getSiteConfig, getMembersData } from '../app/data.js';
import { fixPath } from '../app/url.js';
import {
    shouldShowItem,
    getRevealLevel,
    getPinClass,
    getMemberBackground,
    getMemberDisplayInfo,
    getMemberFrame,
    isMemberVisible,
    normalizePathList
} from '../app/member-utils.js';

// Global start time equivalent for loader duration check
const initTime = Date.now();

// --- Global Setup ---
const cfg = getSiteConfig();
const membersData = getMembersData();
updateState('home', { skipAnimation: false });

let openingTimerId = null;
let openingStarted = false;
let openingFinished = false;
let skipTapHandler = null;

function cleanupSkipListener() {
    if (!skipTapHandler) return;
    document.removeEventListener('click', skipTapHandler);
    document.removeEventListener('touchend', skipTapHandler);
    skipTapHandler = null;
}

// =======================================================
// 1. Data Injection (Loader, Hero, About)
// =======================================================
function injectData() {
    // Loader Text
    const loadingMsgs = cfg.loadingMessages || ['Loading...'];
    const textEl = document.querySelector('.loader-text');
    if (textEl) textEl.textContent = loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)];

    // Loader Logo (Dark theme hardcoded for now)
    const loaderCfg = cfg.loaderLogos?.opening || { dark: './assets/logo/aniamemoria_logo_darktheme.webp' };
    const defaultLogo = loaderCfg.dark;
    const logoBack = document.querySelector('.loader-logo-back');
    const logoFront = document.querySelector('.loader-logo-front');
    if (logoBack) logoBack.src = defaultLogo;
    if (logoFront) logoFront.src = defaultLogo;

    const logoWrapper = document.querySelector('.logo-wrapper');
    if (logoWrapper) logoWrapper.classList.add('is-ready');

    // Hero Subtitle Setup (Typewriter SPANs)
    const subtitleEl = document.querySelector('.hero-subtitle');
    if (subtitleEl && cfg.heroSubtitle) {
        const subs = cfg.heroSubtitle;
        const text = Array.isArray(subs) ? subs[Math.floor(Math.random() * subs.length)] : subs;
        subtitleEl.innerHTML = '';
        [...text].forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('char');
            if (char === ' ') span.style.width = '0.5em';
            subtitleEl.appendChild(span);
        });
    }

    // Hero Images
    if (cfg.heroImages) {
        const charEl = document.querySelector('.hero-character');
        if (charEl && cfg.heroImages.character) {
            charEl.src = fixPath ? fixPath(cfg.heroImages.character) : cfg.heroImages.character;
        }

        const heroBg = document.querySelector('.hero-bg');
        if (heroBg && cfg.heroImages.background) {
            heroBg.style.backgroundImage = `url('${fixPath ? fixPath(cfg.heroImages.background) : cfg.heroImages.background}')`;
        }

        const logoEl = document.querySelector('.hero-logo');
        if (logoEl && cfg.heroImages.logoDark) logoEl.src = cfg.heroImages.logoDark;
    }

    // About Section
    const aboutSection = document.getElementById('about-section');
    if (aboutSection && cfg.aboutSection) {
        const titleEl = aboutSection.querySelector('.section-title');
        if (titleEl) titleEl.textContent = cfg.aboutSection.title;

        const leadEl = aboutSection.querySelector('.section-lead');
        if (leadEl) leadEl.textContent = cfg.aboutSection.subTitle;

        const textContainer = aboutSection.querySelector('.about-text-content');
        if (textContainer && cfg.aboutSection.text) {
            textContainer.innerHTML = '';
            cfg.aboutSection.text.forEach(line => {
                const p = document.createElement('p');
                p.textContent = line;
                textContainer.appendChild(p);
            });
        }

        const imgEl = aboutSection.querySelector('.about-image img');
        if (imgEl && cfg.aboutSection.image) {
            imgEl.src = cfg.aboutSection.image;
        } else if (imgEl) {
            imgEl.style.display = 'none';
        }
    }
}

// =======================================================
// 2. Opening & Skip Animations (Async managed logic)
// =======================================================
function spawnSparkle(targetRect) {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;
    const sparkle = document.createElement('div');
    sparkle.classList.add('hero-sparkle');
    if (Math.random() > 0.5) sparkle.classList.add('star');

    const folderRect = heroContent.getBoundingClientRect();
    const centerX = targetRect.left - folderRect.left + targetRect.width / 2;
    const centerY = targetRect.top - folderRect.top + targetRect.height / 2;
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 40;

    sparkle.style.left = `${centerX + offsetX}px`;
    sparkle.style.top = `${centerY + offsetY}px`;
    const scale = 0.5 + Math.random() * 1.0;
    sparkle.style.transform = `scale(${scale})`;
    sparkle.classList.add('hero-sparkle-anim');

    heroContent.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
}

async function runOpeningSequence() {
    if (openingFinished || openingStarted) return;
    openingStarted = true;

    const loader = document.getElementById('opening-loader-overlay');
    const hero = document.getElementById('hero-section');
    const skipHint = document.getElementById('skip-hint');

    // Fade out loader
    if (loader) {
        requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add('is-hidden')));
    }

    if (State.home.skipAnimation) return finishSequence();

    await sleep(500);
    if (loader) loader.style.display = 'none';

    // Show skip hint
    if (skipHint) {
        skipHint.style.display = 'block';
        requestAnimationFrame(() => skipHint.style.opacity = '1');
    }

    await sleep(400);
    if (State.home.skipAnimation) return finishSequence();

    // Start Hero Anim
    if (hero) hero.classList.add('animate-start');
    await sleep(1000);
    if (State.home.skipAnimation) return finishSequence();

    const charEl = document.querySelector('.hero-character');
    if (charEl) charEl.classList.add('with-shadow');
    await sleep(800);
    if (State.home.skipAnimation) return finishSequence();

    // Typewriter effect
    const chars = document.querySelectorAll('.hero-subtitle .char');
    for (const char of chars) {
        if (State.home.skipAnimation) return finishSequence();
        char.classList.add('is-visible');
        const rect = char.getBoundingClientRect();
        spawnSparkle(rect);
        if (Math.random() > 0.5) spawnSparkle(rect);
        await sleep(100);
    }
    await sleep(500);

    finishSequence();
}

function finishSequence() {
    if (openingFinished) return;
    openingFinished = true;

    if (openingTimerId !== null) {
        clearTimeout(openingTimerId);
        openingTimerId = null;
    }
    cleanupSkipListener();

    const loader = document.getElementById('opening-loader-overlay');
    const hero = document.getElementById('hero-section');
    const charEl = document.querySelector('.hero-character');
    const chars = document.querySelectorAll('.hero-subtitle .char');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const skipHint = document.getElementById('skip-hint');

    if (loader) loader.style.display = 'none';
    if (hero) hero.classList.add('animate-start');
    if (charEl) charEl.classList.add('with-shadow');
    chars.forEach(c => c.classList.add('is-visible'));
    if (scrollIndicator) scrollIndicator.classList.add('is-visible');

    document.body.classList.remove('is-preloading');

    if (skipHint) {
        skipHint.style.opacity = '0';
        setTimeout(() => skipHint.style.display = 'none', 400);
    }
}

function setupSkip() {
    let skipHint = document.getElementById('skip-hint');
    if (!skipHint) {
        skipHint = document.createElement('div');
        skipHint.id = 'skip-hint';
        skipHint.textContent = 'Double-tap to skip';
        skipHint.style.cssText = [
            'position:fixed', 'bottom:24px', 'right:24px',
            'font-size:0.72rem', 'color:rgba(255,255,255,0.55)',
            'background:rgba(0,0,0,0.28)', 'padding:5px 12px',
            'border-radius:20px', 'pointer-events:none',
            'display:none', 'z-index:9999',
            'backdrop-filter:blur(4px)', 'transition:opacity 0.4s',
            'letter-spacing:0.05em'
        ].join(';');
        document.body.appendChild(skipHint);
    }

    if (skipTapHandler) return;

    let lastTapTime = 0;
    skipTapHandler = () => {
        const now = Date.now();
        if (now - lastTapTime < 300 && now - lastTapTime > 50) {
            updateState('home', { skipAnimation: true });
            document.body.classList.add('is-skipped');
            finishSequence();
            lastTapTime = 0;
        } else {
            lastTapTime = now;
        }
    };
    document.addEventListener('click', skipTapHandler);
    document.addEventListener('touchend', skipTapHandler, { passive: true });
}

// =======================================================
// 3. Scroll Morphing — .hero-bg の clip-path を制御
// =======================================================
function setupScrollMorph() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const zone = document.getElementById('kv-scroll-zone');
    const heroBg = document.querySelector('.hero-bg');
    const content = document.querySelector('.hero-content');
    if (!zone || !heroBg) return;

    let ticking = false;
    const update = () => {
        const zoneTravel = zone.offsetHeight - window.innerHeight;
        const travel = Math.max(zoneTravel, window.innerHeight * 0.82);
        if (travel <= 0) {
            heroBg.style.clipPath = 'none';
            ticking = false;
            return;
        }
        const rawP = Math.max(0, Math.min(1, window.scrollY / travel));
        const eased = rawP < 0.5 ? 2 * rawP * rawP : -1 + (4 - 2 * rawP) * rawP;
        const radius = 38 + (150 - 38) * eased;

        heroBg.style.clipPath = rawP >= 1 ? 'none' : `circle(${radius.toFixed(1)}% at 50% 50%)`;

        if (content) {
            const opacity = Math.max(0, 1 - rawP / 0.4);
            content.style.opacity = opacity.toFixed(3);
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}

// =======================================================
// 3b. Section Observer — body.is-{section} クラス管理
// =======================================================
function setupSectionObserver() {
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length) return;

    const SECTION_CLASSES = ['is-news', 'is-pickup', 'is-about'];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.dataset.section;
                SECTION_CLASSES.forEach(cls => document.body.classList.remove(cls));
                document.body.classList.add(`is-${id}`);
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
}

// =======================================================
// 3c. Hero Particles — circle 外の暗部に金色粒子を浮遊
// =======================================================
function spawnHeroParticles() {
    const layer = document.getElementById('hero-deco-layer');
    if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const count = 14;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'deco-particle';

        // circle 外側（半径 45〜48%付近）に配置
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
        const r = 0.44 + Math.random() * 0.06; // 44〜50% → circle(38%) の外
        const cx = 50 + Math.cos(angle) * r * 100;
        const cy = 50 + Math.sin(angle) * r * 100;

        const size = 2 + Math.random() * 4;      // 2〜6px
        const dur  = 3.5 + Math.random() * 4;    // 3.5〜7.5s
        const del  = -(Math.random() * dur);      // ランダム位相（最初から途中から流れて見える）
        const dx   = (Math.random() - 0.5) * 70; // 横移動
        const dy   = -(35 + Math.random() * 65); // 上昇

        p.style.cssText = `
            left: ${cx.toFixed(1)}%;
            top:  ${cy.toFixed(1)}%;
            width: ${size.toFixed(1)}px;
            height: ${size.toFixed(1)}px;
            --dx: ${dx.toFixed(0)}px;
            --dy: ${dy.toFixed(0)}px;
            animation: particle-float-${i % 2 === 0 ? 'a' : 'b'} ${dur.toFixed(1)}s ease-in-out ${del.toFixed(2)}s infinite;
        `;
        layer.appendChild(p);
    }
}

// =======================================================
// 4. Legacy Features (Reveal Banner, Pickup, Event Filter)
// =======================================================
function buildLegacyFeatures() {
    // Reveal Banner
    const revealBanner = document.getElementById('cast-reveal-banner');
    const revealSection = document.getElementById('cast-reveal-overlay');
    if (revealBanner && revealSection && membersData && membersData.length > 0) {
        const isDebugMode = sessionStorage.getItem('debugMode') === 'true';
        const allowedRoles = ['店長', '副店長', '飼育', '野生', '妖怪'];
        const REVEAL_HOUR_JST = 18;

        const todayTargets = [];
        const tomorrowTargets = [];

        membersData.forEach(m => {
            if (!allowedRoles.includes(m.tagLabel)) return;
            if (!m.revealDate) return;

            const revealDt = new Date(m.revealDate + `T${String(REVEAL_HOUR_JST).padStart(2, '0')}:00:00+09:00`);
            const now = new Date();
            const diffMs = revealDt - now;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (isDebugMode) {
                todayTargets.push(m);
            } else {
                if (diffDays <= 0) {
                    const midnight = new Date();
                    midnight.setHours(0, 0, 0, 0);
                    if (revealDt >= midnight) todayTargets.push(m);
                } else if (diffDays === 1) {
                    tomorrowTargets.push(m);
                }
            }
        });

        const buildCard = (member, isToday) => {
            const images = normalizePathList(member.profileImages);
            const silPath = fixPath ? fixPath('assets/member/silhouette.webp') : 'assets/member/silhouette.webp';
            let imgBase, imgHover;

            if (isToday) {
                imgBase = images[0] ? (fixPath ? fixPath(images[0]) : images[0]) : silPath;
                imgHover = images[1] ? (fixPath ? fixPath(images[1]) : images[1]) : imgBase;
            } else {
                const silhouetteImage = normalizePathList(member.silhouetteImage)[0];
                imgBase = silhouetteImage
                    ? (fixPath ? fixPath(silhouetteImage) : silhouetteImage)
                    : (images[0] ? (fixPath ? fixPath(images[0]) : images[0]) : silPath);
                imgHover = imgBase;
            }

            const href = fixPath ? fixPath(`cast/${member.id}/`) : `cast/${member.id}/`;
            const revealDt = member.revealDate
                ? new Date(member.revealDate + `T${String(REVEAL_HOUR_JST).padStart(2, '0')}:00:00+09:00`)
                : null;
            const dateLabel = !isToday && revealDt
                ? `明日 ${revealDt.getMonth() + 1}月${revealDt.getDate()}日 ${REVEAL_HOUR_JST}:00 公開予定`
                : `本日 ${new Date().getMonth() + 1}月${new Date().getDate()}日 公開`;

            const bgPath = getMemberBackground ? getMemberBackground(member.tags) : null;
            const bgStyle = bgPath ? ` style="background-image: url('${fixPath ? fixPath(bgPath) : bgPath}'); background-size: cover; background-position: center;"` : '';

            const fPath = getMemberFrame ? getMemberFrame(member.tags) : null;
            const frameHtml = fPath ? `<div style="position: absolute; inset: 0; background-image: url('${fixPath ? fixPath(fPath) : fPath}'); background-size: 100% 100%; pointer-events: none; z-index: 4;"></div>` : '';

            return `
            <a class="cast-reveal-card ${isToday ? 'is-today' : 'is-tomorrow'} reveal" href="${href}">
                <div class="cast-reveal-img-wrap"${bgStyle}>
                    <img class="img-base" src="${imgBase}" alt="${member.name}" loading="lazy" style="z-index: 1;">
                    <img class="img-hover" src="${imgHover}" alt="${member.name}" loading="lazy" style="z-index: 2;">
                    ${frameHtml}
                </div>
                <div class="cast-reveal-info">
                    <span class="cast-reveal-tag">${member.tagLabel}</span>
                    <span class="cast-reveal-name">${member.name}</span>
                    <span class="cast-reveal-date">${dateLabel}</span>
                </div>
            </a>`;
        };

        let html = '';
        if (todayTargets.length > 0) {
            html += `<div class="cast-reveal-group">
                <div class="cast-reveal-group-label">✦ 本日公開</div>
                <div class="cast-reveal-cards">${todayTargets.map(m => buildCard(m, true)).join('')}</div>
            </div>`;
        }
        if (tomorrowTargets.length > 0) {
            html += `<div class="cast-reveal-group">
                <div class="cast-reveal-group-label">◈ 明日公開</div>
                <div class="cast-reveal-cards">${tomorrowTargets.map(m => buildCard(m, false)).join('')}</div>
            </div>`;
        }

        if (html) {
            revealBanner.innerHTML = html;
            revealSection.style.display = '';
            const heroOverlay = document.getElementById('cast-reveal-hero');
            if (heroOverlay) {
                heroOverlay.innerHTML = html;
                heroOverlay.style.display = '';
            }
        }
    }

    // Random Pickup
    const pickupContainer = document.getElementById('random-pickup-grid');
    if (pickupContainer && membersData && membersData.length > 0) {
        const castConfig = cfg.castDisplay || {};
        const allowedRoles = ['店長', '副店長', '飼育', '野生', '妖怪'];

        const filteredMembers = membersData.filter(m => {
            if (!allowedRoles.includes(m.tagLabel)) return false;
            if (isMemberVisible && !isMemberVisible(m, castConfig)) return false;
            if (shouldShowItem && !shouldShowItem(m)) return false;
            const level = getRevealLevel ? getRevealLevel(m) : 3;
            return level >= 2;
        });

        if (filteredMembers.length === 0) {
            const section = pickupContainer.closest('section');
            if (section) section.style.display = 'none';
        } else {
            const selected = [...filteredMembers].sort(() => 0.5 - Math.random()).slice(0, 3);
            selected.forEach((m, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'reveal';

                const a = document.createElement('a');
                const pinClass = getPinClass ? getPinClass(m.tags) : '';
                a.className = `cheki-card ${pinClass}`;
                a.href = fixPath ? fixPath(m.link || `cast/${m.id}/`) : m.link || `cast/${m.id}/`;

                const visualDiv = document.createElement('div');
                visualDiv.className = 'cheki-visual';

                const bgPath = getMemberBackground ? getMemberBackground(m.tags) : null;
                if (bgPath) {
                    visualDiv.style.backgroundImage = `url('${fixPath ? fixPath(bgPath) : bgPath}')`;
                    visualDiv.style.backgroundSize = 'cover';
                    visualDiv.style.backgroundPosition = 'center';
                }

                const nameDiv = document.createElement('div');
                nameDiv.className = 'cheki-name';
                nameDiv.textContent = m.pickupName || m.name;

                a.appendChild(visualDiv);
                a.appendChild(nameDiv);
                wrapper.appendChild(a);
                pickupContainer.appendChild(wrapper);

                const displayInfo = getMemberDisplayInfo ? getMemberDisplayInfo(m, castConfig) : null;
                const effectiveImagePaths = normalizePathList(displayInfo?.imagePath).length > 0
                    ? normalizePathList(displayInfo?.imagePath)
                    : (normalizePathList(m.profileImages).length > 0 ? normalizePathList(m.profileImages) : normalizePathList(m.image));

                let images = [];
                if (effectiveImagePaths && effectiveImagePaths.length > 0) {
                    images = effectiveImagePaths.map(p => fixPath ? fixPath(p) : p);
                }

                if (images.length > 0) {
                    if (images.length > 1 && window.ProfileImageSwitcher) {
                        visualDiv.classList.add('profile-switcher');
                        new ProfileImageSwitcher(visualDiv, images, { showIndicators: false });
                    } else {
                        visualDiv.innerHTML = `<img src="${images[0]}" alt="${m.name}" class="cheki-img"><span class="cheki-tag-badge">${m.tagLabel}</span>`;
                    }
                    const badgeText = m.tagLabel.split(/[\s/／]+/)[0] || m.tagLabel;
                    const badge = document.createElement('span');
                    badge.className = 'cheki-tag-badge';
                    badge.textContent = badgeText;
                    badge.style.zIndex = '5';
                    visualDiv.appendChild(badge);
                }

                const fPath = getMemberFrame ? getMemberFrame(m.tags) : null;
                if (fPath) {
                    const frameEl = document.createElement('div');
                    frameEl.className = 'cheki-frame';
                    frameEl.style.backgroundImage = `url('${fixPath ? fixPath(fPath) : fPath}')`;
                    visualDiv.appendChild(frameEl);
                }

                const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                wrapper.style.setProperty('--reveal-delay', prefersReduced ? '0ms' : `${index * 120}ms`);
                fadeIn(wrapper, 'is-visible', false);
            });
        }
    }

    // Event filtering
    const q = document.getElementById('q');
    const status = document.getElementById('status');
    const grid = document.getElementById('eventGrid');
    const empty = document.getElementById('empty');

    if (grid) {
        const applyFilter = () => {
            const query = (q?.value || '').trim().toLowerCase();
            const st = status?.value || 'all';
            const cards = Array.from(grid.querySelectorAll('[data-status]'));
            let visible = 0;
            cards.forEach((card) => {
                const s = card.getAttribute('data-status') || '';
                const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                const text = (card.textContent || '').toLowerCase();
                const ok = (st === 'all' || s === st) && (!query || keywords.includes(query) || text.includes(query));
                card.style.display = ok ? '' : 'none';
                if (ok) visible++;
            });
            if (empty) empty.hidden = visible !== 0;
        };
        q?.addEventListener('input', applyFilter);
        status?.addEventListener('change', applyFilter);
        applyFilter();
    }
}

// =======================================================
// Main Execution
// =======================================================
export async function initHomePage() {
    openingStarted = false;
    openingFinished = false;
    cleanupSkipListener();
    if (openingTimerId !== null) {
        clearTimeout(openingTimerId);
        openingTimerId = null;
    }

    injectData();
    setupSkip();
    setupScrollMorph();
    setupSectionObserver();
    spawnHeroParticles();
    buildLegacyFeatures();

    const MIN_DISPLAY_TIME = 2000;
    const elapsed = Date.now() - initTime;
    const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);

    openingTimerId = setTimeout(() => {
        runOpeningSequence();
    }, remainingTime);
}
