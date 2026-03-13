/**
 * js/app/member-utils.js
 * Extracted member-related logic from legacy utils.js
 */

export const shouldShowItem = (item) => {
    if (!item) return false;
    const isDebugMode = sessionStorage.getItem('debugMode') === 'true';
    if (item.hidden) {
        return isDebugMode;
    }
    return true;
};

export const getRevealLevel = (member) => {
    if (!member) return 0;
    const isDebugMode = sessionStorage.getItem('debugMode') === 'true';
    if (isDebugMode) return 3;

    const level = member.revealLevel !== undefined ? member.revealLevel : 3;
    return Math.min(Math.max(0, level), 3);
};

export const getMemberDisplayInfo = (member, siteConfig) => {
    let level = getRevealLevel(member);
    const config = siteConfig?.castDisplay || {};

    let daysDiff = 0;
    let hasRevealDate = false;
    const isDebugMode = sessionStorage.getItem('debugMode') === 'true';

    if (member.revealDate && !isDebugMode) {
        hasRevealDate = true;
        const today = new Date();
        const revealDate = new Date(member.revealDate + 'T18:00:00+09:00');
        const diffTime = revealDate - today;
        daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysDiff > 1) {
            level = 2; // silhouette (fully hidden)
        } else if (daysDiff === 1) {
            level = 2; // silhouette (text revealed)
        } else {
            level = 3; // full
        }
    }

    let info = {
        level: level,
        name: member.pickupName || member.name,
        fullName: member.name,
        tagLabel: member.tagLabel,
        imagePath: null,
        linkable: true,
        showIntro: true,
        showGoals: true,
        showSocials: true,
        showMotif: true,
    };

    if (member.profileImages && member.profileImages.length > 0) {
        info.imagePath = member.profileImages;
    } else if (member.image) {
        info.imagePath = [member.image];
    }

    switch (level) {
        case 0: // hidden
            info.linkable = false;
            break;
        case 1: // coming_soon
            info.name = config.comingSoonName || '???';
            info.fullName = config.comingSoonName || '???';
            info.tagLabel = '???';
            info.imagePath = config.comingSoonImage ? [config.comingSoonImage] : null;
            info.linkable = false;
            info.showIntro = false;
            info.showGoals = false;
            info.showSocials = false;
            info.showMotif = false;
            break;
        case 2: { // silhouette
            let silImage = member.silhouetteImage || null;
            if (!silImage && info.imagePath && info.imagePath[0]) {
                silImage = info.imagePath[0].replace('.webp', '_silhouette.webp');
            }
            info.imagePath = silImage ? [silImage] : (config.placeholderImage ? [config.placeholderImage] : info.imagePath);
            info.linkable = true;

            if (hasRevealDate && daysDiff === 1) {
                info.showIntro = true;
                info.showGoals = true;
                info.showSocials = false;
                info.showMotif = true;
            } else {
                info.showIntro = false;
                info.showGoals = false;
                info.showSocials = false;
                info.showMotif = false;
            }
            break;
        }
        case 3:
        default: break;
    }
    return info;
};

export const getMemberBackground = (tags) => {
    if (!tags) return null;
    const BG_MAP = {
        'A': 'assets/member_parts/aniamemoria_member_background_A.webp',
        'B': 'assets/member_parts/aniamemoria_member_background_B.webp',
        'C': 'assets/member_parts/aniamemoria_member_background_C.webp',
        'D': 'assets/member_parts/aniamemoria_member_background_D.webp',
        'E': 'assets/member_parts/aniamemoria_member_background_E.webp'
    };
    if (tags.includes('運営')) return BG_MAP['E'];
    if (tags.includes('妖怪')) return BG_MAP['B'];
    if (tags.includes('飼育')) return BG_MAP['A'];
    if (tags.includes('野生')) return BG_MAP['C'];
    if (tags.includes('スタッフ')) return BG_MAP['D'];
    return null;
};

export const getMemberFrame = (tags) => {
    if (!tags) return null;
    const FRAME_MAP = {
        'A': 'assets/member_parts/aniamemoria_member_frame_A.webp',
        'B': 'assets/member_parts/aniamemoria_member_frame_B.webp',
        'C': 'assets/member_parts/aniamemoria_member_frame_C.webp',
        'D': 'assets/member_parts/aniamemoria_member_frame_D.webp',
        'E': 'assets/member_parts/aniamemoria_member_frame_E.webp'
    };
    if (tags.includes('運営')) return FRAME_MAP['E'];
    if (tags.includes('妖怪')) return FRAME_MAP['B'];
    if (tags.includes('飼育')) return FRAME_MAP['A'];
    if (tags.includes('野生')) return FRAME_MAP['C'];
    if (tags.includes('スタッフ')) return FRAME_MAP['D'];
    return null;
};

export const getPinClass = (tags) => {
    if (!tags) return 'pin-red';
    if (tags.includes('運営')) return 'pin-red';
    if (tags.includes('妖怪')) return 'pin-gray';
    if (tags.includes('飼育')) return 'pin-brown';
    if (tags.includes('野生')) return 'pin-green';
    if (tags.includes('スタッフ')) return 'pin-black';
    return 'pin-red';
};

export const getPageBackground = (tags) => {
    if (!tags) return null;
    const BG_MAP = {
        'A': 'assets/page/shiiku_low_res.webp',
        'B': 'assets/page/yo-kai_low_res.webp',
        'C': 'assets/page/yasei_low_res.webp',
        'D': 'assets/page/staff_low_res.webp',
        'E': 'assets/page/unei_low_res.webp'
    };
    if (tags.includes('運営')) return BG_MAP['E'];
    if (tags.includes('妖怪')) return BG_MAP['B'];
    if (tags.includes('飼育')) return BG_MAP['A'];
    if (tags.includes('野生')) return BG_MAP['C'];
    if (tags.includes('スタッフ')) return BG_MAP['D'];
    return null;
};

export const isMemberVisible = (member, castConfig) => {
    if (!castConfig) return true;
    if (castConfig.showAllMembers) return true;
    if (member.section === '運営部' || member.section === 'スタッフ') return true;
    return (castConfig.visibleMembers || []).includes(member.id);
};
