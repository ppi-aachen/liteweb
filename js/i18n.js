/**
 * PPI Aachen i18n (Internationalization) Module
 * Supports: Indonesian (id) [default], English (en), German (de)
 *
 * How it works:
 *  1. Elements with data-lang-id / data-lang-en / data-lang-de attributes have
 *     their textContent swapped on language change.
 *  2. Elements with class "lang-block" and a lang="id|en|de" attribute are
 *     shown or hidden based on the active language.
 *  3. Language switcher buttons carry class "lang-btn" and data-lang="id|en|de".
 *     Desktop switcher container: data-lang-switcher="desktop"
 *     Mobile  switcher container: data-lang-switcher="mobile"
 *  4. The chosen language is persisted in localStorage under the key 'ppia-lang'.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'ppia-lang';
    var SUPPORTED = ['id', 'en', 'de'];
    var DEFAULT_LANG = 'id';

    /* -------------------------------------------------- helpers */
    function getLang() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            return SUPPORTED.indexOf(stored) !== -1 ? stored : DEFAULT_LANG;
        } catch (e) {
            return DEFAULT_LANG;
        }
    }

    function saveLang(lang) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    }

    /* -------------------------------------------------- apply */
    function applyLang(lang) {
        if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;

        /* 1. Swap textContent on elements with data-lang-* attributes */
        var textEls = document.querySelectorAll('[data-lang-id]');
        for (var i = 0; i < textEls.length; i++) {
            var el = textEls[i];
            var text = el.getAttribute('data-lang-' + lang) || el.getAttribute('data-lang-id') || '';
            el.textContent = text;
        }

        /* 2. Show/hide lang-block elements */
        var blocks = document.querySelectorAll('.lang-block');
        for (var j = 0; j < blocks.length; j++) {
            var block = blocks[j];
            var blockLang = block.getAttribute('lang') || block.getAttribute('data-lang');
            block.style.display = (blockLang === lang) ? '' : 'none';
        }

        /* 3. Update desktop lang-btn active states */
        var desktopBtns = document.querySelectorAll('[data-lang-switcher="desktop"] .lang-btn');
        for (var k = 0; k < desktopBtns.length; k++) {
            var dbtn = desktopBtns[k];
            var isActive = dbtn.getAttribute('data-lang') === lang;
            if (isActive) {
                dbtn.classList.add('text-[#0161bf]', 'font-bold');
                dbtn.classList.remove('text-gray-400', 'font-light');
            } else {
                dbtn.classList.remove('text-[#0161bf]', 'font-bold');
                dbtn.classList.add('text-gray-400', 'font-light');
            }
        }

        /* 4. Update mobile lang-btn active states */
        var mobileBtns = document.querySelectorAll('[data-lang-switcher="mobile"] .lang-btn');
        for (var m = 0; m < mobileBtns.length; m++) {
            var mbtn = mobileBtns[m];
            var mActive = mbtn.getAttribute('data-lang') === lang;
            if (mActive) {
                mbtn.classList.add('bg-white', 'text-[#002f6c]', 'font-bold');
                mbtn.classList.remove('text-white', 'bg-white/10', 'font-light');
            } else {
                mbtn.classList.remove('bg-white', 'text-[#002f6c]', 'font-bold');
                mbtn.classList.add('text-white', 'bg-white/10', 'font-light');
            }
        }

        /* 5. Set html lang attribute for accessibility */
        document.documentElement.lang = lang;

        /* 6. Notify page-specific scripts */
        try {
            document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
        } catch (e) { /* IE fallback — no-op */ }
    }

    /* -------------------------------------------------- public API */
    function setLang(lang) {
        if (SUPPORTED.indexOf(lang) === -1) return;
        saveLang(lang);
        applyLang(lang);
    }

    /* -------------------------------------------------- init */
    function attachButtons() {
        var btns = document.querySelectorAll('.lang-btn');
        for (var i = 0; i < btns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    setLang(btn.getAttribute('data-lang'));
                });
            })(btns[i]);
        }
    }

    function init() {
        attachButtons();
        applyLang(getLang());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* Expose to global scope for onclick attributes and page scripts */
    window.setLang = setLang;
    window.getLang = getLang;
    window.applyLang = applyLang;
})();
