// Language Switcher with Translation
// The langSwitcher lives in the nav partial injected async by includes.js.
// We wire it up once that partial is ready.
function initLangSwitcher() {
    const langSwitcher = document.getElementById('langSwitcher');
    if (!langSwitcher) return;

    const translations = {
        en: typeof englishTranslations !== 'undefined' ? englishTranslations : {},
        ja: {}
    };
    const supportedLangs = ['en', 'ja'];

    function translatePage(lang) {
        const elementsToTranslate = document.querySelectorAll(`
            [data-translate], h1, h2, h3, h4, h5, h6, p, a.btn,
            .section-subtitle, .search-input,
            .info-item-label, .info-item-value,
            .spec-label, .spec-value,
            .cost-label, .cost-value,
            .tab-btn, .section-title,
            label, span:not(.search-results span):not(.search-result-item span),
            .chart-title, td, th, dt, dd, .footer-menu a, li:not(.search-results li),
            .value, option, button:not(.tab-btn), a.location-link,
            #xj-select-category a, #xj-select-category li
        `);

        elementsToTranslate.forEach(element => {
            if (element.closest('.search-results') ||
                element.closest('.search-result-item') ||
                element.closest('#airportSuggestions') ||
                element.closest('.language-switcher') ||
                element.closest('.nav-list-card') ||
                element.closest('.home-linkbox-right') ||
                element.closest('.general-title') ||
                element.classList.contains('linkbox-card-text')) {
                return;
            }

            const hasOnlyChildren = element.children.length > 0 &&
                                   Array.from(element.childNodes).every(node =>
                                       node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()
                                   );
            if (hasOnlyChildren) return;

            const isInput = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
            const originalText = element.getAttribute('data-original') ||
                                 (isInput ? element.getAttribute('placeholder') : null) ||
                                 element.textContent.trim();

            if (!originalText || originalText.length < 2) return;

            // Skip elements with mixed content (both element children like <br>/<a>
            // and direct text nodes) when no explicit translation exists.
            // This preserves structural markup and prevents <br> tags being stripped out.
            const hasMixedContent = element.children.length > 0 &&
                                    Array.from(element.childNodes).some(node =>
                                        node.nodeType === Node.TEXT_NODE && node.textContent.trim()
                                    );
            const hasTranslation = (lang === 'en' && translations.en[originalText]) ||
                                   (lang === 'ja' && translations.ja[originalText]);
            if (hasMixedContent && !hasTranslation) return;

            if (!element.getAttribute('data-original')) {
                element.setAttribute('data-original', originalText);
            }

            const translation =
                (lang === 'en' && translations.en[originalText])
                    ? translations.en[originalText]
                    : (lang === 'ja' && translations.ja[originalText])
                        ? translations.ja[originalText]
                        : originalText;

            if (isInput) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        translateNavLinks(lang);

        // ── XJ IR widget: category tabs ──────────────────────────────────────────
        // The general loop skips <li> elements that have only child elements
        // (hasOnlyChildren guard), so we handle them explicitly here.
        // Always read from data-original (set by main loop or by us) so the
        // Japanese key is preserved even when already in English mode.
        document.querySelectorAll('#xj-select-category li').forEach(function(li) {
            var textEl = (li.children.length === 1 && li.children[0].children.length === 0)
                ? li.children[0]
                : li;
            // Seed data-original with the raw text ONLY if it hasn't been set yet.
            // If it's already set, the cached value is the authoritative Japanese source.
            var currentText = textEl.textContent.trim();
            if (!textEl.getAttribute('data-original')) {
                textEl.setAttribute('data-original', currentText);
            }
            var orig = textEl.getAttribute('data-original');
            textEl.textContent = (lang === 'en' && translations.en[orig])
                ? translations.en[orig]
                : orig;
        });

        // ── XJ IR widget: year dropdown options ───────────────────────────────────
        document.querySelectorAll('#xj-select-year_s option').forEach(function(opt) {
            var currentText = opt.textContent.trim();
            if (!opt.getAttribute('data-original')) {
                opt.setAttribute('data-original', currentText);
            }
            var orig = opt.getAttribute('data-original');
            opt.textContent = (lang === 'en' && translations.en[orig])
                ? translations.en[orig]
                : orig;
        });

        // Replace 海里 / マッハ unit labels inside mixed-content elements
        // that were skipped by the key-based translation above.
        (function replaceUnits(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                var t = node.textContent;
                if (lang === 'en') {
                    t = t.replace(/(最大)?(\d[\d\-\u2013]*)名/g, '$2');
                    t = t.replace(/マッハ/g, 'Mach ').replace(/海里/g, '\u00a0NM');
                } else if (lang === 'ja') {
                    t = t.replace(/Mach /g, 'マッハ').replace(/\u00a0NM/g, '海里');
                }
                node.textContent = t;
            } else if (node.nodeType === Node.ELEMENT_NODE &&
                       node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
                node.childNodes.forEach(function(c) { replaceUnits(c); });
            }
        })(document.body);
    }

    function translateNavLinks(lang) {
        document.querySelectorAll('.nav-list-card a h2').forEach(function(h2) {
            var textNode = null;
            for (var i = 0; i < h2.childNodes.length; i++) {
                var n = h2.childNodes[i];
                if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
                    textNode = n;
                    break;
                }
            }
            var span = h2.querySelector('span');
            if (!textNode || !span) return;

            if (!h2.dataset.jaText) {
                h2.dataset.jaText = textNode.textContent.trim();
                h2.dataset.enText = span.textContent.trim()
                    .replace(/^-\s*/, '').replace(/\s*-$/, '').trim();
            }

            if (lang === 'en') {
                textNode.textContent = '\n                                ' + h2.dataset.enText + '\n                                ';
                span.textContent = h2.dataset.jaText;
            } else {
                textNode.textContent = '\n                                ' + h2.dataset.jaText + '\n                                ';
                span.textContent = '- ' + h2.dataset.enText + ' -';
            }
        });
    }

    function ensureLanguageOptionLabels() {
        const enOption = langSwitcher.querySelector('option[value="en"]');
        if (enOption) enOption.textContent = '🇺🇸 English';
        const jaOption = langSwitcher.querySelector('option[value="ja"]');
        if (jaOption) jaOption.textContent = '🇯🇵 日本語';
    }

    function applyLanguage(lang) {
        const normalizedLang = supportedLangs.includes(lang) ? lang : 'ja';
        document.documentElement.setAttribute('lang', normalizedLang);
        translatePage(normalizedLang);
        ensureLanguageOptionLabels();
        try {
            localStorage.setItem('preferredLang', normalizedLang);
        } catch (error) {
            console.warn('Unable to persist language preference.', error);
        }
    }

    const storedLang = (() => {
        try {
            return localStorage.getItem('preferredLang');
        } catch (error) {
            return null;
        }
    })();
    const initialLang = supportedLangs.includes(storedLang) ? storedLang : 'ja';
    langSwitcher.value = initialLang;
    applyLanguage(initialLang);

    langSwitcher.addEventListener('change', function() {
        applyLanguage(this.value);
    });

    // Re-translate after footer partial is injected (includes.js loads it async)
    document.addEventListener('footer:loaded', function() {
        applyLanguage(langSwitcher.value);
    });

    // Re-translate XJ IR widget content as it loads dynamically
    document.querySelectorAll('.xj-category, #xj-mainlist, #xj-mainlist-kokoku01, #xj-mainlist-kokoku02, .xj-select-year').forEach(function(container) {
        new MutationObserver(function() {
            translatePage(langSwitcher.value);
        }).observe(container, { childList: true });
    });
    // Also observe the year <select> directly — options are added to the select
    // itself, not its parent div, so the div-level observer never fires for them.
    var xjYearSelect = document.getElementById('xj-select-year_s');
    if (xjYearSelect) {
        new MutationObserver(function() {
            translatePage(langSwitcher.value);
        }).observe(xjYearSelect, { childList: true });
    }
}

document.addEventListener('nav:loaded', initLangSwitcher);
// Fallback: if nav was somehow already present (e.g. cached) also try on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('langSwitcher')) initLangSwitcher();
});
