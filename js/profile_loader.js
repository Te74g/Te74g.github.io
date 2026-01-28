/**
 * Profile Loader
 * Dynamically loads member profile data based on URL query parameter `?id=...`
 * Requires: site_data.js (membersData), profile_switcher.js (ProfileImageSwitcher)
 */

document.addEventListener('DOMContentLoaded', () => {
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
    // Render Content
    // ==========================================

    // 0. Update Page Title and H1
    document.title = `あにあめもりあ | ${member.name}`;
    const h1Title = document.querySelector('h1');
    if (h1Title) h1Title.textContent = member.name;

    // 1. Tags
    const tagsContainer = document.getElementById('dynamic-tags-container');
    if (tagsContainer) {
        let tagsHtml = '';
        if (member.tagLabel) {
            tagsHtml += `<span class="tag" style="background:#000; color:#fff;">${member.tagLabel}</span>`;
        }
        if (member.tags) {
            const tagsList = member.tags.split(' ');
            tagsList.forEach(t => {
                if (t !== member.tagLabel) {
                    tagsHtml += `<span class="tag tag--soft">${t}</span>`;
                }
            });
        }
        tagsContainer.innerHTML = tagsHtml;
    }

    // 2. Introduction
    if (member.introduction) {
        const introEl = document.getElementById('dynamic-intro-text');
        if (introEl) introEl.innerHTML = member.introduction;
    }

    // 3. Goals
    const goalsSection = document.querySelector('.goals-section');
    if (member.goals && Array.isArray(member.goals) && member.goals.length > 0) {
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
    if (member.motifAnimal && member.motifIcon) {
        const motifContainer = document.getElementById('dynamic-motif-container');
        if (motifContainer) {
            let iconPath = fixPath(member.motifIcon);
            motifContainer.innerHTML = `
                <div class="motif-container">
                    <div class="motif-icon-box">
                        <img src="${iconPath}" alt="" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div class="motif-text-box">
                        <span>モチーフにしている動物：${member.motifAnimal}</span>
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
            signImg.src = fixPath(member.sign);
            signImg.style.display = 'block';
        }
    }

    // 6. Social Icons
    if (member.socials && Array.isArray(member.socials)) {
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
                    iconHtml = '<img src="../assets/VRChat Logo Black.png" alt="VRChat" style="width: 50px; height: 50x; object-fit: contain;">';
                } else if (type === 'booth') {
                    colorClass = 'social-icon--red';
                    iconHtml = '<img src="../assets/Booth_logo_icon.svg" alt="Booth" style="width: 45px; height: 45px; object-fit: contain;">';
                } else {
                    iconHtml = '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>';
                }

                let style = '';
                if (type === 'youtube') style = 'background-color: #FF0000; border-color: #FF0000; color: white;';
                if (type === 'x') style = 'background-color: #000000; border-color: #000000; color: white;';
                if (type === 'vrchat') style = 'background-color: #ffffff; border-color: #ccc;';

                html += `<a href="${url}" class="social-icon ${colorClass}" target="_blank" aria-label="${type}" style="${style}">
                    ${iconHtml}
                </a>`;
            });
            socialContainer.innerHTML = html;
        }
    }

    // 7. Related Cast
    const relatedContainer = document.getElementById('dynamic-related-cast');
    if (relatedContainer) {
        const relatedMembers = getRelatedMembers(member, membersData);
        let html = '';
        relatedMembers.forEach(relatedMember => {
            let imgPath = relatedMember.profileImages && relatedMember.profileImages.length > 0
                ? relatedMember.profileImages[0]
                : relatedMember.image;
            imgPath = fixPath(imgPath);

            // Link path fix
            let linkPath = relatedMember.link;
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

        // Background Logic (Ported from profile_switcher.js)
        const bgElement = document.querySelector('.profile-bg-texture');
        if (bgElement) {
            const BG_MAP = {
                'A': '../assets/aniamemoria_member_background_A.png',
                'B': '../assets/aniamemoria_member_background_B.png',
                'C': '../assets/aniamemoria_member_background_C.png',
                'D': '../assets/aniamemoria_member_background_D.png',
                'E': '../assets/aniamemoria_member_background_E.png'
            };
            const tags = member.tags || "";
            let selectedBg = null;
            if (tags.includes("運営")) selectedBg = BG_MAP['E'];
            else if (tags.includes("飼育")) selectedBg = BG_MAP['A'];
            else if (tags.includes("野生")) selectedBg = BG_MAP['C'];
            else if (tags.includes("妖怪")) selectedBg = BG_MAP['B'];
            else if (tags.includes("スタッフ")) selectedBg = BG_MAP['D'];

            if (selectedBg) {
                bgElement.style.backgroundImage = `url('${selectedBg}')`;
            }
        }

        // Trigger Switcher Init manually for this specific container if possible,
        // or just re-run initAll()
        if (typeof ProfileImageSwitcher !== 'undefined') {
            ProfileImageSwitcher.initAll();
        }
    }

});

// ==========================================
// Helper Functions
// ==========================================

function fixPath(path) {
    if (!path) return "";
    if (path.match(/^(http|\/\/)/)) return path;

    // We are in /member/ folder usually.
    // Data paths are like "assets/member/..."
    // We need "../assets/member/..."
    if (!path.startsWith('../') && !path.startsWith('/')) {
        return '../' + path;
    }
    return path;
}

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
                score += 5;
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
