/**
 * profile_loader.render.js
 * Render helpers for profile page.
 */

import {
    resolvePath,
    getCastTagHref,
    getProfileHref,
    getRelatedMembers,
    getRevealDateText,
    normalizePathList
} from './profile_loader.core.js';

const BRAND_TITLE = 'あにあめもりあ';
const SOLID_TAGS = ['野生', '妖怪', '店長', '副店長', '飼育', '運営', 'キャスト', 'スタッフ'];

const SOCIAL_ICONS = {
    youtube: {
        colorClass: 'social-icon--mono',
        iconHtml: '<svg viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>'
    },
    twitter: {
        colorClass: 'social-icon--mono',
        iconHtml: '<svg viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>'
    },
    x: {
        colorClass: 'social-icon--mono',
        iconHtml: '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    },
    facebook: {
        colorClass: 'social-icon--mono',
        iconHtml: '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
    }
};

export function renderTitle(member) {
    document.title = `${BRAND_TITLE} | ${member.name}`;
    const h1Title = document.querySelector('h1');
    if (h1Title) h1Title.textContent = member.name;
}

function splitTagLabel(label) {
    return String(label || '').split(/[\s/・]+/).map((t) => t.trim()).filter(Boolean);
}

function buildTagHtml(activeMember, baseMember) {
    let tagsHtml = '';
    let mainTags = [];

    if (activeMember.tagLabel) {
        mainTags = splitTagLabel(activeMember.tagLabel);
        mainTags.forEach((t) => {
            tagsHtml += `<a href="${getCastTagHref(t)}" class="tag tag--link tag--solid">${t}</a>`;
        });
    }

    if (baseMember.tags) {
        baseMember.tags.split(' ').forEach((t) => {
            if (mainTags.includes(t)) return;
            const isSolid = SOLID_TAGS.includes(t);
            const className = `tag tag--link${isSolid ? ' tag--solid' : ' tag--soft'}`;
            tagsHtml += `<a href="${getCastTagHref(t)}" class="${className}">${t}</a>`;
        });
    }

    return tagsHtml;
}

export function renderTags(activeMember, baseMember) {
    const tagsContainer = document.getElementById('dynamic-tags-container');
    if (!tagsContainer) return;
    tagsContainer.innerHTML = buildTagHtml(activeMember, baseMember);
}

export function renderMotif(activeMember, revealContext) {
    const motifContainer = document.getElementById('dynamic-motif-container');
    if (!motifContainer) return;
    if (!activeMember.motifAnimal || !activeMember.motifIcon) {
        motifContainer.style.display = 'none';
        motifContainer.innerHTML = '';
        return;
    }

    const showMotif = revealContext.level >= 3 || (revealContext.displayInfo && revealContext.displayInfo.showMotif);
    const iconPath = showMotif
        ? resolvePath(activeMember.motifIcon)
        : resolvePath('assets/member/silhouette.webp');
    const animalText = showMotif ? activeMember.motifAnimal : '???';

    motifContainer.innerHTML = `
        <div class="origin-card" style="--origin-image: url('${iconPath}')">
            <span class="origin-label">変身元</span>
            <span class="origin-value">${animalText}</span>
        </div>
    `;
    motifContainer.style.display = 'block';
}

function buildCondensationOverlayHtml(baseMember, revealContext) {
    const revealDateText = getRevealDateText(baseMember.revealDate || (revealContext.displayInfo && revealContext.displayInfo.revealDate));
    return `
        <div class="condensation-blur-overlay">
            プロフィールの公開は<br>
            ${revealDateText}を予定しています
        </div>
    `;
}

function renderIntroduction(baseMember, revealContext, overlayHtml) {
    const introEl = document.getElementById('dynamic-intro-text');
    if (!introEl || !baseMember.introduction) return;

    const shouldShowIntro = revealContext.level >= 3 || (revealContext.displayInfo && revealContext.displayInfo.showIntro);
    if (shouldShowIntro) {
        introEl.innerHTML = baseMember.introduction;
        return;
    }

    if (revealContext.level === 2) {
        introEl.innerHTML = `
            <div class="condensation-blur-wrapper">
                <div class="condensation-blur-content">${baseMember.introduction}</div>
                ${overlayHtml}
            </div>
        `;
    }
}

function renderGoals(baseMember, revealContext, overlayHtml) {
    const goalsSection = document.querySelector('.goals-section');
    const goalsContainer = document.getElementById('dynamic-goals-container');

    if (!baseMember.goals || !Array.isArray(baseMember.goals) || baseMember.goals.length === 0) {
        if (goalsSection) goalsSection.style.display = 'none';
        return;
    }

    if (revealContext.level < 2) {
        if (goalsSection) goalsSection.style.display = 'none';
        return;
    }

    if (goalsSection) goalsSection.style.display = 'block';
    if (!goalsContainer) return;

    const shouldShowGoals = revealContext.level >= 3 || (revealContext.displayInfo && revealContext.displayInfo.showGoals);
    const randomGoal = baseMember.goals[Math.floor(Math.random() * baseMember.goals.length)];

    if (shouldShowGoals) {
        goalsContainer.innerHTML = `<div class="goals-text goals-text--single">${randomGoal}</div>`;
        return;
    }

    goalsContainer.innerHTML = `
        <div class="goals-text goals-text--blurred condensation-blur-wrapper">
            <div class="condensation-blur-content goals-text-inner">${randomGoal}</div>
            ${overlayHtml}
        </div>
    `;
}

function buildSocialEntry(type) {
    if (type === 'vrchat') {
        return {
            colorClass: 'social-icon--mono',
            iconHtml: `<img src="${resolvePath('assets/logo/VRChat Logo Black.webp')}" alt="VRChat" class="social-icon-media">`
        };
    }

    if (type === 'booth') {
        return {
            colorClass: 'social-icon--mono',
            iconHtml: `<img src="${resolvePath('assets/logo/Booth_logo_icon.svg')}" alt="Booth" class="social-icon-media">`
        };
    }

    if (type === 'note') {
        return {
            colorClass: 'social-icon--mono',
            iconHtml: `<img src="${resolvePath('assets/icon/note_icon.svg')}" alt="note" class="social-icon-media">`
        };
    }

    return SOCIAL_ICONS[type] || {
        colorClass: 'social-icon--mono',
        iconHtml: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>'
    };
}

function renderSocials(baseMember, revealContext) {
    const shouldShowSocials = revealContext.level >= 3 || (revealContext.displayInfo && revealContext.displayInfo.showSocials);
    const socialContainer = document.getElementById('dynamic-socials-container');
    if (!socialContainer) return;

    if (!shouldShowSocials || !baseMember.socials || !Array.isArray(baseMember.socials)) {
        socialContainer.innerHTML = '';
        return;
    }

    socialContainer.innerHTML = baseMember.socials.map((s) => {
        const type = (s.type || '').toLowerCase();
        const config = buildSocialEntry(type);
        const href = s.url || '#';
        return `<a href="${href}" class="social-icon ${config.colorClass}" target="_blank" rel="noopener noreferrer" aria-label="${type}">${config.iconHtml}</a>`;
    }).join('');
}

export function setupProfileSwitcher(activeMember, baseMember, revealContext) {
    const switcherContainer = document.querySelector('.profile-switcher-container');
    if (!switcherContainer) return;

    switcherContainer.setAttribute('data-member-id', baseMember.id);

    if (revealContext.level === 2) {
        const displayPaths = normalizePathList(revealContext.displayInfo && revealContext.displayInfo.imagePath);
        const silhouetteImg = displayPaths[0]
            || normalizePathList(window.siteConfig?.castDisplay?.placeholderImage)[0]
            || normalizePathList(activeMember.image)[0]
            || normalizePathList(baseMember.image)[0]
            || '';

        const chekiImg = switcherContainer.querySelector('.cheki-img');
        if (chekiImg && silhouetteImg) {
            chekiImg.src = resolvePath(silhouetteImg);
            chekiImg.style.filter = 'none';
        } else if (silhouetteImg) {
            switcherContainer.innerHTML = `<img src="${resolvePath(silhouetteImg)}" alt="${baseMember.name || ''}" class="cheki-img silhouette">`;
        }

        const thumbContainer = switcherContainer.querySelector('.thumbnail-strip');
        if (thumbContainer) {
            thumbContainer.style.display = 'none';
        }
        return;
    }

    let images = [];
    const profileImages = normalizePathList(activeMember.profileImages);
    if (profileImages.length > 0) {
        images = profileImages.map((p) => resolvePath(p));
    } else {
        const fallbackImage = normalizePathList(activeMember.image)[0];
        if (fallbackImage) {
            images = [resolvePath(fallbackImage)];
        }
    }

    if (images.length > 0) {
        switcherContainer.classList.add('profile-switcher');
        if (typeof window.ProfileImageSwitcher !== 'undefined') {
            new window.ProfileImageSwitcher(switcherContainer, images, { showIndicators: true });
        } else {
            switcherContainer.innerHTML = `<img src="${images[0]}" alt="${activeMember.name || ''}" class="cheki-img">`;
        }
    }
}

function applyProfileVisualBackground(baseMember, revealContext) {
    const bgElement = document.querySelector('.profile-bg-texture');
    const bgPath = window.getMemberBackground ? window.getMemberBackground(baseMember.tags) : null;
    if (bgPath && bgElement) {
        bgElement.style.backgroundImage = `url('${resolvePath(bgPath)}')`;
    }

    const existingFrame = document.querySelector('.profile-frame-overlay');
    if (existingFrame) existingFrame.remove();
    if (revealContext.level < 3) return;

    const framePath = window.getMemberFrame ? window.getMemberFrame(baseMember.tags) : null;
    if (!framePath) return;

    const visualArea = document.querySelector('.cheki-visual');
    if (!visualArea) return;

    const frameEl = document.createElement('div');
    frameEl.className = 'profile-frame-overlay';
    frameEl.style.backgroundImage = `url('${resolvePath(framePath)}')`;
    visualArea.appendChild(frameEl);
}

function renderSign(baseMember) {
    if (!baseMember.sign) return;
    const signImg = document.getElementById('profile-sign-img');
    if (!signImg) return;
    signImg.src = resolvePath(baseMember.sign);
    signImg.style.display = 'block';
}

function renderRelatedCasts(baseMember, allMembers, revealContext) {
    const relatedContainer = document.getElementById('dynamic-related-cast');
    if (!relatedContainer || revealContext.level < 3) return;

    const relatedMembers = getRelatedMembers(baseMember, allMembers);
    relatedContainer.innerHTML = relatedMembers.map((relatedMember) => {
        const profileImages = normalizePathList(relatedMember.profileImages);
        const fallbackImage = normalizePathList(relatedMember.image)[0];
        const imgPath = profileImages.length > 0
            ? profileImages[Math.floor(Math.random() * profileImages.length)]
            : (fallbackImage || 'assets/member/silhouette.webp');
        return `
            <a href="${getProfileHref(relatedMember.id)}" class="cast-slot" title="${relatedMember.name}">
                <img src="${resolvePath(imgPath)}" alt="${relatedMember.name}">
            </a>
        `;
    }).join('');
}

export function renderStaticProfileBlocks(baseMember, revealContext, allMembers) {
    const overlayHtml = buildCondensationOverlayHtml(baseMember, revealContext);
    renderIntroduction(baseMember, revealContext, overlayHtml);
    renderGoals(baseMember, revealContext, overlayHtml);
    renderSign(baseMember);
    renderSocials(baseMember, revealContext);
    renderRelatedCasts(baseMember, allMembers, revealContext);
    applyProfileVisualBackground(baseMember, revealContext);
}

export function updateFormContent(activeMember, baseMember, revealContext) {
    renderTitle(activeMember);
    renderTags(activeMember, baseMember);
    renderMotif(activeMember, revealContext);
    setupProfileSwitcher(activeMember, baseMember, revealContext);
}

export function setupFormSwitcher(member, initialFormIndex, onChange) {
    if (!member.forms || member.forms.length <= 1) return;

    const formSwitcherContainer = document.createElement('div');
    formSwitcherContainer.className = 'form-switcher';
    formSwitcherContainer.innerHTML = member.forms.map((form, index) => (
        `<button class="form-switcher-btn${index === initialFormIndex ? ' is-active' : ''}" data-form-index="${index}">${form.label}</button>`
    )).join('');

    const h1El = document.querySelector('h1');
    if (h1El && h1El.parentNode) {
        h1El.parentNode.insertBefore(formSwitcherContainer, h1El.nextSibling);
    }

    formSwitcherContainer.querySelectorAll('.form-switcher-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const newIndex = Number.parseInt(btn.dataset.formIndex, 10);
            if (Number.isNaN(newIndex)) return;

            formSwitcherContainer.querySelectorAll('.form-switcher-btn').forEach((b, i) => {
                b.classList.toggle('is-active', i === newIndex);
            });

            onChange(newIndex);
        });
    });
}
