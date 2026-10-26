/* Invictus — безопасный вывод в HTML.
 * Загружается первым. Всё, что приходит от пользователя, из файлов, из облака или из внешних API,
 * вставляется в разметку только через Safe.esc / Safe.url. */
(function (global) {
    'use strict';

    var MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };

    function esc(value) {
        if (value === null || value === undefined) return '';
        return String(value).replace(/[&<>"'`]/g, function (ch) { return MAP[ch]; });
    }

    // Безопасный URL для src/href. Разрешены только перечисленные протоколы.
    // data: допустим только для картинок/видео/аудио (загрузки пользователя из FileReader).
    function url(value, opts) {
        opts = opts || {};
        var raw = String(value === null || value === undefined ? '' : value).trim();
        if (!raw) return '';
        var allowData = opts.allowData || ['image/', 'video/', 'audio/', 'application/pdf'];
        var low = raw.toLowerCase().replace(/[\u0000-\u0020]/g, '');
        if (low.indexOf('data:') === 0) {
            var ok = allowData.some(function (p) { return low.indexOf('data:' + p) === 0; });
            if (!ok || low.indexOf('data:image/svg') === 0) return '';
            return esc(raw);
        }
        if (low.indexOf('blob:') === 0) return esc(raw);
        // относительные пути внутри приложения
        if (!/^[a-z][a-z0-9+.\-]*:/i.test(low) && low.indexOf('//') !== 0) return esc(raw);
        var protocols = opts.protocols || ['https:', 'http:'];
        try {
            var u = new URL(raw, global.location ? global.location.href : 'https://invalid.local/');
            if (protocols.indexOf(u.protocol) === -1) return '';
            if (opts.hosts && opts.hosts.indexOf(u.hostname) === -1) return '';
            return esc(u.href);
        } catch (e) { return ''; }
    }

    // Встраиваемое видео: только YouTube (youtube-nocookie) по ID. Возвращает безопасный embed-URL или ''.
    function youtubeEmbed(value) {
        var raw = String(value || '').trim();
        var m = raw.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        return m ? 'https://www.youtube-nocookie.com/embed/' + m[1] : '';
    }

    // Подсветка найденного слова: сначала экранируем, потом оборачиваем в <mark>.
    function highlight(text, query) {
        var safe = esc(text);
        if (!query) return safe;
        var parts = String(query).toLowerCase().split(/\s+/).filter(Boolean);
        parts.forEach(function (p) {
            var escapedPart = esc(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            try { safe = safe.replace(new RegExp(escapedPart, 'ig'), function (m) { return '<mark>' + m + '</mark>'; }); } catch (e) { /* ignore */ }
        });
        return safe;
    }

    global.Safe = { esc: esc, url: url, youtubeEmbed: youtubeEmbed, highlight: highlight };
})(typeof window !== 'undefined' ? window : globalThis);
