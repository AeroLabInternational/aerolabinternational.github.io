/**
 * includes.js — Aerolab International
 * Fetches and injects shared nav and footer partials into every page.
 * Requires: /partials/nav.html and /partials/footer.html
 */
(function () {
    function loadPartial(targetId, url) {
        var el = document.getElementById(targetId);
        if (!el) return;
        fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('Failed to load ' + url);
                return res.text();
            })
            .then(function (html) {
                el.outerHTML = html;
                if (targetId === 'site-nav') {
                    document.dispatchEvent(new Event('nav:loaded'));
                } else if (targetId === 'site-footer') {
                    document.dispatchEvent(new Event('footer:loaded'));
                }
            })
            .catch(function (err) {
                console.warn('Partial load error:', err);
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadPartial('site-nav', '/partials/nav.html');
        loadPartial('site-footer', '/partials/footer.html');
        loadPartial('site-linkbox', '/partials/linkbox.html');

        // Japanese word-boundary line-breaking (cross-browser, no external deps)
        var s = document.createElement('script');
        s.src = '/js/ja-wrap.js?v=14';
        document.head.appendChild(s);
    });

    // Nav toggle — vanilla JS for pages that don't load jQuery/main.js.
    // Pages with jQuery use main.js for this; $ check prevents duplicate listeners.
    if (typeof $ === 'undefined') {
        var _navFlg = 0, _navScroll = 0;
        document.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('.nav-screen') : null;
            if (!btn) return;
            if (_navFlg === 0) {
                _navFlg = 1;
                _navScroll = window.scrollY || window.pageYOffset;
                btn.classList.add('active');
                var menu = document.querySelector('.nav-menu');
                if (menu) menu.style.display = 'block';
                document.body.classList.add('fixed');
            } else {
                _navFlg = 0;
                btn.classList.remove('active');
                var menu = document.querySelector('.nav-menu');
                if (menu) menu.style.display = 'none';
                document.body.classList.remove('fixed');
                window.scrollTo(0, _navScroll);
            }
        });
        window.addEventListener('scroll', function () {
            var header = document.querySelector('header');
            if (header) {
                if (window.scrollY > 0) header.classList.add('scroll');
                else header.classList.remove('scroll');
            }
        });
    }
})();
