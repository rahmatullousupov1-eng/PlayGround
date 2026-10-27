/* ============================================================
   Invictus v3.0 — 📰 Лента новостей (автообновление из интернета)
   Источники: Wikipedia (RU, открытый API) + локальный кэш/фолбэк
   ============================================================ */
const feedModule = {
    CACHE_KEY: 'invictus_feed_cache_v1',
    LAST_KEY: 'invictus_feed_last_update',
    AUTO_MS: 10 * 60 * 1000, // автообновление каждые 10 минут
    items: [],
    localPosts: [],
    source: '—',
    _timer: null,

    FALLBACK_ITEMS: [
        { title: 'Старт учебного года в медицинских вузах', desc: 'Обновления образовательных программ, расписаний и практик для студентов-медиков.', source: 'Инвиктус', category: 'образование', url: '' },
        { title: 'Новые клинические рекомендации', desc: 'Разделы по терапии, кардиологии и неврологии обновлены в национальных рекомендациях.', source: 'Инвиктус', category: 'клиника', url: '' },
        { title: 'Цифровые симуляторы в обучении', desc: 'Интерактивные 3D-модели и виртуальные пациенты всё чаще используются в медобразовании.', source: 'Инвиктус', category: 'технологии', url: '' },
        { title: 'Профилактика сезонных заболеваний', desc: 'Напоминания о вакцинации и гигиене: что важно знать студентам и врачам осенью.', source: 'Инвиктус', category: 'здоровье', url: '' },
        { title: 'Научные конференции и стажировки', desc: 'Как попасть на конференции, конкурсы и международные стажировки будущим врачам.', source: 'Инвиктус', category: 'карьера', url: '' }
    ],

    CATEGORIES: ['все', 'медицина', 'образование', 'здоровье', 'технологии', 'клиника', 'карьера'],

    init: function() {
        // Возвращаем кэш мгновенно
        try {
            this.localPosts = JSON.parse(localStorage.getItem('invictus_local_posts_v1') || '[]');
            if (!Array.isArray(this.localPosts)) this.localPosts = [];
            const raw = localStorage.getItem(this.CACHE_KEY);
            if (raw) {
                const cached = JSON.parse(raw);
                if (Array.isArray(cached.items) && cached.items.length) {
                    this.items = cached.items;
                    this.source = cached.source || 'кэш';
                    this._lastUpdateText = cached.updated || '';
                }
            }
        } catch (e) { /* ignore */ }

        if (typeof document !== 'undefined' && document.readyState === 'complete') {
            this.scheduleAutoRefresh();
        } else {
            window.addEventListener('load', () => this.scheduleAutoRefresh());
        }
    },

    scheduleAutoRefresh: function() {
        if (this._timer) clearInterval(this._timer);
        this._timer = setInterval(() => {
            if (navigationManager && navigationManager.currentScreen === 'feed') {
                this.loadRemote(true);
            }
        }, this.AUTO_MS);
    },

    show: function() {
        const screen = document.getElementById('feed-screen');
        if (screen) screen.style.display = 'block';
        this.render();
        // Обновляем из сети только если кэш пуст или старше 5 минут
        const last = Number(localStorage.getItem(this.LAST_KEY) || 0);
        if (!this.items.length || Date.now() - last > 5 * 60 * 1000) {
            this.loadRemote(true);
        }
    },

    async loadRemote(silent) {
        const statusElTop = document.getElementById('feed-status');
        if (statusElTop && !silent) statusElTop.textContent = '⏳ Обновление...';
        if (statusElTop && silent && !this.items.length) statusElTop.textContent = '⏳ Подключение к интернету...';

        let items = [];
        let source = '';
        try {
            const resp = await fetch('https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=медицина здоровье вуз&srlimit=8&format=json&origin=*', { signal: AbortSignal.timeout(9000) });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();
            const rows = data && data.query && data.query.search;
            if (Array.isArray(rows)) {
                items = rows.filter(r => r && r.title).map(r => ({
                    title: String(r.title).slice(0, 110),
                    desc: String(r.snippet || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220),
                    source: 'Википедия',
                    category: 'медицина',
                    url: 'https://ru.wikipedia.org/wiki/' + encodeURIComponent(r.title.replace(/ /g, '_'))
                }));
                source = 'Википедия';
            }
        } catch (e) {
            console.warn('📰 Новости: сеть недоступна, используем кэш', e);
        }

        if (items.length) {
            this.items = items;
            this.source = source;
            try {
                localStorage.setItem(this.CACHE_KEY, JSON.stringify({ items, source, updated: new Date().toLocaleTimeString('ru-RU') }));
                localStorage.setItem(this.LAST_KEY, String(Date.now()));
            } catch (e) { /* ignore */ }
        } else if (!this.items.length) {
            this.items = this.FALLBACK_ITEMS;
            this.source = 'офлайн-подборка';
        }

        const statusEl = document.getElementById('feed-status');
        if (statusEl) {
            const t = new Date().toLocaleTimeString('ru-RU');
            statusEl.textContent = '🔄 Обновлено ' + t + (this.source ? ' • ' + this.source : '');
        }
        if (typeof showTempMessage === 'function' && this.items.length) {
            showTempMessage('📰 Новости обновлены: ' + this.items.length + ' материалов');
        }
        this.render();
    },

    render: function() {
        const root = document.getElementById('feed-content');
        if (!root) return;

        const allItems = [...this.localPosts.map(p => ({...p, source: p.source || 'Invictus', category: p.category || 'сообщество'})), ...this.items];
        let cards = '';
        if (!allItems.length) {
            cards = '<div class="feed-empty">Нет материалов. Нажмите «Обновить».</div>';
        } else {
            cards = allItems.map((it, i) => `
                <div class="feed-item" onclick="feedModule.openUrl('${encodeURIComponent(JSON.stringify(it.url || ''))}')">
                    <div class="feed-item-head">
                        <span class="feed-item-source">${feedModule.esc(it.source || 'Инвиктус')}</span>
                        ${it.category ? `<span class="feed-item-cat">${feedModule.esc(it.category)}</span>` : ''}
                    </div>
                    <div class="feed-item-title">${feedModule.esc(it.title)}</div>
                    <div class="feed-item-desc">${feedModule.esc(it.desc)}</div>
                </div>
            `).join('');
        }

        root.innerHTML = `
            <div class="feed-head">
                <h1>📰 Новости</h1>
                <p>Медицинские новости и заметки сообщества — обновляются автоматически</p>
            </div>
            <div class="feed-composer">
                <textarea id="feed-post-text" maxlength=1000 placeholder="Поделитесь заметкой, вопросом или полезным материалом..."></textarea>
                <div class="feed-composer-row"><span>До 1000 символов</span><button class="feed-refresh" onclick="feedModule.createPost()">Опубликовать</button></div>
            </div>
            <div class="feed-toolbar">
                <span class="feed-status" id="feed-status">${this._lastUpdateText ? '🔄 ' + this._lastUpdateText : 'Готово к обновлению'}</span>
                <button class="feed-refresh" onclick="feedModule.loadRemote(false)">🔄 Обновить</button>
            </div>
            <div class="feed-list">${cards}</div>
        `;
    },

    createPost: function() {
        const el = document.getElementById('feed-post-text');
        const body = (el?.value || '').trim();
        if (!body) { showTempMessage('✍️ Напишите что-нибудь'); return; }
        const user = window.appData?.user || {};
        const post = { id: 'local-' + Date.now(), title: body.slice(0, 80), desc: body, body, source: user.fullname || 'Вы', category: 'сообщество', url: '', created_at: new Date().toISOString() };
        this.localPosts.unshift(post);
        try { localStorage.setItem('invictus_local_posts_v1', JSON.stringify(this.localPosts.slice(0, 100))); } catch(e) {}
        el.value = '';
        this.render();
        showTempMessage('✅ Публикация добавлена');
    },

    openUrl: function(encoded) {
        try {
            const url = JSON.parse(decodeURIComponent(encoded));
            const safe = (window.Safe && Safe.url(url, { protocols: ['https:', 'http:'] })) || '';
            if (safe && typeof window.open === 'function') window.open(safe, '_blank', 'noopener,noreferrer');
        } catch (e) { /* ignore */ }
    },

    esc: function(text) {
        return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
};

window.feedModule = feedModule;
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => feedModule.init());
}
