// Preferences Submodule - App settings and preferences
const preferencesModule = {
    preferences: {
        theme: 'dark',
        notifications: true,
        emailDigest: false,
        autoSave: true,
        animationsEnabled: true,
        fontSize: 'normal',
        language: 'ru'
    },
    
    // Theme color definitions
    themes: {
        dark: {
            primary: '#1a237e',
            primaryLight: '#311b92',
            accent: '#00bcd4',
            accentDark: '#0097a7',
            background: 'linear-gradient(135deg, #1a237e, #311b92)',
            surface: 'rgba(255, 255, 255, 0.08)',
            surfaceLight: 'rgba(255, 255, 255, 0.12)',
            border: 'rgba(255, 255, 255, 0.2)',
            textPrimary: '#ffffff',
            textSecondary: 'rgba(255, 255, 255, 0.7)'
        },
        light: {
            primary: '#f5f5f5',
            primaryLight: '#eeeeee',
            accent: '#0097a7',
            accentDark: '#00695c',
            background: 'linear-gradient(135deg, #ffffff, #f5f5f5)',
            surface: 'rgba(0, 0, 0, 0.08)',
            surfaceLight: 'rgba(0, 0, 0, 0.12)',
            border: 'rgba(0, 0, 0, 0.2)',
            textPrimary: '#212121',
            textSecondary: 'rgba(0, 0, 0, 0.7)'
        }
    },
    
    init: function() {
        console.log('✓ Preferences Submodule Initialized');
        // Load preferences from localStorage
        const saved = localStorage.getItem('invictusPreferences');
        if (saved) {
            this.preferences = JSON.parse(saved);
        }
        // Apply saved theme on page load
        this.applyTheme(this.preferences.theme);
    },
    
    // Apply theme to document
    applyTheme: function(themeName) {
        if (themeName === 'auto') {
            // Check system preference
            themeName = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        const themeColors = this.themes[themeName] || this.themes.dark;
        const root = document.documentElement;
        
        root.style.setProperty('--primary', themeColors.primary);
        root.style.setProperty('--primary-light', themeColors.primaryLight);
        root.style.setProperty('--accent', themeColors.accent);
        root.style.setProperty('--accent-dark', themeColors.accentDark);
        root.style.setProperty('--background', themeColors.background);
        root.style.setProperty('--surface', themeColors.surface);
        root.style.setProperty('--surface-light', themeColors.surfaceLight);
        root.style.setProperty('--border', themeColors.border);
        root.style.setProperty('--text-primary', themeColors.textPrimary);
        root.style.setProperty('--text-secondary', themeColors.textSecondary);
        
        console.log('✓ Theme applied:', themeName);
    },
    
    // Show preferences
    show: function() {
        const content = document.getElementById('settings-content');
        if (!content) return;
        
        let html = `
            <div class="preferences-container">
                <button class="btn-back" onclick="navigationManager.goTo('profile')">← Назад к профилю</button>
                
                <h2>⚙️ Настройки приложения</h2>
                
                <div class="preferences-section">
                    <h3>🎨 Интерфейс</h3>
                    
                    <div class="preference-item">
                        <label for="pref-theme">Тема оформления:</label>
                        <select id="pref-theme" onchange="preferencesModule.updatePreference('theme', this.value)">
                            <option value="dark" ${this.preferences.theme === 'dark' ? 'selected' : ''}>Тёмная</option>
                            <option value="light" ${this.preferences.theme === 'light' ? 'selected' : ''}>Светлая</option>
                            <option value="auto" ${this.preferences.theme === 'auto' ? 'selected' : ''}>Автоматически</option>
                        </select>
                    </div>
                    
                    <div class="preference-item">
                        <label for="pref-fontSize">Размер шрифта:</label>
                        <select id="pref-fontSize" onchange="preferencesModule.updatePreference('fontSize', this.value)">
                            <option value="small" ${this.preferences.fontSize === 'small' ? 'selected' : ''}>Маленький</option>
                            <option value="normal" ${this.preferences.fontSize === 'normal' ? 'selected' : ''}>Нормальный</option>
                            <option value="large" ${this.preferences.fontSize === 'large' ? 'selected' : ''}>Большой</option>
                        </select>
                    </div>
                    
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" 
                                   ${this.preferences.animationsEnabled ? 'checked' : ''} 
                                   onchange="preferencesModule.updatePreference('animationsEnabled', this.checked)">
                            Включить анимации
                        </label>
                    </div>
                </div>
                
                <div class="preferences-section">
                    <h3>🔔 Уведомления</h3>
                    
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" 
                                   ${this.preferences.notifications ? 'checked' : ''} 
                                   onchange="preferencesModule.updatePreference('notifications', this.checked)">
                            Включить уведомления
                        </label>
                        <p class="preference-hint">Получайте уведомления о новых материалах и тестах</p>
                    </div>
                    
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" 
                                   ${this.preferences.emailDigest ? 'checked' : ''} 
                                   onchange="preferencesModule.updatePreference('emailDigest', this.checked)">
                            Еженедельный дайджест
                        </label>
                        <p class="preference-hint">Получайте еженедельный отчет о вашем прогрессе</p>
                    </div>
                </div>
                
                <div class="preferences-section">
                    <h3>⚡ Производительность</h3>
                    
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" 
                                   ${this.preferences.autoSave ? 'checked' : ''} 
                                   onchange="preferencesModule.updatePreference('autoSave', this.checked)">
                            Автоматическое сохранение
                        </label>
                        <p class="preference-hint">Автоматически сохранять прогресс при прохождении тестов</p>
                    </div>
                    
                    <button class="btn-secondary" onclick="preferencesModule.clearCache()">
                        🗑️ Очистить кэш браузера
                    </button>
                </div>
                
                <div class="preferences-section">
                    <h3>🌐 Язык</h3>
                    
                    <div class="preference-item">
                        <label for="pref-language">Язык интерфейса:</label>
                        <select id="pref-language" onchange="preferencesModule.updatePreference('language', this.value)">
                            <option value="ru" ${this.preferences.language === 'ru' ? 'selected' : ''}>Русский</option>
                            <option value="en" ${this.preferences.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="ky" ${this.preferences.language === 'ky' ? 'selected' : ''}>Кыргызча</option>
                        </select>
                        <p class="preference-hint">Изменение языка требует перезагрузки страницы</p>
                    </div>
                </div>
                
                <div class="preferences-actions">
                    <button class="btn-primary" onclick="preferencesModule.saveAll()">
                        💾 Сохранить все настройки
                    </button>
                    <button class="btn-secondary" onclick="preferencesModule.resetToDefaults()">
                        🔄 Вернуть значения по умолчанию
                    </button>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    },
    
    // Update single preference
    updatePreference: function(key, value) {
        this.preferences[key] = value;
        
        // Apply i18n immediately if language changed
        if (key === 'language') {
            if (typeof i18n !== 'undefined') i18n.setLang(value);
        }
        
        // Apply theme immediately if theme is changed
        if (key === 'theme') {
            this.applyTheme(value);
            localStorage.setItem('invictusPreferences', JSON.stringify(this.preferences));
            showTempMessage('✓ Тема применена');
        } else {
            showTempMessage('✓ Настройка обновлена');
        }
    },
    
    // Save all preferences
    saveAll: function() {
        localStorage.setItem('invictusPreferences', JSON.stringify(this.preferences));
        if (typeof i18n !== 'undefined') i18n.setLang(this.preferences.language);
        showTempMessage('✓ Настройки сохранены / Settings saved');
    },
    
    // Reset to defaults
    resetToDefaults: function() {
        if (confirm('Вы уверены? Все настройки вернут значения по умолчанию')) {
            this.preferences = {
                theme: 'dark',
                notifications: true,
                emailDigest: false,
                autoSave: true,
                animationsEnabled: true,
                fontSize: 'normal',
                language: 'ru'
            };
            this.applyTheme('dark');
            this.saveAll();
            this.show();
        }
    },
    
    // Clear cache
    clearCache: function() {
        // This would typically call caches.delete() or similar
        localStorage.removeItem('searchHistory');
        localStorage.removeItem('aiSearchHistory');
        showTempMessage('✓ Кэш очищен');
    }
};
