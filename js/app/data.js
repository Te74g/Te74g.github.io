/**
 * js/app/data.js
 * Centralized data access module.
 * Abstracts global variables defined in `data/*.js`.
 */

export function getSiteConfig() {
    return window.siteConfig || null;
}

export function getMembersData() {
    return window.membersData || [];
}

export function getEventsData() {
    return window.eventsData || [];
}

export function getGalleryData() {
    return window.galleryData || [];
}

export function getNewsData() {
    return window.newsData || [];
}

export function getLinksData() {
    return window.linksData || [];
}

export function getBlogData() {
    return window.blogData || [];
}

export function getAikotobaData() {
    return window.aikotobaData || [];
}
