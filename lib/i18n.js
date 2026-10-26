// ============================================
// Invictus i18n - Русский, English, Кыргызча
// ============================================
const i18n = {
    currentLang: 'ru',
    translations: {
        ru: {
            nav_home: 'Главная',
            nav_subjects: 'Предметы',
            nav_tests: 'Тесты',
            nav_search: 'Поиск',
            nav_settings: 'Настройки',
            nav_progress: 'Прогресс',
            nav_scoring: 'Рейтинг',
            nav_crossword: 'Кроссворд',
            nav_glossary: 'Глоссарий',
            nav_videos: 'Видео',
            settings_title: 'Настройки',
            settings_login: 'Войти или зарегистрироваться',
            settings_profile: 'Профиль',
            settings_preferences: 'Настройки приложения',
            settings_help: 'Помощь',
            settings_about: 'О приложении',
            pref_theme: 'Тема оформления',
            pref_font: 'Размер шрифта',
            pref_language: 'Язык интерфейса',
            pref_save: 'Сохранить',
            pref_reset: 'Сбросить',
            hero_title: 'Медицинское Образование',
            hero_subtitle: 'Платформа для студентов медицинского факультета',
            hero_start: 'Начать обучение',
            loading: 'Загрузка...',
            hello: 'Привет',
            guest: 'Гость',
            subjects_title: 'Предметы',
            back: 'Назад',
            no_results: 'Ничего не найдено',
            completed: 'Пройдено',
            questions: 'вопросов',
            minutes: 'мин',
            passed: 'Пройден',
            new_test: 'Новый',
            owner_panel: 'Панель владельца',
            teacher_cabinet: 'Кабинет преподавателя',
            dashboard: 'Личный кабинет',
            logout: 'Выход',
            welcome_owner: 'Добро пожаловать, Владелец!',
            first_time_setup: 'Пожалуйста, настройте пароль',
            dev_mode: 'Режим разработчика',
            search_placeholder: 'Поиск по приложению...',
            lang_ru: 'Русский',
            lang_en: 'English',
            lang_ky: 'Кыргызча',
        },
        en: {
            nav_home: 'Home',
            nav_subjects: 'Subjects',
            nav_tests: 'Tests',
            nav_search: 'Search',
            nav_settings: 'Settings',
            nav_progress: 'Progress',
            nav_scoring: 'Rating',
            nav_crossword: 'Crossword',
            nav_glossary: 'Glossary',
            nav_videos: 'Videos',
            settings_title: 'Settings',
            settings_login: 'Login or Register',
            settings_profile: 'Profile',
            settings_preferences: 'App Settings',
            settings_help: 'Help',
            settings_about: 'About',
            pref_theme: 'Theme',
            pref_font: 'Font Size',
            pref_language: 'Language',
            pref_save: 'Save',
            pref_reset: 'Reset',
            hero_title: 'Medical Education',
            hero_subtitle: 'Platform for medical students',
            hero_start: 'Start Learning',
            loading: 'Loading...',
            hello: 'Hello',
            guest: 'Guest',
            subjects_title: 'Subjects',
            back: 'Back',
            no_results: 'No results found',
            completed: 'Completed',
            questions: 'questions',
            minutes: 'min',
            passed: 'Passed',
            new_test: 'New',
            owner_panel: 'Owner Panel',
            teacher_cabinet: 'Teacher Cabinet',
            dashboard: 'Dashboard',
            logout: 'Logout',
            welcome_owner: 'Welcome, Owner!',
            first_time_setup: 'Please set up your password',
            dev_mode: 'Developer Mode',
            search_placeholder: 'Search app...',
            lang_ru: 'Русский',
            lang_en: 'English',
            lang_ky: 'Кыргызча',
        },
        ky: {
            nav_home: 'Башкы бет',
            nav_subjects: 'Предметтер',
            nav_tests: 'Тесттер',
            nav_search: 'Издөө',
            nav_settings: 'Жөндөөлөр',
            nav_progress: 'Прогресс',
            nav_scoring: 'Рейтинг',
            nav_crossword: 'Кроссворд',
            nav_glossary: 'Глоссарий',
            nav_videos: 'Видеолор',
            settings_title: 'Жөндөөлөр',
            settings_login: 'Кирүү же катталуу',
            settings_profile: 'Профиль',
            settings_preferences: 'Тиркеме жөндөөлөрү',
            settings_help: 'Жардам',
            settings_about: 'Тиркеме жөнүндө',
            pref_theme: 'Тема',
            pref_font: 'Шрифт өлчөмү',
            pref_language: 'Тил',
            pref_save: 'Сактоо',
            pref_reset: 'Баштапкы абалга',
            hero_title: 'Медициналык билим',
            hero_subtitle: 'Медицина факультетинин студенттери үчүн платформа',
            hero_start: 'Окууну баштоо',
            loading: 'Жүктөлүүдө...',
            hello: 'Салам',
            guest: 'Конок',
            subjects_title: 'Предметтер',
            back: 'Артка',
            no_results: 'Эч нерсе табылган жок',
            completed: 'Аякталды',
            questions: 'соруу',
            minutes: 'мүн',
            passed: 'Өттү',
            new_test: 'Жаңы',
            owner_panel: 'Ээсинин панели',
            teacher_cabinet: 'Мугалим кабинети',
            dashboard: 'Жеке кабинет',
            logout: 'Чыгуу',
            welcome_owner: 'Кош келиңиз, Ээ!',
            first_time_setup: 'Сураныч, сырсөздү орнотуңуз',
            dev_mode: 'Иштеп чыгуу режими',
            search_placeholder: 'Тиркемеден издөө...',
            lang_ru: 'Русский',
            lang_en: 'English',
            lang_ky: 'Кыргызча',
        }
    },

    init: function() {
        const saved = localStorage.getItem('invictusPreferences');
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                this.currentLang = prefs.language || 'ru';
            } catch(e) {}
        }
    },

    t: function(key) {
        return (this.translations[this.currentLang] && this.translations[this.currentLang][key])
            || (this.translations['ru'] && this.translations['ru'][key])
            || key;
    },

    setLang: function(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.applyToDOM();
        }
    },

    applyToDOM: function() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = this.t(key);
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = translated;
            } else {
                el.textContent = translated;
            }
        });
    }
};

window.i18n = i18n;
