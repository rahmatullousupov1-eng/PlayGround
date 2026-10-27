// Home Module Manager (v3.0)
const homeModule = {
    favorites: [],
    sortAZ: false,

    init: function() {
        try { localStorage.removeItem('invictus_role_filter'); } catch (e) { /* ignore */ }
        this.loadFavorites();
    },

    getFeatureDefinitions: function() {
        return [
            { key: 'feed', title: 'Новости', desc: 'Медицинские новости и заметки сообщества', icon: '📰', screen: 'feed', search: 'новости лента свежие материалы интернет' },
            { key: 'medical', title: 'Практика', desc: 'Клинические случаи, словарь и профессиональные ресурсы', icon: '🩺', screen: 'medical', search: 'практика случаи клиника врачи словарь каналы' },
            { key: 'glossary', title: 'Глоссарий', desc: 'Словарь узкоспециализированных терминов', icon: '📖', screen: 'glossary', search: 'глоссарий термины определения' },
            { key: 'crossword', title: 'Кроссворд', desc: 'Увеличение словарного запаса', icon: '🧩', screen: 'crossword', search: 'кроссворд термины тренировка' },
            { key: 'tests', title: 'Интерактивные тесты', desc: 'Проверяйте знания после каждой темы', icon: '🎯', screen: 'tests', search: 'тесты проверка знания' },
            { key: 'progress', title: 'Отслеживание прогресса', desc: 'Наблюдайте за своим развитием', icon: '📊', screen: 'progress', search: 'прогресс рейтинг статистика' },
            { key: 'media3d', title: '3D / 2D материалы', desc: 'Наглядные модели и визуализации', icon: '🧬', screen: 'media3d', search: '3d 2d модели визуализация атлас' },
            { key: 'videos', title: 'Видеоматериалы', desc: 'Обучающие видео по предметам', icon: '🎬', screen: 'videos', search: 'видео ролики лекции' },
            { key: 'search', title: 'Поиск по базе знаний', desc: 'Быстрый поиск по материалам и данным', icon: '🔎', screen: 'search', search: 'поиск база знаний файлы материалы' }
        ];
    },

    getVisibleFeatureKeys: function() {
        return this.getFeatureDefinitions().map(def => def.key);
    },

    getQuickActions: function() {
        return [
            { label: '🩺 Обучение', screen: 'subjects', hint: 'Предмет → тема' },
            { label: '📰 Новости', screen: 'feed' },
            { label: '🩺 Практика', screen: 'medical' },
            { label: '🎯 Тесты', screen: 'tests' },
            { label: '📊 Прогресс', screen: 'progress' }
        ];
    },

    // Приветствие в новом дизайне главной
    renderGreeting: function() {
        const nameEl = document.getElementById('home-greet-name');
        const avatarEl = document.getElementById('home-greet-avatar');
        if (!nameEl) return;

        const user = appData?.user;
        const roleIcon = typeof getRoleEmoji === 'function' ? getRoleEmoji(user) : '👤';
        const displayName = user && !user.isGuest && user.fullname ? user.fullname : 'Пользователь';

        if (nameEl) nameEl.textContent = displayName;
        if (avatarEl) avatarEl.textContent = (user && user.avatar) || roleIcon;
    },

    renderMetrics: function() {
        const strip = document.getElementById('home-metrics');
        if (!strip) return;

        let subjectCount = 0;
        let testCount = 0;
        try {
            subjectCount = Object.keys(appData?.subjects || {}).length;
        } catch (e) { /* ignore */ }
        try {
            const allTests = appData?.tests || [];
            testCount = Array.isArray(allTests) ? allTests.length : 0;
            if (!testCount && Array.isArray(appData?.testCategories)) {
                testCount = appData.testCategories.reduce((sum, cat) => sum + (cat.tests?.length || 0), 0);
            }
        } catch (e) { /* ignore */ }

        strip.innerHTML = `
            <div class="home-metric-card">
                <span class="metric-label">Предметов</span>
                <strong>${subjectCount || '15+'}📚</strong>
            </div>
            <div class="home-metric-card">
                <span class="metric-label">Тестов</span>
                <strong>${testCount || '30+'}🎯</strong>
            </div>
            <div class="home-metric-card">
                <span class="metric-label">Избранное</span>
                <strong>${this.favorites.length}⭐</strong>
            </div>
        `;
    },

    renderQuickActions: function() {
        const el = document.getElementById('home-quick-actions');
        if (!el) return;
        const actions = this.getQuickActions();
        el.innerHTML = actions.map(a => a.hint
            ? `<button class="home-quick-btn home-learning-entry" onclick="navigationManager.goTo('${a.screen}')" title="${a.hint}">
                    <span class="home-learning-entry-title">${a.label}</span>
                    <small>${a.hint}</small>
               </button>`
            : `<button class="home-quick-btn" onclick="navigationManager.goTo('${a.screen}')">${a.label}</button>`
        ).join('');
    },

    renderFeaturesGrid: function() {
        const container = document.getElementById('features-grid');
        if (!container) return;

        const defs = this.getFeatureDefinitions();
        container.innerHTML = defs.map(def => `
            <article class="feature-card" role="button" tabindex="0" aria-label="${def.title}. ${def.desc}" data-feature="${def.key}" data-screen="${def.screen}" data-search="${def.search}" onclick="homeModule.activateFeature(event, this)" onkeydown="homeModule.activateFeature(event, this)">
                <div class="feature-card-header">
                    <div class="feature-icon" aria-hidden="true">${def.icon}</div>
                    <button type="button" class="feature-fav-btn" aria-label="Добавить в избранное" aria-pressed="false" onclick="event.stopPropagation(); homeModule.toggleFavorite(this)">☆</button>
                </div>
                <div class="feature-title">${def.title}</div>
                <div class="feature-desc">${def.desc}</div>
            </article>
        `).join('');
        this.syncFeatureButtons();
    },

    activateFeature: function(event, card) {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target.closest('.feature-fav-btn')) return;
        event.preventDefault();
        const screen = card.getAttribute('data-screen');
        if (screen) navigationManager.goTo(screen);
    },

    renderDashboard: function() {
        this.renderGreeting();
        this.renderMetrics();
        this.renderQuickActions();
        this.renderFeaturesGrid();
        this.searchFeatures();
    },

    searchFeatures: function() {
        const input = document.getElementById('home-search-input');
        const query = (input ? input.value : '').trim().toLowerCase();
        document.querySelectorAll('.feature-card').forEach(card => {
            const key = card.getAttribute('data-feature');
            if (!key) return;
            const def = this.getFeatureDefinitions().find(d => d.key === key);
            if (!def) return;
            const haystack = `${def.title} ${def.desc} ${def.search || ''}`.toLowerCase();
            card.classList.toggle('hidden', query.length > 0 && !haystack.includes(query));
        });
    },

    toggleSort: function() {
        this.sortAZ = !this.sortAZ;
        const container = document.querySelector('.features-grid');
        if (!container) return;
        const cards = Array.from(container.querySelectorAll('.feature-card'));

        if (this.sortAZ) {
            cards.sort((a, b) => {
                const titleA = a.querySelector('.feature-title').textContent;
                const titleB = b.querySelector('.feature-title').textContent;
                return titleA.localeCompare(titleB, 'ru');
            });
            if (typeof showTempMessage === 'function') showTempMessage('Сортировка: А-Я');
        } else {
            if (typeof showTempMessage === 'function') showTempMessage('Сортировка отменена');
        }

        cards.forEach(card => container.appendChild(card));

        const btn = document.querySelector('.home-sort-btn');
        if (btn) btn.classList.toggle('active', this.sortAZ);
    },

    toggleFavorite: function(btn) {
        const card = btn.closest('.feature-card');
        if (!card) return;

        const key = card.getAttribute('data-feature');
        const isFavorited = this.favorites.includes(key);

        if (isFavorited) {
            this.favorites = this.favorites.filter(item => item !== key);
            btn.classList.remove('favorited');
            btn.textContent = '☆';
            btn.setAttribute('aria-label', 'Добавить в избранное');
            btn.setAttribute('aria-pressed', 'false');
        } else {
            this.favorites.push(key);
            btn.classList.add('favorited');
            btn.textContent = '★';
            btn.setAttribute('aria-label', 'Удалить из избранного');
            btn.setAttribute('aria-pressed', 'true');
        }

        this.saveFavorites();
        this.renderMetrics();
    },

    saveFavorites: function() {
        try { localStorage.setItem('homeFavorites', JSON.stringify(this.favorites)); } catch (e) { /* ignore */ }
    },

    loadFavorites: function() {
        const saved = localStorage.getItem('homeFavorites');
        if (!saved) return;
        try {
            const parsed = JSON.parse(saved);
            const defs = this.getFeatureDefinitions();
            this.favorites = Array.isArray(parsed)
                ? parsed.map(item => {
                    const match = defs.find(def => def.key === item || def.title === item);
                    return match ? match.key : null;
                }).filter(Boolean)
                : [];
        } catch (e) {
            this.favorites = [];
        }
    },

    updateFeatureVisibility: function() {
        // Совместимость: при роли-фильтре скрывать функции не нужно.
        document.querySelectorAll('.feature-card').forEach(card => {
            card.classList.remove('role-hidden');
        });
    },

    bindHiddenEntryTargets: function() {
        // Legacy hook kept for compatibility.
    },

    resetHiddenEntry: function() {
        // Legacy hook kept for compatibility.
    },

    show: function() {
        this.bindHiddenEntryTargets();
        const screen = document.getElementById('home-screen');
        if (screen) screen.style.display = 'block';
        this.updateFeatureVisibility();
        this.syncFeatureButtons();
        this.renderDashboard();
        const searchInput = document.getElementById('home-search-input');
        if (searchInput) {
            searchInput.value = '';
            this.searchFeatures();
        }
    },

    syncFeatureButtons: function() {
        document.querySelectorAll('.feature-card').forEach(card => {
            const key = card.getAttribute('data-feature');
            const btn = card.querySelector('.feature-fav-btn');
            if (!btn || !key) return;
            const favorited = this.favorites.includes(key);
            btn.classList.toggle('favorited', favorited);
            btn.textContent = favorited ? '★' : '☆';
            btn.setAttribute('aria-label', favorited ? 'Удалить из избранного' : 'Добавить в избранное');
            btn.setAttribute('aria-pressed', favorited ? 'true' : 'false');
        });
    },

    hide: function() {
        this.resetHiddenEntry();
        const screen = document.getElementById('home-screen');
        if (screen) screen.style.display = 'none';
    }
};
