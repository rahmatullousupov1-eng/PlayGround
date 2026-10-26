// ============================================
// Scoring System Module - Advanced Rating System
// ============================================

const scoringModule = {
    points: {},
    leaderboard: [],
    subjectRatings: {},
    
    // Баллы за разные действия (убрали рейтинг по тестам)
    actions: {
        'read-topic': 10,        // За прочтение материала
        'complete-subject': 50,  // За выполнение предмета
        'watch-video': 15,       // За просмотр видео
        'complete-crossword': 20, // За кроссворд
        'read-content': 5,       // За прочтение контента
        'complete-test': 20,     // За завершение теста
        'pass-test': 15,         // За успешную сдачу теста
        'perfect-test': 15,      // За идеальный результат
        'fast-test': 10          // За быстрое прохождение
    },
    
    init: function(appData) {
        this.appData = appData;
        this.loadScores();
        this.seedLegacyScores();
        this.syncCurrentUserPoints();
        this.updateAllRatings();
        console.log('✓ Scoring Module Initialized');
    },

    // До подключения модуля баллы хранились только в профилях пользователей.
    seedLegacyScores: function() {
        if (localStorage.getItem('appScores') !== null) return;

        const users = new Map();
        if (typeof authenticationModule !== 'undefined' && typeof authenticationModule.getAllUsers === 'function') {
            authenticationModule.getAllUsers().forEach(user => {
                const id = user.id || user.username || user.email;
                if (id) users.set(id, user);
            });
        }
        if (this.appData.user) {
            const id = this.appData.user.id || this.appData.user.username || this.appData.user.email;
            if (id) users.set(id, this.appData.user);
        }

        let changed = false;
        users.forEach((user, userId) => {
            const points = Number(user?.progress?.points || 0);
            if (this.points[userId] || points <= 0) return;
            this.points[userId] = {
                total: points,
                bySubject: {},
                byAction: {},
                registeredAt: user.registrationDate || new Date().toISOString()
            };
            changed = true;
        });

        if (changed) this.saveScores();
    },

    resolveUserProfile: function(userId) {
        if (this.appData.user && (this.appData.user.id === userId || this.appData.user.username === userId)) {
            return this.appData.user;
        }

        if (typeof authenticationModule !== 'undefined') {
            return authenticationModule.getUserByUsername(userId) || null;
        }

        return null;
    },
    
    // Добавить баллы пользователю за действие
    addPoints: function(userId, action, subjectId = null) {
        const points = this.actions[action] || 0;
        if (points === 0) return;

        // Инициализация пользователя
        if (!this.points[userId]) {
            this.points[userId] = {
                total: 0,
                bySubject: {},
                byAction: {},
                registeredAt: new Date().toISOString()
            };
        }

        // Добавить к общим баллам
        this.points[userId].total += points;

        // Баллы по предметам
        if (subjectId) {
            const subjectKey = String(subjectId);
            if (!this.points[userId].bySubject[subjectKey]) {
                this.points[userId].bySubject[subjectKey] = 0;
            }
            this.points[userId].bySubject[subjectKey] += points;
        }

        // Отслеживание действий
        if (!this.points[userId].byAction[action]) {
            this.points[userId].byAction[action] = 0;
        }
        this.points[userId].byAction[action]++;

        this.saveScores();
        this.syncCurrentUserPoints();
        this.updateAllRatings();
        this.updateScoreDisplay();
    },

    awardTestPoints: function(userId, details = {}) {
        if (!userId) return;

        const subjectId = details.subjectId || null;
        const score = Number(details.score || 0);
        const totalQuestions = Number(details.totalQuestions || 0);
        const timeSpent = Number(details.timeSpent || 0);

        this.addPoints(userId, 'complete-test', subjectId);

        if (score >= 60) {
            this.addPoints(userId, 'pass-test', subjectId);
        }

        if (score === 100 && totalQuestions >= 3) {
            this.addPoints(userId, 'perfect-test', subjectId);
        }

        if (score >= 80 && totalQuestions > 0) {
            const fastThreshold = Math.max(totalQuestions * 35, 90);
            if (timeSpent > 0 && timeSpent <= fastThreshold) {
                this.addPoints(userId, 'fast-test', subjectId);
            }
        }
    },
    
    // Получить общие баллы пользователя
    getUserPoints: function(userId) {
        return this.points[userId]?.total || 0;
    },
    
    // Получить баллы по предмету
    getSubjectPoints: function(userId, subjectId) {
        return this.points[userId]?.bySubject[String(subjectId)] || 0;
    },

    // Обновить все рейтинги
    updateAllRatings: function() {
        this.updateGlobalLeaderboard();
        this.updateSubjectRatings();
    },
    
    // Обновить глобальный рейтинг
    updateGlobalLeaderboard: function() {
        this.leaderboard = [];
        
        for (let userId in this.points) {
            const userData = this.resolveUserProfile(userId) || { fullname: userId };
            const roleLabel = typeof getRoleLabel === 'function'
                ? getRoleLabel(userData)
                : (userData.role === 'owner' ? 'Владелец' : userData.role === 'teacher' ? 'Преподаватель' : 'Студент');
            
            const completedSubjects = (userData.progress && Array.isArray(userData.progress.completedSubjects))
                ? userData.progress.completedSubjects.length
                : 0;

            this.leaderboard.push({
                userId: userId,
                name: userData.fullname || userId,
                avatar: userData.avatar || '👤',
                points: this.points[userId].total,
                completedSubjects,
                registeredAt: this.points[userId].registeredAt,
                role: userData.role || 'student',
                roleLabel
            });
        }
        
        // Сортировка по баллам (убывающий)
        this.leaderboard.sort((a, b) => b.points - a.points);
    },
    
    // Обновить рейтинги по предметам
    updateSubjectRatings: function() {
        this.subjectRatings = {};

        for (let subjectId in (this.appData.subjects || {})) {
            this.subjectRatings[subjectId] = [];

            for (let userId in this.points) {
                const subjectPoints = this.getSubjectPoints(userId, subjectId);
                if (subjectPoints > 0) {
                    const userData = this.resolveUserProfile(userId) || { fullname: userId };
                    const roleLabel = typeof getRoleLabel === 'function'
                        ? getRoleLabel(userData)
                        : (userData.role === 'owner' ? 'Владелец' : userData.role === 'teacher' ? 'Преподаватель' : 'Студент');

                    this.subjectRatings[subjectId].push({
                        userId: userId,
                        name: userData.fullname || userId,
                        avatar: userData.avatar || '👤',
                        points: subjectPoints,
                        subjectName: this.appData.subjects[subjectId].title,
                        role: userData.role || 'student',
                        roleLabel
                    });
                }
            }

            this.subjectRatings[subjectId].sort((a, b) => b.points - a.points);
        }
    },

    // Рендер таблицы глобального рейтинга
    renderGlobalRating: function(limit = 50) {
        let html = `
            <div class="rating-container">
                <h2>⭐ ГЛОБАЛЬНЫЙ РЕЙТИНГ</h2>
                <table class="rating-table">
                    <thead>
                        <tr>
                            <th class="rank">Место</th>
                            <th class="avatar">Аватар</th>
                            <th class="name">👤 Участник</th>
                            <th class="points">🎯 Баллы</th>
                            <th class="courses">✅ Предметов завершено</th>
                            <th class="registered">📅 Дата регистрации</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        this.leaderboard.slice(0, limit).forEach((entry, index) => {
            const regDate = new Date(entry.registeredAt).toLocaleDateString('ru-RU');
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            const displayName = entry.roleLabel && entry.roleLabel !== 'Студент'
                ? `${this.escapeHtml(entry.name)} <span class="role-chip">${this.escapeHtml(entry.roleLabel)}</span>`
                : this.escapeHtml(entry.name);
            
            html += `
                <tr class="rating-row ${index < 3 ? 'top-' + (index + 1) : ''}">
                    <td class="rank">${medal}</td>
                    <td class="avatar">${entry.avatar}</td>
                    <td class="name">${displayName}</td>
                    <td class="points"><strong>${entry.points}</strong></td>
                    <td class="courses">${entry.completedSubjects}</td>
                    <td class="registered">${regDate}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    },
    
    // Рендер таблицы рейтинга по предметам
    renderSubjectRatings: function() {
        let html = `<div class="rating-container">
            <h2>📖 РЕЙТИНГ ПО ПРЕДМЕТАМ</h2>
        `;
        
        for (let key in this.subjectRatings) {
            const ratings = this.subjectRatings[key];
            if (ratings.length === 0) continue;
            
            const subjectData = ratings[0];
            html += `
                <div class="subject-rating-section">
                    <h3>📖 ${subjectData.subjectName}</h3>
                    <table class="rating-table">
                        <thead>
                        <tr>
                            <th class="rank">Место</th>
                            <th class="avatar">Аватар</th>
                            <th class="name">👤 Участник</th>
                            <th class="points">🎯 Баллы</th>
                        </tr>
                        </thead>
                        <tbody>
            `;
            
            ratings.slice(0, 15).forEach((entry, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                const displayName = entry.roleLabel && entry.roleLabel !== 'Студент'
                    ? `${this.escapeHtml(entry.name)} <span class="role-chip">${this.escapeHtml(entry.roleLabel)}</span>`
                    : this.escapeHtml(entry.name);
                html += `
                    <tr class="rating-row ${index < 3 ? 'top-' + (index + 1) : ''}">
                        <td class="rank">${medal}</td>
                        <td class="avatar">${entry.avatar}</td>
                        <td class="name">${displayName}</td>
                        <td class="points"><strong>${entry.points}</strong></td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    },
    
    // Безопасное экранирование HTML
    escapeHtml: function(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    // Обновить отображение баллов в заголовке
    updateScoreDisplay: function() {
        const scoreDisplay = document.getElementById('score-display');
        if (!scoreDisplay || !appData.user) return;
        
        this.syncCurrentUserPoints();
        const userPoints = this.getUserPoints(appData.user.id || appData.user.fullname);
        scoreDisplay.innerHTML = `🎯 ${userPoints} баллов`;
    },

    syncCurrentUserPoints: function() {
        if (!this.appData.user || this.appData.user.isGuest) return;

        const userId = this.appData.user.id || this.appData.user.username || this.appData.user.fullname;
        if (!userId) return;

        if (!this.appData.user.progress) return;

        const userPoints = this.getUserPoints(userId);
        this.appData.user.progress.points = userPoints;
        if (typeof authenticationModule !== 'undefined' && typeof authenticationModule.syncStoredUser === 'function') {
            authenticationModule.syncStoredUser(this.appData.user);
        }
        localStorage.setItem('invictusUser', JSON.stringify(this.appData.user));
    },
    
    // Сохранить баллы в localStorage
    saveScores: function() {
        localStorage.setItem('appScores', JSON.stringify(this.points));
    },
    
    // Загрузить баллы из localStorage
    loadScores: function() {
        const saved = localStorage.getItem('appScores');
        if (saved) {
            try {
                this.points = JSON.parse(saved);
                this.migrateLegacyScores();
            } catch (e) {
                console.error('Ошибка при загрузке баллов:', e);
            }
        }
    },

    // Старые баллы хранились по ключам «курс_предмет» и по курсам. Переносим на плоский список предметов.
    migrateLegacyScores: function() {
        let changed = false;
        Object.values(this.points).forEach(entry => {
            if (!entry || typeof entry !== 'object') return;
            if ('byCourse' in entry) {
                delete entry.byCourse;
                changed = true;
            }
            const bySubject = entry.bySubject || {};
            const migrated = {};
            Object.entries(bySubject).forEach(([key, value]) => {
                const m = /^(\d+)_(\d+)$/.exec(key);
                const newKey = m ? String(LEGACY_SUBJECT_IDS[m[1] + '-' + m[2]] || '') : key;
                if (!newKey) return;
                if (newKey !== key) changed = true;
                migrated[newKey] = (migrated[newKey] || 0) + Number(value || 0);
            });
            entry.bySubject = migrated;
        });
        if (changed) this.saveScores();
    }
};
