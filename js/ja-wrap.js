/**
 * ja-wrap.js — Aerolab International
 * Applies Japanese word-boundary line-breaking using a conservative local
 * tokenizer. No external dependencies, no CDN.
 *
 * Strategy:
 *  - Inserts <wbr> tags only at true word boundaries (never inside a word).
 *  - Keeps common Japanese aircraft/domain compounds intact where script
 *    boundaries would otherwise be too eager, especially katakana loanwords.
 *  - Sets word-break: keep-all inline so the browser strongly prefers <wbr>.
 *  - Re-applies automatically when the page switches back to Japanese.
 *  - Compatible with the existing language.js translation system.
 */
(function () {
    'use strict';

    // Characters that must never appear at the START of a line (行頭禁則).
    // We avoid inserting <wbr> before any segment that begins with one of these.
    // Hyphen (-) is included so model numbers like YS-11 are never split at the dash.
    var LINE_START_FORBIDDEN = /^[。、．，！？）)\]\}〕］｝〉》」』】〙〗〟'"｠ヽヾゝゞ〃仝々〻ーァィゥェォッャュョヮぁぃぅぇぉっゃゅょゎ‥…・゛゜\-]/;

    // Short pure-hiragana segments (≤ 2 chars) are verb/adjective morphemes and
    // grammatical glue (し, ま, しま, ます, した …). Never break after these.
    var SHORT_HIRAGANA = /^[\u3041-\u3096\u309D\u309E]{1,2}$/;

    // The local tokenizer groups hiragana runs coarsely by design.
    // Attach these short-to-medium runs to the previous content word so lines do
    // not start with されています / および / いただけます style fragments.
    var ATTACH_HIRAGANA = /^[\u3041-\u3096\u309D\u309E]{1,6}$/;

    // Kanji range check and hiragana-ending check (for okurigana rule).
    var HAS_KANJI     = /[\u4E00-\u9FFF\u3400-\u4DBF]/;
    var ENDS_HIRAGANA = /[\u3041-\u3096\u309D\u309E]$/;

    // Exactly one kanji character — single-kanji segments are almost always a
    // prefix (高+品質) or suffix (効率+性). Breaking on either side looks wrong.
    var SINGLE_KANJI  = /^[\u4E00-\u9FFF\u3400-\u4DBF]$/;

    // Pure-kanji segment (no hiragana/katakana mixing). Two adjacent multi-char
    // pure-kanji segments are almost always a single compound — breaking between
    // them produces incorrect splits like 燃料|消費率, 航続|距離, 技術|仕様.
    var KANJI_ONLY    = /^[\u4E00-\u9FFF\u3400-\u4DBF]+$/;

    // Katakana loanwords are often split too aggressively by script boundaries:
    // ビジネス|ジェット, ペイ|ロード, レンジ|リング. Treat adjacent
    // katakana chunks as one vocabulary item.
    var KATAKANA_ONLY = /^[\u30A1-\u30FA\u30FC\u30FD\u30FE\uFF66-\uFF9D]+$/;

    // Prevents ガルフストリーム|G550, エアバス|H125 — keep a katakana aircraft
    // name attached to its immediately-following alphanumeric model number.
    var ALPHANUM_START = /^[A-Za-z0-9]/;

    var HAS_JAPANESE = /[\u3041-\u30FF\u3400-\u9FFF]/;

    // Intl.Segmenter gives superior word-boundary accuracy for Japanese
    // (correct handling of 買い付ける, 問い合わせ, compound verbs, etc.).
    // Fall back to the regex tokenizer only on very old browsers.
    var intlSegmenter = (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function')
        ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;

    var FALLBACK_TOKEN_RE = /[A-Za-z0-9]+(?:[.,:/-][A-Za-z0-9]+)*|[\u30A1-\u30FA\u30FC\u30FD\u30FE\uFF66-\uFF9D]+|[\u4E00-\u9FFF\u3400-\u4DBF々〆ヵヶ]+|[\u3041-\u3096\u309D\u309E]+|\s+|./g;

    var SKIP_ANCESTOR_SELECTOR = [
        '.language-switcher',
        '.search-results',
        '.search-result-item',
        '#airportSuggestions',
        'script',
        'style',
        'textarea',
        'select',
        'option'
    ].join(',');

    var bodyObserver = null;
    var applyTimer = null;

    function fallbackSegmentText(text) {
        return (text.match(FALLBACK_TOKEN_RE) || []).map(function (token) {
            return {
                segment: token,
                isWordLike: HAS_JAPANESE.test(token) || /[A-Za-z0-9]/.test(token)
            };
        });
    }

    function segmentText(text) {
        if (intlSegmenter) {
            return Array.from(intlSegmenter.segment(text)).map(function (s) {
                return { segment: s.segment, isWordLike: s.isWordLike };
            });
        }
        return fallbackSegmentText(text);
    }

    /**
     * Insert <wbr> tags at word boundaries, maximising line-fill while keeping
     * verb/adjective morpheme clusters attached to their stem.
     *
     * Strategy A — word boundaries:
     *   When a break opportunity is found after word-like segment S, advance
     *   past any immediately-following hiragana glue
     *   (し/ます/ています/および…) and place <wbr> AFTER that whole cluster.  The browser
     *   breaks between full word+morpheme units, never mid-conjugation.
     *
     * Strategy B — after punctuation:
     *   Insert <wbr> immediately after 。、！？・ so the following word can start
     *   a new line.  These chars cannot START a line (LINE_START_FORBIDDEN), but
     *   there is no reason to block a break after them.  Without this, a run like
     *   "確認します。次の内容" becomes one giant unbreakable chunk, and lists like
     *   "速度・航続距離・燃料消費率" get no internal break opportunities.
     *
     * Six rules suppress a break opportunity entirely:
     *  1. Next segment starts with a line-start forbidden char (行頭禁則).
     *  2. Current segment is itself a short pure-hiragana morpheme (≤ 2 chars).
     *  3. Current segment has kanji AND ends in hiragana (okurigana / verb stem).
     *  4. Either the current OR the next segment is a single kanji character
     *     (prefix/suffix guard: prevents 高|品質, 効率|性, 格納|庫 etc.).
     *  5. Both the current AND the next segment are pure-kanji with ≥ 2 chars
     *     each (compound guard: prevents 燃料|消費率, 航続|距離, 技術|仕様 etc.).
     */
    function insertWordBreaks(text) {
        if (!HAS_JAPANESE.test(text)) return text;

        var leading = text.match(/^\s*/)[0];
        var trailing = text.match(/\s*$/)[0];
        var core = text.slice(leading.length, text.length - trailing.length);
        if (core.length < 5) return text;

        var result = '';
        var segs = segmentText(core);
        var i = 0;
        while (i < segs.length) {
            result += segs[i].segment;
            if (i < segs.length - 1 && segs[i].isWordLike) {
                var nextSeg = segs[i + 1].segment;
                // Don't insert <wbr> within pure-Latin/ASCII runs embedded in Japanese text
                // (e.g. "Aerospace & Defense Review"). The browser handles English word
                // wrapping at spaces natively; we only add break points at Japanese boundaries.
                if (!HAS_JAPANESE.test(segs[i].segment) && !HAS_JAPANESE.test(nextSeg)) { i++; continue; }
                // Rule 1 — line-start forbidden next char
                if (LINE_START_FORBIDDEN.test(nextSeg)) { i++; continue; }
                // Rule 2 — short hiragana morpheme (current segment)
                if (SHORT_HIRAGANA.test(segs[i].segment)) { i++; continue; }
                // Rule 3 — okurigana ending (kanji word ending in hiragana)
                if (HAS_KANJI.test(segs[i].segment) && ENDS_HIRAGANA.test(segs[i].segment)) { i++; continue; }
                // Rule 4a — next segment is a single kanji (suffix guard: prevents 効率|性, 格納|庫)
                if (SINGLE_KANJI.test(nextSeg)) { i++; continue; }
                // Rule 4b — current segment is single kanji, but ONLY block when next is a
                // content word (prefix guard: prevents 高|品質).  Exception: if next is a
                // short hiragana particle (と, を, に…), allow a break here so the particle
                // gets absorbed and the break lands after "操縦性と<wbr>" rather than
                // leaving "操縦性と高い汎用性を備え、" as one unjoinable 12-char chunk.
                if (SINGLE_KANJI.test(segs[i].segment) && !SHORT_HIRAGANA.test(nextSeg)) { i++; continue; }
                // Rule 5 — two adjacent multi-char pure-kanji segments are a compound word.
                // Prevents 燃料|消費率, 航続|距離, 技術|仕様, 主要|性能 etc.
                if (KANJI_ONLY.test(segs[i].segment) && segs[i].segment.length >= 2 &&
                        KANJI_ONLY.test(nextSeg) && nextSeg.length >= 2) { i++; continue; }
                // Rule 6 — adjacent katakana chunks are usually one loanword in
                // aircraft copy. Prevents ビジネス|ジェット, ペイ|ロード,
                // レンジ|リング while still allowing breaks around particles.
                if (KATAKANA_ONLY.test(segs[i].segment) && KATAKANA_ONLY.test(nextSeg)) { i++; continue; }
                // Rule 7 — katakana word immediately followed by an alphanumeric
                // model number: ガルフストリーム|G550, エアバス|H125.
                if (KATAKANA_ONLY.test(segs[i].segment) && ALPHANUM_START.test(nextSeg)) { i++; continue; }
                // Rule 8a — kanji compound (≥ 2 chars) followed by katakana:
                // prevents 整備|スタッフ, 超長距離|ビジネスジェット, 設備|メンテナンス.
                if (KANJI_ONLY.test(segs[i].segment) && segs[i].segment.length >= 2 &&
                        KATAKANA_ONLY.test(nextSeg)) { i++; continue; }
                // Rule 8b — katakana word followed by kanji compound (≥ 2 chars):
                // prevents キャビン|空間, アビオニクス|機器, サービス|品質.
                if (KATAKANA_ONLY.test(segs[i].segment) &&
                        KANJI_ONLY.test(nextSeg) && nextSeg.length >= 2) { i++; continue; }
                // Rule 9 — ASCII alphanumeric segment immediately followed by katakana:
                // prevents Garmin|アビオニクス, MRO|プロバイダー, B777|エンジン.
                if (!HAS_JAPANESE.test(segs[i].segment) && /^[A-Za-z0-9]/.test(segs[i].segment) &&
                        KATAKANA_ONLY.test(nextSeg)) { i++; continue; }

                // Break opportunity found. Advance past any immediately-following
                // short-hiragana segments (し, ます, た, て, な, に, と …) so they
                // attach to the current chunk instead of starting the next line.
                // We intentionally do NOT check isWordLike here: particles and
                // adjective connectors should stay attached, so gating on word-like would
                // leave them unabsorbed and produce "柔軟 | な運用…" style breaks.
                i++;
                while (i < segs.length &&
                       ATTACH_HIRAGANA.test(segs[i].segment)) {
                    // お and ご are honorific prefixes that attach to the FOLLOWING kanji
                    // word (お届けする, お客様, ご提供 …), not suffixes of the preceding
                    // word.  Stop absorption here so the break lands BEFORE the honorific
                    // rather than after the isolated お/ご.
                    if (/^[おご]$/.test(segs[i].segment) &&
                            i + 1 < segs.length && HAS_KANJI.test(segs[i + 1].segment)) {
                        break;
                    }
                    result += segs[i].segment;
                    i++;
                }
                // Place <wbr> unless: end of string, line-start forbidden char,
                // or the next token is a space (the space itself is already a
                // CSS break point — adding <wbr> before it would isolate the
                // preceding word alone on a line, e.g. G550|<space>の).
                if (i < segs.length &&
                        !LINE_START_FORBIDDEN.test(segs[i].segment) &&
                        !/^\s/.test(segs[i].segment)) {
                    result += '<wbr>';
                }
                continue; // i already advanced; skip the i++ below
            }            // After 。、！？・ insert a <wbr> so the *following* word can start a
            // new line.  The characters themselves cannot start a line
            // (LINE_START_FORBIDDEN handles that), but there is no reason to
            // prevent a break immediately after them.  Without this, an entire
            // "[verb]します。[next word]" sequence becomes one unbreakable chunk,
            // and lists like "速度・航続距離・燃料消費率" have no break opportunities.
            if (i < segs.length - 1 &&
                    /^[。、！？・]/.test(segs[i].segment) &&
                    !LINE_START_FORBIDDEN.test(segs[i + 1].segment)) {
                result += '<wbr>';
            }            i++;
        }
        // Replace spaces within pure-ASCII runs with NBSP so the browser cannot
        // break English phrases at CSS spaces.  E.g. "Aerospace & Defense Review"
        // stays on one line instead of splitting as "Aerospace & Defense | Review".
        // Only spaces flanked by ASCII printable chars (both sides non-Japanese)
        // are converted; CJK↔Latin boundaries are left as regular spaces.
        result = result.replace(/ /g, function (m, offset, s) {
            var b = s[offset - 1];
            var a = s[offset + 1];
            return (b && /[A-Za-z0-9!-~]/.test(b) &&
                    a && /[A-Za-z0-9!-~]/.test(a)) ? '\u00A0' : m;
        });
        return leading + result + trailing;
    }

    function replaceTextNodeWithBreaks(node) {
        var original = node.nodeValue;
        var processed = insertWordBreaks(original);
        if (processed === original) return;

        var parts = processed.split('<wbr>');
        var frag = document.createDocumentFragment();
        parts.forEach(function (part, index) {
            if (index > 0) frag.appendChild(document.createElement('wbr'));
            if (part) frag.appendChild(document.createTextNode(part));
        });
        node.parentNode.replaceChild(frag, node);
    }

    function removeExistingBreaks(el) {
        Array.prototype.slice.call(el.querySelectorAll('wbr')).forEach(function (node) {
            node.parentNode.removeChild(node);
        });
    }

    function collectTextNodes(root, nodes) {
        Array.prototype.forEach.call(root.childNodes, function (child) {
            if (child.nodeType === 3 /* TEXT_NODE */) {
                if (child.nodeValue && child.nodeValue.trim() && HAS_JAPANESE.test(child.nodeValue)) {
                    nodes.push(child);
                }
                return;
            }

            if (child.nodeType !== 1 /* ELEMENT_NODE */) return;
            if (child.matches(SKIP_ANCESTOR_SELECTOR)) return;
            collectTextNodes(child, nodes);
        });
    }

    function wrapTextNodes(el) {
        var nodes = [];
        collectTextNodes(el, nodes);
        nodes.forEach(replaceTextNodeWithBreaks);
    }

    function applyToPage() {
        if ((document.documentElement.getAttribute('lang') || 'ja') !== 'ja') return;
        if (!document.body) return;

        if (bodyObserver) {
            bodyObserver.disconnect();
            bodyObserver = null;
        }

        try {
            // Process all Japanese text nodes in the entire document so every
            // element — regardless of CSS class — gets consistent <wbr> placement.
            // word-break: keep-all is now set on body via CSS, so no per-element
            // inline styles are needed here.
            removeExistingBreaks(document.body);
            wrapTextNodes(document.body);
        } finally {
            observeBody();
        }
    }

    function scheduleApply() {
        if (applyTimer) window.clearTimeout(applyTimer);
        applyTimer = window.setTimeout(function () {
            applyTimer = null;
            applyToPage();
        }, 60);
    }

    function observeBody() {
        if (!document.body || bodyObserver) return;
        bodyObserver = new MutationObserver(function (mutations) {
            if ((document.documentElement.getAttribute('lang') || 'ja') !== 'ja') return;
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].type === 'childList' || mutations[i].type === 'characterData') {
                    scheduleApply();
                    return;
                }
            }
        });
        bodyObserver.observe(document.body, { childList: true, characterData: true, subtree: true });
    }

    // Re-apply whenever the page switches back to Japanese.
    // MutationObserver microtasks fire AFTER language.js finishes translatePage(),
    // so Japanese text is already restored in the DOM before we run.
    new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].attributeName === 'lang' &&
                    document.documentElement.getAttribute('lang') === 'ja') {
                applyToPage();
                return;
            }
        }
    }).observe(document.documentElement, { attributes: true });

    // Apply immediately (handles both initial page load and deferred execution)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyToPage);
    } else {
        applyToPage();
    }
}());
