/* ============================================================
   Invictus v4 — 👤 ПРОФИЛЬ (отдельная вкладка)
   Режим разработчика: 3 быстрых тапа по аватару
   ============================================================ */
const profileModule = {
    taps: 0,
    _timer: null,

    ROLES: {
        student: { title: 'Студент', icon: '🎓' },
        doctor: { title: 'Врач', icon: '🩺' },
        guest: { title: 'Гость', icon: '👤' }
    },

    show: function() {
        const screen = document.getElementById('profile-screen');
        if (screen) screen.style.display = 'block';
        this.render();
    },

    hide: function() {
        const screen = document.getElementById('profile-screen');
        if (screen) screen.style.display = 'none';
    },

    getCurrentRole: function() {
        if (typeof homeModule !== 'undefined' && typeof homeModule.getCurrentRole === 'function') {
            return homeModule.getCurrentRole();
        }
        return 'student';
    },

    render: function() {
        const root = document.getElementById('profile-content');
        if (!root) return;

        const user = appData?.user;
        const isGuest = Boolean(user && user.isGuest);
        const role = this.getCurrentRole();
        const roleMeta = this.ROLES[role] || this.ROLES.student;
        const avatar = (user && user.avatar) || roleMeta.icon;
        const name = user && !isGuest && user.fullname ? user.fullname : 'Гость';
        const roleLine = isGuest
            ? 'Войдите, чтобы открыть личный кабинет'
            : roleMeta.title;

        const roleChips = Object.keys(this.ROLES).map(key => `
            <button class="profile-role-chip ${role === key ? 'active' : ''}" onclick="profileModule.setRole('${key}')">
                ${this.ROLES[key].icon} ${this.ROLES[key].title}
            </button>
        `).join('');

        root.innerHTML = `
            <div class="profile-head">
                <h1 class="screen-title">👤 Профиль</h1>
            </div>

            <div class="profile-hero" onclick="profileModule.handleTap()" title="Нажмите 3 раза для режима разработчика">
                <div class="profile-avatar">${avatar}</div>
                <div class="profile-hero-info">
                    <div class="profile-name">${name}</div>
                    <div class="profile-role-line">${roleLine}</div>
                </div>
                <span class="profile-dev-hint">⚙️</span>
            </div>
            <div class="profile-dev-caption">3 тапа по карточке — режим разработчика</div>

            <div class="tg-section-title">Роль</div>
            <div class="profile-role-chips">${roleChips}</div>

            <div class="tg-section-title">Аккаунт</div>
            <div class="tg-menu">
                ${isGuest ? `
                <div class="tg-item" onclick="navigationManager.goTo('settings')">
                    <span class="tg-icon">🔐</span>
                    <span class="tg-label">Вход / Регистрация</span>
                    <span class="tg-arrow">›</span>
                </div>` : `
                <div class="tg-item" onclick="navigationManager.goTo('dashboard')">
                    <span class="tg-icon">📊</span>
                    <span class="tg-label">Личный кабинет</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="navigationManager.goTo('settings')">
                    <span class="tg-icon">✏️</span>
                    <span class="tg-label">Изменить профиль</span>
                    <span class="tg-arrow">›</span>
                </div>`}
            </div>

            <div class="tg-section-title">Система</div>
            <div class="tg-menu">
                <div class="tg-item" onclick="navigationManager.goTo('notes')">
                    <span class="tg-icon">📝</span>
                    <span class="tg-label">Мои конспекты</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="navigationManager.goTo('settings')">
                    <span class="tg-icon">⚙️</span>
                    <span class="tg-label">Настройки приложения</span>
                    <span class="tg-arrow">›</span>
                </div>
                ${!isGuest ? `
                <div class="tg-item tg-danger" onclick="profileModule.logout()">
                    <span class="tg-icon">🚪</span>
                    <span class="tg-label">Выйти</span>
                    <span class="tg-arrow">›</span>
                </div>` : ''}
            </div>
        `;
    },

    setRole: function(role) {
        if (typeof homeModule !== 'undefined' && typeof homeModule.setRole === 'function') {
            homeModule.setRole(role);
        }
        this.render();
    },

    logout: function() {
        if (confirm('Вы уверены, что хотите выйти из профиля?')) {
            if (typeof performLogout === 'function') {
                performLogout();
            } else if (typeof enterGuestMode === 'function') {
                enterGuestMode();
            }
            if (typeof showTempMessage === 'function') showTempMessage('✅ Вы вышли из профиля');
            navigationManager.goTo('home');
        }
    },

    handleTap: function() {
        this.taps++;
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => { this.taps = 0; }, 1500);
        if (this.taps >= 3) {
            this.taps = 0;
            if (typeof devOptions !== 'undefined' && typeof devOptions.open === 'function') {
                devOptions.open();
            }
        }
    }
};

window.profileModule = profileModule;
