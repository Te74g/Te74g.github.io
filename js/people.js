(function () {
    const run = async () => {
        try {
            const mod = await import('./pages/people.js');
            if (typeof mod.initPeoplePage === 'function') {
                await mod.initPeoplePage();
            }
        } catch (err) {
            console.error('[compat people.js] failed to initialize', err);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        void run();
    }
})();
