(function () {
    const run = async () => {
        try {
            const mod = await import('./pages/gallery.js');
            if (typeof mod.initGalleryPage === 'function') {
                await mod.initGalleryPage();
            }
        } catch (err) {
            console.error('[compat gallery.js] failed to initialize', err);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        void run();
    }
})();
