// Home Module Manager (v3.0)
// Роль = фильтр, а не замок: Студент / Врач / Гость можно переключать свободно.
const homeModule = {
    favorites: [],
    sortAZ: false,

    ROLE_KEY: 'invictus_role_filter',

    init: function() {
        this.loadFavorites();
    },

    ROLES: {
        student: { title: 'Студент', icon: '🎓', desc: 'Медицина, тесты, прогресс и материалы для учёбы' },
        doctor: { title: 'Врач', icon: '🩺', desc: 'Клинические случаи, словарь и лента новостей' },
        guest: { title: 'Без выбора', icon: '👤', desc: 'Обзор платформы без личного профиля' }
    },

    getCurrentRole: function() {
        try {
            const saved = localStorage.getItem(this.ROLE_KEY);
            if (saved && this.ROLES[saved]) return saved;
        } catch (e) { /* ignore */ }
        if (appData?.user?.isGuest) return 'guest';
        if (appData?.user?.role === 'doctor') return 'doctor';
        return 'student';
    },

    setRole: function(role) {
        if (!this.ROLES[role]) return;
        try { localStorage.setItem(this.ROLE_KEY, role); } catch (e) { /* ignore */ }
        const label = this.ROLES[role].title;
        if (typeof showTempMessage === 'function') showTempMessage(`✅ Роль: ${label}`);
        this.renderPortal();
        this.renderDashboard();
        this.renderFeaturesGrid();
        if (typeof settingsModule !== 'undefined' && typeof settingsModule.renderSettings === 'function'
            && navigationManager?.currentScreen === 'settings') {
            settingsModule.renderSettings();
        }
    },

    getFeatureDefinitions: function() {
        return [
            { key: 'feed', title: 'Лента новостей', desc: 'Свежие медицинские материалы из интернета', icon: '📰', screen: 'feed', search: 'лента новости свежие материалы интернет' },
            { key: 'medical', title: 'Медицина', desc: 'Клинические случаи, словарь и полезные каналы', icon: '🩺', screen: 'medical', search: 'случаи клиника врачи словарь каналы' },
            { key: 'glossary', title: 'Глоссарий', desc: 'Словарь узкоспециализированных терминов', icon: '📖', screen: 'glossary', search: 'глоссарий термины определения' },
            { key: 'crossword', title: 'Кроссворд', desc: 'Увеличение словарного запаса', icon: '🧩', screen: 'crossword', search: 'кроссворд термины тренировка' },
            { key: 'tests', title: 'Интерактивные тесты', desc: 'Проверяйте знания после каждой темы', icon: '🎯', screen: 'tests', search: 'тесты проверка знания' },
            { key: 'progress', title: 'Отслеживание прогресса', desc: 'Наблюдайте за своим развитием', icon: '📊', screen: 'progress', search: 'прогресс рейтинг статистика' },
            { key: 'media3d', title: '3D / 2D материалы', desc: 'Наглядные модели и визуализации', icon: '🧬', screen: 'media3d', search: '3d 2d модели визуализация атлас' },
            { key: 'videos', title: 'Видеоматериалы', desc: 'Обучающие видео по предметам', icon: '🎬', screen: 'videos', search: 'видео ролики лекции' },
            { key: 'search', title: 'Поиск по базе знаний', desc: 'Быстрый поиск по материалам и данным', icon: '🔎', screen: 'search', search: 'поиск база знаний файлы материалы' },
            { key: 'settings', title: 'Настройки', desc: 'Язык, тема, кэш и информация о приложении', icon: '⚙️', screen: 'settings', search: 'настройки профиль параметры язык тема кэш' }
        ];
    },

    getVisibleFeatureKeys: function() {
        // Роль — фильтр: все основные функции доступны каждому.
        return this.getFeatureDefinitions().map(def => def.key);
    },

    getQuickActions: function() {
        const role = this.getCurrentRole();
        if (role === 'doctor') {
            return [
                { label: '🩺 Случаи', screen: 'medical' },
                { label: '📰 Лента', screen: 'feed' },
                { label: '📖 Словарь', screen: 'glossary' },
                { label: '⚙️ Настройки', screen: 'settings' }
            ];
        }
        return [
            { label: '📰 Лента', screen: 'feed' },
            { label: '🩺 Медицина', screen: 'medical' },
            { label: '🎯 Тесты', screen: 'tests' },
            { label: '📊 Прогресс', screen: 'progress' }
        ];
    },

    // Приветствие в новом дизайне главной
    renderGreeting: function() {
        const nameEl = document.getElementById('home-greet-name');
        const avatarEl = document.getElementById('home-greet-avatar');
        const chipEl = document.getElementById('home-role-chip');
        if (!nameEl) return;

        const user = appData?.user;
        const role = this.getCurrentRole();
        const roleMeta = this.ROLES[role] || this.ROLES.student;
        const displayName = user && !user.isGuest && user.fullname ? user.fullname : 'Пользователь';

        if (nameEl) nameEl.textContent = displayName;
        if (avatarEl) avatarEl.textContent = (user && user.avatar) || roleMeta.icon;
        if (chipEl) chipEl.textContent = roleMeta.icon + ' ' + roleMeta.title + ' ▾';
    },

    // Информационный блок + карточки выбора роли
    renderPortal: function() {
        const portal = document.getElementById('home-role-portal');
        if (!portal) return;

        const role = this.getCurrentRole();
        let cards = '';
        Object.keys(this.ROLES).forEach(key => {
            const r = this.ROLES[key];
            cards += `
                <div class="role-card ${role === key ? 'active' : ''}" onclick="homeModule.setRole('${key}')" data-role="${key}">
                    <div class="role-card-icon">${r.icon}</div>
                    <div class="role-card-title">${r.title}</div>
                    <div class="role-card-desc">${r.desc}</div>
                    ${role === key ? '<div class="role-card-check">✓ Сейчас</div>' : '<div class="role-card-check role-card-check-empty">Выбрать</div>'}
                </div>
            `;
        });

        portal.innerHTML = `
            <div class="role-portal-head">
                <h2>👥 Кто вы?</h2>
                <p>Роль можно менять в любой момент — она лишь подстраивает ленту и карточки под вас</p>
            </div>
            <div class="role-cards">${cards}</div>
        `;
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
        el.innerHTML = `
            <button class="home-quick-btn knowledge-home-entry" data-invictus-learning-entry="true" onclick="navigationManager.goTo('subjects')" title="Предмет → тема">
                <span class="knowledge-home-entry-title">🩺 <b>Обучение</b></span>
                <small>Предмет → тема</small>
            </button>
        ` + actions.map(a =>
            `<button class="home-quick-btn" onclick="navigationManager.goTo('${a.screen}')">${a.label}</button>`
        ).join('');
    },

    renderFeaturesGrid: function() {
        const container = document.getElementById('features-grid');
        if (!container) return;

        const defs = this.getFeatureDefinitions();
        container.innerHTML = defs.map(def => `
            <div class="feature-card" onclick="navigationManager.goTo('${def.screen}')" data-feature="${def.key}" data-search="${def.search}">
                <div class="feature-card-header">
                    <div class="feature-icon">${def.icon}</div>
                    <button class="feature-fav-btn" onclick="event.stopPropagation(); homeModule.toggleFavorite(this)">☆</button>
                </div>
                <div class="feature-title">${def.title}</div>
                <div class="feature-desc">${def.desc}</div>
            </div>
        `).join('');
        this.syncFeatureButtons();
    },

    renderDashboard: function() {
        this.renderGreeting();
        this.renderPortal();
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
        } else {
            this.favorites.push(key);
            btn.classList.add('favorited');
            btn.textContent = '★';
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
        });
    },

    hide: function() {
        this.resetHiddenEntry();
        const screen = document.getElementById('home-screen');
        if (screen) screen.style.display = 'none';
    }
};
