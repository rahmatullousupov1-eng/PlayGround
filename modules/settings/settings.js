// Settings Module Manager
const settingsModule = {
    init: function() {
        // Initialize submodules (preferences is now initialized early in app.js)
        if (typeof profileSubmodule !== 'undefined') profileSubmodule.init();
        // Skip preferencesModule.init() as it's already been called in app.js
        if (typeof helpModule !== 'undefined') helpModule.init();
        console.log('✓ Settings Module Initialized (with submodules)');
    },
    
    show: function() {
        const screen = document.getElementById('settings-screen');
        if (!this._panelMode) {
            if (typeof navigationManager !== 'undefined') {
                navigationManager.goTo('profile');
            }
            return;
        }
        this._panelMode = false;
        if (screen) screen.style.display = 'block';
    },

    openPanel: function(render) {
        this._panelMode = true;
        try {
            render();
        } catch (error) {
            this._panelMode = false;
            throw error;
        }
        if (typeof navigationManager !== 'undefined') {
            navigationManager.goTo('settings');
        }
    },
    
    hide: function() {
        const screen = document.getElementById('settings-screen');
        if (screen) {
            screen.style.display = 'none';
        }
        if (typeof developerMode !== 'undefined' && typeof developerMode.resetVersionTapState === 'function') {
            developerMode.resetVersionTapState();
        }
    },
    
    renderSettings: function() {
        const content = document.getElementById('settings-content');
        if (!content) return;

        const isGuest = Boolean(appData.user && appData.user.isGuest);
        const roleLabel = typeof getRoleLabel === 'function' ? getRoleLabel(appData.user) : 'Студент';
        const roleIcon = typeof getRoleEmoji === 'function' ? getRoleEmoji(appData.user) : '🎓';

        let html = `
            <div class="tg-settings">
                <div class="tg-profile-card">
                    <div class="tg-avatar">${appData.user && appData.user.avatar ? appData.user.avatar : roleIcon}</div>
                    <div class="tg-profile-info">
                        <div class="tg-name">${appData.user ? Safe.esc(appData.user.fullname) : 'Гость'}</div>
                        <div class="tg-status">${isGuest ? 'Войдите, чтобы открылся личный кабинет' : roleLabel}</div>
                    </div>
                </div>
        `;

        // АККАУНТ
        html += `<div class="tg-section-title">Аккаунт</div><div class="tg-menu">`;
        if (!isGuest) {
            html += `
                <div class="tg-item" onclick="navigationManager.goTo('dashboard')">
                    <span class="tg-icon">📊</span>
                    <span class="tg-label">Личный кабинет</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="profileSubmodule.show()">
                    <span class="tg-icon">👤</span>
                    <span class="tg-label">Мой профиль</span>
                    <span class="tg-arrow">›</span>
                </div>
            `;
        } else {
            html += `
                <div class="tg-item" onclick="settingsModule.showAuthModal()">
                    <span class="tg-icon">🔐</span>
                    <span class="tg-label">Вход / Регистрация</span>
                    <span class="tg-arrow">›</span>
                </div>
            `;
        }
        html += `</div>`;

        // НАСТРОЙКИ
        html += `<div class="tg-section-title">Настройки</div><div class="tg-menu">`;
        html += `
                <div class="tg-item" onclick="preferencesModule.show()">
                    <span class="tg-icon">🌐</span>
                    <span class="tg-label">Язык и интерфейс</span>
                    <span class="tg-arrow">›</span>
                </div>
                <div class="tg-item" onclick="preferencesModule.show()">
                    <span class="tg-icon">🔔</span>
                    <span class="tg-label">Уведомления и тема</span>
                    <span class="tg-arrow">›</span>
                </div>
        `;
        html += `</div>`;

        // СИСТЕМА
        html += `<div class="tg-section-title">Система</div><div class="tg-menu">`;
        html += `
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
        `;
        html += `</div>`;

        // ПОДДЕРЖКА
        html += `<div class="tg-section-title">Поддержка</div><div class="tg-menu">`;
        html += `
                <div class="tg-item" onclick="helpModule.show()">
                    <span class="tg-icon">❓</span>
                    <span class="tg-label">Справка и ЧаВО</span>
                    <span class="tg-arrow">›</span>
                </div>
        `;
        if (!isGuest) {
            html += `
                <div class="tg-item tg-danger" onclick="settingsModule.showLogout()">
                    <span class="tg-icon">🚪</span>
                    <span class="tg-label">Выход</span>
                    <span class="tg-arrow">›</span>
                </div>
            `;
        }
        html += `</div>`;

        html += `</div>`;

        content.innerHTML = html;
    },

    // Очистить кэш (лента + служебные данные)
    clearCache: function() {
        try {
            localStorage.removeItem('invictus_feed_cache_v1');
            localStorage.removeItem('invictus_feed_last_update');
        } catch (e) { /* ignore */ }
        if ('caches' in window) {
            try {
                caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
            } catch (e) { /* ignore */ }
        }
        if (typeof showTempMessage === 'function') showTempMessage('🧹 Кэш очищен');
    },

    // О приложении
    showAbout: function() {
        const version = '4.0';
        const msg = 'Invictus ' + version + '\nМедицинское образование для студентов и врачей\n\nРазработка: Invictus';
        if (typeof alert === 'function') alert(msg);
    },

    // Показать форму регистрации/входа
    showAuthModal: function() {
        if (typeof window.showAuthModal === 'function') {
            window.showAuthModal();
            return;
        }

        if (typeof showRegistrationModal === 'function') {
            showRegistrationModal();
        }
    },
    
    // Выход из профиля (logout)
    showLogout: function() {
        if (confirm('Вы уверены, что хотите выйти из профиля?')) {
            if (typeof enterGuestMode === 'function') enterGuestMode();
            
            showTempMessage('✅ Вы вышли из профиля');
            profileManager.close();
            this.renderSettings();
            navigationManager.goTo('home');
        }
    }
};
