/* ============================================================
   Invictus v4 — 👤 ПРОФИЛЬ
   Аккаунт и настройки в одном месте.
   Режим разработчика: 3 быстрых тапа по аватару.
   ============================================================ */
const profileModule = {
    taps: 0,
    _timer: null,

    show: function() {
        const screen = document.getElementById('profile-screen');
        if (screen) screen.style.display = 'block';
        this.render();
    },

    hide: function() {
        const screen = document.getElementById('profile-screen');
        if (screen) screen.style.display = 'none';
    },

    render: function() {
        const root = document.getElementById('profile-content');
        if (!root) return;

        const user = appData?.user;
        const isGuest = Boolean(user && user.isGuest);
        const avatar = (user && user.avatar) || (typeof getRoleEmoji === 'function' ? getRoleEmoji(user) : '👤');
        const name = user && !isGuest && user.fullname ? user.fullname : 'Гость';
        const roleLine = isGuest
            ? 'Войдите, чтобы открыть личный кабинет'
            : (typeof getRoleLabel === 'function' ? getRoleLabel(user) : 'Студент');

        root.innerHTML = `
            <div class="profile-head">
                <h1 class="screen-title">👤 Профиль</h1>
            </div>

            <div class="profile-hero" onclick="profileModule.handleTap()" title="Нажмите 3 раза для режима разработчика">
                <div class="profile-avatar">${avatar}</div>
                <div class="profile-hero-info">
                    <div class="profile-name">${Safe.esc(name)}</div>
                    <div class="profile-role-line">${Safe.esc(roleLine)}</div>
                </div>
                <span class="profile-dev-hint">⚙️</span>
            </div>
            <div class="profile-dev-caption">3 тапа по карточке — режим разработчика</div>

            <div class="tg-section-title">Аккаунт</div>
            <div class="tg-menu">
                ${isGuest ? `
                <div class="tg-item" onclick="profileModule.login()">
                    <span class="tg-icon">🔐</span>
                    <span class="tg-label">Вход / Регистрация</span>
                    <span class="tg-arrow">›</span>
                </div>` : `
                <div class="tg-item" onclick="navigationManager.goTo('dashboard')">
                    <span class="tg-icon">📊</span>
                    <span class="tg-label">Личный кабинет</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="profileModule.editProfile()">
                    <span class="tg-icon">✏️</span>
                    <span class="tg-label">Изменить профиль</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="navigationManager.goTo('notes')">
                    <span class="tg-icon">📝</span>
                    <span class="tg-label">Мои конспекты</span>
                    <span class="tg-arrow">›</span>
                </div>`}
            </div>

            <div class="tg-section-title">Настройки</div>
            <div class="tg-menu">
                <div class="tg-item" onclick="profileModule.openPreferences()">
                    <span class="tg-icon">🎨</span>
                    <span class="tg-label">Язык, тема и уведомления</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="settingsModule.clearCache()">
                    <span class="tg-icon">🧹</span>
                    <span class="tg-label">Очистить кэш</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="settingsModule.showAbout()">
                    <span class="tg-icon">ℹ️</span>
                    <span class="tg-label">О приложении</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="profileModule.openHelp()">
                    <span class="tg-icon">❓</span>
                    <span class="tg-label">Справка и ЧаВО</span>
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

    login: function() {
        if (typeof settingsModule !== 'undefined' && typeof settingsModule.showAuthModal === 'function') {
            settingsModule.showAuthModal();
        }
    },

    openPreferences: function() {
        this.openPanel(() => preferencesModule.show());
    },

    openHelp: function() {
        this.openPanel(() => helpModule.show());
    },

    editProfile: function() {
        this.openPanel(() => profileSubmodule.show());
    },

    openPanel: function(render) {
        if (typeof settingsModule !== 'undefined' && typeof settingsModule.openPanel === 'function') {
            settingsModule.openPanel(render);
        }
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
