/**
 * profile_loader.js
 * Entry point for profile page loading.
 * Loads split modules:
 * - profile_loader.core.js
 * - profile_loader.render.js
 */

/* global membersData */

function resolveLoaderBaseUrl() {
    if (document.currentScript && document.currentScript.src) {
        return new URL('./', document.currentScript.src);
    }

    const matched = Array.from(document.scripts).find((s) => (
        s.src && /\/js\/profile_loader\.js(?:\?|#|$)/.test(s.src)
    ));
    if (matched && matched.src) {
        return new URL('./', matched.src);
    }

    // Last resort for unusual embedding.
    return new URL('/js/', window.location.origin);
}

const LOADER_BASE_URL = resolveLoaderBaseUrl();
const CORE_MODULE_URL = new URL('profile_loader.core.js', LOADER_BASE_URL).href;
const RENDER_MODULE_URL = new URL('profile_loader.render.js', LOADER_BASE_URL).href;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const core = await import(CORE_MODULE_URL);
        const render = await import(RENDER_MODULE_URL);

        await core.waitForManifest();

        if (typeof membersData === 'undefined') {
            console.error('membersData is not defined. Make sure data/members.js is loaded.');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const memberId = core.resolveMemberIdFromContext(params);

        if (!memberId) {
            console.warn('No member ID specified in URL (?id=...)');
            return;
        }

        const member = membersData.find((m) => m.id === memberId);
        if (!member) {
            console.error(`Member not found for ID: ${memberId}`);
            const mainEl = document.querySelector('main');
            if (mainEl) {
                mainEl.innerHTML = '<div class="container"><p>Member not found.</p></div>';
            }
            return;
        }

        if (!core.ensureProfileLayoutOrRedirect(memberId, params)) {
            return;
        }

        const revealContext = core.getRevealContext(member);
        if (revealContext.level <= 1) {
            window.location.href = core.getCastIndexHref();
            return;
        }

        let currentFormIndex = core.parseFormIndex(params, member);
        core.applyCleanUrlForTemplate(memberId, currentFormIndex);
        core.normalizeCastIndexAnchors();
        core.setupPaginationNavigation(memberId, membersData);

        const renderCurrentForm = () => {
            const activeMember = core.getMergedMemberData(member, currentFormIndex);
            render.updateFormContent(activeMember, member, revealContext);
            render.renderStaticProfileBlocks(activeMember, revealContext, membersData);
        };

        render.setupFormSwitcher(member, currentFormIndex, (newIndex) => {
            if (newIndex === currentFormIndex) return;
            currentFormIndex = newIndex;
            renderCurrentForm();
        });

        renderCurrentForm();
        core.setupPageBackground(member);
    } catch (error) {
        console.error('Profile loader initialization failed:', error);
    }
});
