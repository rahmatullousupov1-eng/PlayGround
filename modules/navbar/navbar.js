// Navigation Manager
const navigationManager = {
    currentScreen: 'home',
    history: ['home'],
    gestureState: {
        startX: 0,
        startY: 0,
        active: false
    },
    
    init: function() {
        console.log('✓ Navigation Manager Initialized');
        this.setupSwipeBack();
    },
    
    goTo: function(screen, options = {}) {
        const targetScreen = screen || 'home';
        const skipHistory = Boolean(options.skipHistory);
        const navToken = (this._navToken = (this._navToken || 0) + 1);
        let resolvedScreen = targetScreen;

        try {
            this.hideAllScreens();
        
        switch(targetScreen) {
            case 'home':
                homeModule.show();
                break;
            case 'info':
                if (typeof infoModule !== 'undefined') infoModule.show();
                break;
            case 'profile':
                if (typeof profileModule !== 'undefined') profileModule.show();
                break;
            case 'notes':
                if (typeof notesModule !== 'undefined') notesModule.show();
                break;
            case 'subjects':
                subjectsModule.show();
                break;
            case 'search':
                const searchScreen = document.getElementById('search-screen');
                if (searchScreen) searchScreen.style.display = 'block';
                const searchInput = document.getElementById('search-input');
                if (searchInput) setTimeout(() => searchInput.focus(), 100);
                break;
            case 'videos':
                if (typeof videosModule !== 'undefined') videosModule.show();
                break;
            case 'tests':
                testsModule.show();
                break;
            case 'crossword':
                crosswordModule.show();
                break;
            case 'glossary':
                glossaryModule.show();
                break;
            case 'media3d':
                if (typeof media3dUI !== 'undefined') {
                    const media3dScreen = document.getElementById('media3d-screen');
                    if (media3dScreen) {
                        media3dScreen.style.display = 'block';
                        media3dUI.render();
                    }
                }
                break;
            case 'feed':
                if (typeof feedModule !== 'undefined') feedModule.show();
                break;
            case 'medical':
                if (typeof medicalModule !== 'undefined') medicalModule.show();
                break;
            case 'progress':
                progressModule.show();
                break;
            case 'scoring':
                if (typeof scoringUI !== 'undefined') {
                    const scoringScreen = document.getElementById('scoring-screen');
                    if (scoringScreen) {
                        scoringScreen.style.display = 'block';
                        const content = document.getElementById('scoring-content');
                        if (content && !content.innerHTML.includes('scoring-header')) {
                            content.innerHTML = `
                                <div class="scoring-header">
                                    <h1>🏆 СИСТЕМА РЕЙТИНГА</h1>
                                    <p>Отслеживайте ваш прогресс и сравнивайте результаты с другими студентами</p>
                                </div>

                                <div class="scoring-tabs">
                                    <button class="tab-button active" onclick="scoringUI.switchTab('global')">⭐ Глобальный рейтинг</button>
                                    <button class="tab-button" onclick="scoringUI.switchTab('subjects')">📖 Рейтинг по предметам</button>
                                </div>

                                <div class="scoring-content">
                                    <div id="tab-global" class="tab-content active"><div id="global-rating-container"></div></div>
                                    <div id="tab-subjects" class="tab-content">
                                        <div id="subjects-rating-container"></div>
                                    </div>
                                </div>

                                <button class="back-btn" onclick="navigationManager.goBack()">← Назад</button>
                            `;
                            scoringUI.loadScoring();
                        }
                    }
                }
                break;
            case 'settings':
                settingsModule.show();
                break;
            case 'dashboard':
                if (typeof dashboardModule !== 'undefined') {
                    dashboardModule.show();
                }
                break;
            default:
                if (typeof customScreenManager !== 'undefined' && customScreenManager.hasScreen(targetScreen)) {
                    customScreenManager.show(targetScreen);
                    break;
                }
                resolvedScreen = 'home';
                homeModule.show();
                break;
        }
        } catch (error) {
            console.error('Navigation error:', error);
            if (typeof showTempMessage === 'function') {
                showTempMessage('⚠️ Не удалось открыть экран, возвращаем на главную');
            }
            this.hideAllScreens();
            if (typeof homeModule !== 'undefined' && typeof homeModule.show === 'function') {
                homeModule.show();
            }
            resolvedScreen = 'home';
        }

        // Вложенный переход (например, progress → dashboard) уже обновил состояние.
        if (navToken !== this._navToken) return;

        this.currentScreen = resolvedScreen;
        if (!skipHistory && this.history[this.history.length - 1] !== resolvedScreen) {
            this.history.push(resolvedScreen);
        }
        this.updateBottomNav();
    },
    
    goBack: function() {
        if (this.history.length > 1) {
            this.history.pop();
            const prevScreen = this.history[this.history.length - 1];
            this.goTo(prevScreen, { skipHistory: true });
        } else {
            this.goTo('home', { skipHistory: true });
        }
    },
    
    hideAllScreens: function() {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.style.display = 'none';

        const dashboardScreen = document.getElementById('dashboard-screen');
        if (dashboardScreen) dashboardScreen.style.display = 'none';

        const customScreen = document.getElementById('custom-screen-container');
        if (customScreen) customScreen.style.display = 'none';

        homeModule.hide();
        if (typeof infoModule !== 'undefined') infoModule.hide();
        if (typeof profileModule !== 'undefined') profileModule.hide();
        if (typeof notesModule !== 'undefined') notesModule.hide();
        subjectsModule.hide();
        testsModule.hide();
        crosswordModule.hide();
        glossaryModule.hide();
        progressModule.hide();
        settingsModule.hide();
        if (typeof videosModule !== 'undefined') videosModule.hide();
        
        // Скрыть scoring экран
        const scoringScreen = document.getElementById('scoring-screen');
        if (scoringScreen) scoringScreen.style.display = 'none';
        
        const searchScreen = document.getElementById('search-screen');
        if (searchScreen) searchScreen.style.display = 'none';

        const feedScreen = document.getElementById('feed-screen');
        if (feedScreen) feedScreen.style.display = 'none';

        const medicalScreen = document.getElementById('medical-screen');
        if (medicalScreen) medicalScreen.style.display = 'none';

        const media3dScreen = document.getElementById('media3d-screen');
        if (media3dScreen) media3dScreen.style.display = 'none';
    },
    
    updateBottomNav: function() {
        // Обновляем активную кнопку нижней навигации
        const buttons = document.querySelectorAll('.bottom-nav-btn');
        buttons.forEach(btn => {
            const screen = btn.getAttribute('data-screen');
            if (screen === this.currentScreen) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    setupSwipeBack: function() {
        if (this._swipeInstalled) return;
        this._swipeInstalled = true;

        document.addEventListener('touchstart', (event) => {
            const touch = event.touches && event.touches[0];
            if (!touch) return;
            this.gestureState.startX = touch.clientX;
            this.gestureState.startY = touch.clientY;
            this.gestureState.active = touch.clientX < 28;
        }, { passive: true });

        document.addEventListener('touchend', (event) => {
            if (!this.gestureState.active) return;
            const touch = event.changedTouches && event.changedTouches[0];
            if (!touch) return;

            const dx = touch.clientX - this.gestureState.startX;
            const dy = Math.abs(touch.clientY - this.gestureState.startY);

            this.gestureState.active = false;

            if (dx > 80 && dy < 60 && this.currentScreen !== 'home') {
                this.goBack();
            }
        }, { passive: true });
    }
};

// Profile Manager
const profileManager = {
    // Инициализация (если нужна)
    init: function(appData) {
        this.appData = appData;
    },

    // Метод, который вызывается при клике на иконку в шапке — переключает состояние
    toggle: function() {
        const drawer = document.getElementById('profile-drawer');
        if (drawer && drawer.classList.contains('open')) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    },

    // Открыть шторку
    openDrawer: function() {
        const drawer = document.getElementById('profile-drawer');
        const overlay = document.getElementById('profile-overlay');
        const userInfoContainer = document.getElementById('drawer-user-info');
        
        // Заполняем данными перед открытием
        if (this.appData && this.appData.user) {
            const u = this.appData.user;
            const roleLabel = typeof getRoleLabel === 'function'
                ? getRoleLabel(u)
                : (u.role === 'teacher' ? 'Преподаватель' : 'Студент');
            userInfoContainer.innerHTML = `
                <div class="drawer-avatar">${u.avatar || '👤'}</div>
                <span class="drawer-username">${Safe.esc(u.fullname || 'Студент')}</span>
                <span class="drawer-role">${roleLabel}</span>
            `;
        }

        const menu = document.getElementById('drawer-menu');
        if (menu && this.appData && this.appData.user) {
            const isGuest = Boolean(this.appData.user.isGuest);
            const isOwner = this.appData.user.role === 'owner';
            const isTeacher = this.appData.user.role === 'teacher';
            menu.innerHTML = isGuest ? `
                <button class="drawer-item" onclick="profileManager.close(); navigationManager.goTo('settings')">🔐 Войти или зарегистрироваться</button>
                <button class="drawer-item" onclick="profileManager.close(); navigationManager.goTo('search')">🔍 Поиск</button>
            ` : `
                <button class="drawer-item" onclick="profileManager.close(); navigationManager.goTo('dashboard')">📊 Личный кабинет</button>
                <button class="drawer-item" onclick="profileManager.close(); navigationManager.goTo('search')">🔍 Поиск</button>
                <button class="drawer-item" onclick="profileManager.close(); navigationManager.goTo('settings')">⚙️ Настройки</button>
                <button class="drawer-item logout" onclick="profileManager.close(); performLogout()">🚪 Выйти</button>
            `;
        }

        // Добавляем классы для анимации
        drawer.classList.add('open');
        overlay.classList.add('active');
    },

    // Закрыть шторку
    closeDrawer: function() {
        document.getElementById('profile-drawer').classList.remove('open');
        document.getElementById('profile-overlay').classList.remove('active');
    },
    
    // Закрыть модальное окно (регистрация, профиль и т.д.)
    close: function() {
        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.closeDrawer();
    }
};
