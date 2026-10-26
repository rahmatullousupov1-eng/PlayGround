/* ============================================================
   Invictus v4 — 💡 ИНФОРМАЦИЯ
   Telegram-style: выбор роли → раскрывающиеся подразделы
   ============================================================ */
const infoModule = {
    openRole: null,

    MENU: {
        student: [
            { icon: '📚', title: 'Предметы', desc: 'Все предметы и темы', screen: 'subjects' },
            { icon: '🎯', title: 'Интерактивные тесты', desc: 'Проверка знаний после тем', screen: 'tests' },
            { icon: '📊', title: 'Прогресс', desc: 'Ваша статистика обучения', screen: 'progress' },
            { icon: '📖', title: 'Глоссарий', desc: 'Термины и определения', screen: 'glossary' },
            { icon: '🧩', title: 'Кроссворд', desc: 'Тренировка памяти', screen: 'crossword' }
        ],
        doctor: [
            { icon: '🩺', title: 'Клинические случаи', desc: 'Разборы реальных ситуаций', screen: 'medical' },
            { icon: '📰', title: 'Лента новостей', desc: 'Свежие материалы из интернета', screen: 'feed' },
            { icon: '📖', title: 'Словарь врача', desc: 'Термины и определения', screen: 'glossary' },
            { icon: '📡', title: 'Каналы и источники', desc: 'Рекомендации и базы', screen: 'medical' }
        ],
        guest: [
            { icon: '👀', title: 'Обзор платформы', desc: 'Что есть в Invictus', screen: 'home' },
            { icon: '📰', title: 'Лента новостей', desc: 'Медицина из открытых источников', screen: 'feed' },
            { icon: '🔍', title: 'Поиск', desc: 'Поиск по базе знаний', screen: 'search' }
        ]
    },

    ROLES: {
        student: { title: 'Студент', icon: '🎓', desc: 'Учёба: предметы, тесты, прогресс, глоссарий' },
        doctor: { title: 'Врач', icon: '🩺', desc: 'Практика: случаи, лента, словарь, каналы' },
        guest: { title: 'Без выбора', icon: '👤', desc: 'Обзор без личного профиля' }
    },

    show: function() {
        const screen = document.getElementById('info-screen');
        if (screen) screen.style.display = 'block';
        this.render();
    },

    hide: function() {
        const screen = document.getElementById('info-screen');
        if (screen) screen.style.display = 'none';
    },

    getCurrentRole: function() {
        if (typeof homeModule !== 'undefined' && typeof homeModule.getCurrentRole === 'function') {
            return homeModule.getCurrentRole();
        }
        return 'student';
    },

    setRole: function(role) {
        if (typeof homeModule !== 'undefined' && typeof homeModule.setRole === 'function') {
            homeModule.setRole(role);
        }
        this.openRole = role;
        this.render();
    },

    toggleRole: function(role) {
        this.openRole = this.openRole === role ? null : role;
        this.render();
    },

    render: function() {
        const root = document.getElementById('info-content');
        if (!root) return;

        const current = this.getCurrentRole();
        let rolesHtml = Object.keys(this.ROLES).map(key => {
            const r = this.ROLES[key];
            const active = current === key;
            const open = this.openRole === key;
            const items = open ? this.MENU[key].map(item => `
                <div class="info-subitem" onclick="navigationManager.goTo('${item.screen}')">
                    <div class="info-subitem-icon">${item.icon}</div>
                    <div class="info-subitem-text">
                        <div class="info-subitem-title">${item.title}</div>
                        <div class="info-subitem-desc">${item.desc}</div>
                    </div>
                    <span class="info-arrow">›</span>
                </div>
            `).join('') : '';

            return `
                <div class="info-role ${open ? 'info-role-open' : ''}">
                    <div class="info-role-head" onclick="infoModule.toggleRole('${key}')">
                        <span class="info-role-icon">${r.icon}</span>
                        <div class="info-role-text">
                            <div class="info-role-title">${r.title}</div>
                            <div class="info-role-desc">${r.desc}</div>
                        </div>
                        <span class="info-role-chevron">${open ? '▴' : '▾'}</span>
                    </div>
                    <div class="info-subitems" ${open ? '' : 'style="display:none"'}>
                        ${items}
                    </div>
                </div>
            `;
        }).join('');

        root.innerHTML = `
            <div class="info-head">
                <h1 class="screen-title">💡 Информация</h1>
                <p class="info-subtitle">Выберите роль — под ней раскроются нужные разделы, как в Telegram</p>
            </div>

            <div class="info-role-current">
                <span>Текущая роль:</span>
                <strong>${this.ROLES[current].icon} ${this.ROLES[current].title}</strong>
            </div>

            <div class="info-roles">${rolesHtml}</div>
        `;
    }
};

window.infoModule = infoModule;
