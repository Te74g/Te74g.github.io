/**
 * profile_loader.core.js
 * Core utilities for profile page loading and routing.
 */

const INTERNAL_LINK_SLUGS = [
    'news/',
    'cast/',
    'gallery/',
    'partner/',
    'links/',
    'aikotoba/',
    'privacy/',
    'terms/',
    'contact/'
];

export function normalizePathList(value) {
    const extractPath = (entry) => {
        if (typeof entry === 'string') {
            return entry.trim();
        }
        if (entry && typeof entry === 'object') {
            const candidate = entry.repoPath || entry.path || entry.src || entry.url || '';
            return typeof candidate === 'string' ? candidate.trim() : '';
        }
        return '';
    };

    if (Array.isArray(value)) {
        return value.map(extractPath).filter(Boolean);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        return trimmed.split(/[\r\n,]+/).map((part) => part.trim()).filter(Boolean);
    }

    if (value && typeof value === 'object') {
        const one = extractPath(value);
        return one ? [one] : [];
    }

    return [];
}

const firstPath = (value) => normalizePathList(value)[0] || null;

export function resolvePath(path) {
    if (!path) return '';
    if (window.fixPath) return window.fixPath(path);
    return path.startsWith('/') ? path : `/${path}`;
}

export function getCastIndexHref() {
    return resolvePath('cast/');
}

export function getProfileHref(id, formIndex = null) {
    const base = resolvePath(`cast/${id}/`);
    const normalized = `${formIndex ?? ''}`;
    if (normalized === '' || normalized === '0') return base;
    return `${base}?form=${encodeURIComponent(normalized)}`;
}

export function getCastTagHref(tag) {
    return `${getCastIndexHref()}?tag=${encodeURIComponent(tag)}`;
}

export async function waitForManifest() {
    if (!window.manifestPromise) return;
    try {
        await window.manifestPromise;
    } catch (e) {
        console.warn('Manifest wait failed', e);
    }
}

export function resolveMemberIdFromContext(params) {
    let memberId = window.__memberId || params.get('id');
    if (memberId) return memberId;

    const testContainer = document.querySelector('[data-member-id]');
    if (testContainer) {
        const val = testContainer.getAttribute('data-member-id');
        if (val && val !== 'INSERT_ID_HERE') {
            memberId = val;
        }
    }
    return memberId;
}

export function normalizeLayoutLinks() {
    document.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute('href');
        if (!href) return;
        if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return;

        const cleanHref = href.split('?')[0].split('#')[0];
        const slug = INTERNAL_LINK_SLUGS.find((s) => cleanHref.endsWith(s));
        if (!slug) return;

        a.setAttribute('href', resolvePath(slug));
    });
}

export function ensureProfileLayoutOrRedirect(memberId, params) {
    if (document.querySelector('.profile-layout-grid')) {
        return true;
    }

    const base = resolvePath(`member/profile/?id=${encodeURIComponent(memberId)}`);
    const formParam = params.get('form');
    const target = formParam !== null
        ? `${base}&form=${encodeURIComponent(formParam)}`
        : base;
    window.location.replace(target);
    return false;
}

export function normalizeCastIndexAnchors() {
    const castIndexHref = getCastIndexHref();
    document.querySelectorAll('a[href="../cast/"], a[href="./cast/"], a[href="/cast/"]').forEach((a) => {
        a.setAttribute('href', castIndexHref);
    });
}

export function applyCleanUrlForTemplate(memberId, formIndex = 0) {
    if (!window.location.pathname.includes('/member/')) return;
    const canonical = getProfileHref(memberId, formIndex);
    window.history.replaceState({}, '', canonical);
    normalizeLayoutLinks();
}

export function getRevealContext(member) {
    const displayInfo = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(member) : null;
    const level = displayInfo ? displayInfo.level : 3;
    return { displayInfo, level };
}

export function getRevealDateText(dateString) {
    if (!dateString) return '\u516c\u958b\u65e5\u672a\u5b9a';
    const normalized = String(dateString).trim().replace(/\./g, '-');
    const d = new Date(`${normalized}T00:00:00+09:00`);
    if (Number.isNaN(d.getTime())) return '\u516c\u958b\u65e5\u672a\u5b9a';
    return `${d.getMonth() + 1}\u6708${d.getDate()}\u65e5`;
}

export function parseFormIndex(params, member) {
    const formParam = params.get('form');
    let currentFormIndex = formParam !== null ? Number.parseInt(formParam, 10) : 0;
    if (Number.isNaN(currentFormIndex) || currentFormIndex < 0) {
        currentFormIndex = 0;
    }

    if (member.forms && member.forms.length > 0) {
        currentFormIndex = Math.min(currentFormIndex, member.forms.length - 1);
    }
    return currentFormIndex;
}

export function getMergedMemberData(member, formIndex) {
    if (!member.forms || member.forms.length === 0) {
        return member;
    }

    const form = member.forms[formIndex] || member.forms[0];
    const formProfileImages = normalizePathList(form.profileImages);
    const memberProfileImages = normalizePathList(member.profileImages);
    const formImage = firstPath(form.image);
    const memberImage = firstPath(member.image);

    return {
        ...member,
        name: form.name || member.name,
        tagLabel: form.tagLabel || member.tagLabel,
        profileImages: formProfileImages.length > 0 ? formProfileImages : memberProfileImages,
        image: formImage || memberImage || member.image,
        motifAnimal: form.motifAnimal || member.motifAnimal,
        motifIcon: form.motifIcon || member.motifIcon,
        introduction: form.introduction || member.introduction,
        goals: form.goals || member.goals,
        socials: form.socials || member.socials
    };
}

export function getRelatedMembers(currentMember, allMembers) {
    const results = [];

    const visibleMembers = allMembers.filter((m) => {
        const info = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(m) : null;
        const level = info ? info.level : (m.revealLevel !== undefined ? m.revealLevel : 3);
        return level > 1;
    });

    if (currentMember.related && Array.isArray(currentMember.related)) {
        currentMember.related.forEach((rid) => {
            const found = visibleMembers.find((mem) => mem.id === rid);
            if (found) results.push(found);
        });
    }

    if (results.length >= 5) return results;

    const currentTags = currentMember.tags ? currentMember.tags.split(' ') : [];
    const candidates = visibleMembers
        .filter((m) => m.id !== currentMember.id && !results.some((r) => r.id === m.id))
        .map((m) => {
            let score = 0;
            if (m.tags) {
                const cTags = m.tags.split(' ');
                score += cTags.filter((t) => currentTags.includes(t)).length * 10;
            }
            if (m.section === currentMember.section) {
                score += 100;
            }
            return { member: m, score };
        })
        .sort((a, b) => b.score - a.score);

    for (let i = 0; i < candidates.length; i += 1) {
        if (results.length >= 5) break;
        results.push(candidates[i].member);
    }

    return results;
}

export function setupPaginationNavigation(memberId, allMembers) {
    const visibleMembers = allMembers.filter((m) => {
        const info = window.getMemberDisplayInfo ? window.getMemberDisplayInfo(m) : null;
        return (info ? info.level : 3) > 1;
    });

    if (visibleMembers.length <= 1) return;

    const currentIndex = visibleMembers.findIndex((m) => m.id === memberId);
    if (currentIndex === -1) return;

    const prevMember = visibleMembers[(currentIndex - 1 + visibleMembers.length) % visibleMembers.length];
    const nextMember = visibleMembers[(currentIndex + 1) % visibleMembers.length];
    const prevHref = getProfileHref(prevMember.id);
    const nextHref = getProfileHref(nextMember.id);

    const navContainer = document.createElement('div');
    navContainer.className = 'profile-pagination';
        navContainer.innerHTML = `
        <a href="${prevHref}" class="profile-nav-btn prev-btn" title="${prevMember.name}\u306e\u30da\u30fc\u30b8\u3078">
            <span class="nav-icon">&#10094;</span>
        </a>
        <a href="${nextHref}" class="profile-nav-btn next-btn" title="${nextMember.name}\u306e\u30da\u30fc\u30b8\u3078">
            <span class="nav-icon">&#10095;</span>
        </a>
    `;
    document.body.appendChild(navContainer);

    const swipeTarget = document.getElementById('main') ?? document;
    let swipeStartX = null;
    let swipeStartY = null;

    swipeTarget.addEventListener('touchstart', (e) => {
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
    }, { passive: true });

    swipeTarget.addEventListener('touchend', (e) => {
        if (swipeStartX === null) return;

        const dx = e.changedTouches[0].clientX - swipeStartX;
        const dy = e.changedTouches[0].clientY - swipeStartY;
        swipeStartX = null;
        swipeStartY = null;

        if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
        window.location.href = dx < 0 ? nextHref : prevHref;
    }, { passive: true });
}

export function setupPageBackground(baseMember) {
    const pageBgPath = window.getPageBackground ? window.getPageBackground(baseMember.tags) : null;
    const contentElements = document.querySelectorAll('.profile-visual-area, .profile-text-area, .profile-related-area');
    const hasContentElements = contentElements.length > 0;

    if (hasContentElements) {
        contentElements.forEach((el) => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.8s ease';
            el.classList.remove('reveal');
        });
    }

    const revealContent = () => {
        if (!hasContentElements) return;
        setTimeout(() => {
            contentElements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.classList.add('is-visible');
                }, index * 200);
            });
        }, 300);
    };

    if (!pageBgPath) {
        revealContent();
        return;
    }

    const fixedBgEl = document.getElementById('fixed-page-background');
    const bgUrl = resolvePath(pageBgPath);
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
        revealContent();
    };

    img.onerror = () => {
        console.warn('Failed to load background:', bgUrl);
        revealContent();
    };

    setTimeout(() => {
        if (hasContentElements && contentElements[0].style.opacity === '0') {
            revealContent();
        }
    }, 3000);
}

