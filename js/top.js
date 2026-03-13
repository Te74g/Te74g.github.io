(function () {
    const run = async () => {
        try {
            const mod = await import('./pages/top.js');
            if (typeof mod.initHomePage === 'function') {
                await mod.initHomePage();
            }
        } catch (err) {
            console.error('[compat top.js] failed to initialize', err);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        void run();
    }
})();
