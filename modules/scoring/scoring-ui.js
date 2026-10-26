// ============================================
// Scoring UI Manager
// ============================================

const scoringUI = {
    currentTab: 'global',
    
    init: function() {
        this.loadScoring();
        console.log('✓ Scoring UI Initialized');
    },
    
    // Загрузить и отобразить рейтинги
    loadScoring: function() {
        this.updateGlobalRating();
        this.updateSubjectRating();
    },
    
    // Переключение между вкладками
    switchTab: function(tabName, eventRef = null) {
        // Скрыть все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Скрыть кнопки вкладок
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показать выбранную вкладку
        const tabElement = document.getElementById('tab-' + tabName);
        if (tabElement) {
            tabElement.classList.add('active');
        }
        
        // Активировать кнопку вкладки
        const activeEvent = eventRef || (typeof event !== 'undefined' ? event : null);
        if (activeEvent && activeEvent.target) {
            activeEvent.target.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // Обновить содержимое вкладки
        if (tabName === 'global') {
            this.updateGlobalRating();
        } else if (tabName === 'subjects') {
            this.updateSubjectRating();
        }
    },
    
    // Обновить глобальный рейтинг
    updateGlobalRating: function() {
        const container = document.getElementById('global-rating-container');
        if (!container) return;
        
        const html = scoringModule.renderGlobalRating(50);
        container.innerHTML = html;
    },
    
    // Обновить рейтинг по предметам
    updateSubjectRating: function() {
        const container = document.getElementById('subjects-rating-container');
        if (!container) return;
        
        const html = scoringModule.renderSubjectRatings();
        container.innerHTML = html || '<p>Нет данных по предметам</p>';
    },
    
    // Экспорт данных рейтинга
    exportData: function() {
        const data = {
            scores: scoringModule.points,
            leaderboard: scoringModule.leaderboard,
            exportedAt: new Date().toISOString()
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rating-export-${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✓ Данные рейтинга экспортированы');
    },
    
    // Сброс всех баллов (только для администратора)
    resetScores: function() {
        if (!confirm('⚠️ Вы уверены? Это удалит все баллы!')) {
            return;
        }
        
        scoringModule.points = {};
        scoringModule.leaderboard = [];
        scoringModule.saveScores();
        if (appData.user?.progress) {
            appData.user.progress.points = 0;
            if (typeof persistCurrentUserState === 'function') persistCurrentUserState();
        }
        
        this.loadScoring();
        console.log('✓ Все баллы сброшены');
    },
    
    // Генерировать тестовые данные
    generateTestData: function() {
        if (!confirm('Это создаст тестовые данные для демонстрации')) {
            return;
        }
        
        const studentNames = [
            'Александр Петров',
            'Мария Иванова',
            'Сергей Сидоров',
            'Елена Смирнова',
            'Иван Федоров',
            'Анна Морозова',
            'Николай Волков',
            'Ольга Лебедева',
            'Дмитрий Новиков',
            'Виктория Соколова'
        ];
        
        const avatars = ['👨‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬', '🧑‍⚕️', '👨‍💼', '👩‍💼'];
        
        // Создать тестовых студентов
        for (let i = 0; i < 10; i++) {
            const userId = `student_${i}`;
            // Добавить баллы
            const actions = ['read-topic', 'watch-video', 'read-content', 'complete-subject'];
            const randomActions = Math.floor(Math.random() * 50) + 10;
            
            for (let j = 0; j < randomActions; j++) {
                const action = actions[Math.floor(Math.random() * actions.length)];
                scoringModule.addPoints(userId, action);
            }
        }
        
        scoringModule.updateAllRatings();
        this.loadScoring();
        console.log('✓ Тестовые данные созданы');
    }
};

