// ============================================
// Student Dashboard Module
// ============================================

const dashboardModule = {
    currentUser: null,
    
    init: function(appData) {
        this.appData = appData;
        console.log('✓ Dashboard Module Initialized');
    },
    
    show: function() {
        if (!appData.user || appData.user.isGuest) {
            navigationManager.goTo('home');
            return;
        }
        
        this.currentUser = appData.user;
        const screen = document.getElementById('dashboard-screen');
        if (!screen) return;
        
        screen.style.display = 'flex';
        screen.innerHTML = this.render();
    },
    
    hide: function() {
        const screen = document.getElementById('dashboard-screen');
        if (screen) screen.style.display = 'none';
    },
    
    render: function() {
        const user = this.currentUser;
        const progress = user.progress || { completedTopics: [], completedSubjects: [], points: 0 };

        if (user.role === 'teacher' || user.role === 'owner') {
            return this.renderTeacherDashboard(user);
        }
        
        // Подсчитать статистику
        const lastTopics = this.getLastViewedTopics(5);
        const achievements = this.getAchievements();
        
        return `
            <div class="dashboard-header">
                <h2>📊 Личный Кабинет</h2>
                <button class="dashboard-logout-btn" onclick="performLogout()">🚪 Выход</button>
            </div>
            
            <div class="dashboard-content">
                <!-- Профиль карточка -->
                <div class="dashboard-profile-card">
                    <div class="profile-avatar">${Safe.esc(user.fullname.charAt(0).toUpperCase())}</div>
                    <div class="profile-info">
                        <h3>${this.escapeHtml(user.fullname)}</h3>
                        <p class="profile-email">📧 ${this.escapeHtml(user.email)}</p>
                        <p class="profile-date">📅 Зарегистрирован: ${new Date(user.registrationDate).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">${progress.points}</span>
                            <span class="stat-label">Баллов</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${(progress.completedSubjects || []).length}</span>
                            <span class="stat-label">Предметов</span>
                        </div>
                    </div>
                </div>
                
                <!-- Прогресс по предметам -->
                <div class="dashboard-section">
                    <h3 class="section-title">📚 Прогресс по предметам</h3>
                    <div class="courses-progress">
                        ${this.renderSubjectsProgress()}
                    </div>
                </div>
                
                <!-- Последние просмотренные темы -->
                <div class="dashboard-section">
                    <h3 class="section-title">⏱️ Последние темы</h3>
                    <div class="recent-topics">
                        ${this.renderRecentTopics()}
                    </div>
                </div>
                
                <!-- Достижения -->
                ${achievements.length > 0 ? `
                    <div class="dashboard-section">
                        <h3 class="section-title">🏆 Достижения</h3>
                        <div class="achievements-grid">
                            ${achievements.map(a => `
                                <div class="achievement-badge" title="${a.name}">
                                    <span class="achievement-icon">${a.icon}</span>
                                    <span class="achievement-name">${a.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderTeacherDashboard: function(user) {
        const isOwner = user.role === 'owner';
        const studentOverview = typeof authenticationModule !== 'undefined'
            ? authenticationModule.getStudentOverview()
            : [];
        const totalStudents = studentOverview.length;
        const totalCompletedTopics = studentOverview.reduce((sum, item) => sum + item.completedTopics, 0);
        const averageScore = totalStudents
            ? Math.round(studentOverview.reduce((sum, item) => sum + item.averageScore, 0) / totalStudents)
            : 0;
        const topStudents = studentOverview.slice(0, 5);

        return `
            <div class="dashboard-header">
                <h2>${isOwner ? '👑 Панель владельца' : '👨‍🏫 Кабинет преподавателя'}</h2>
                <button class="dashboard-logout-btn" onclick="performLogout()">🚪 Выход</button>
            </div>

            <div class="dashboard-content">
                <div class="dashboard-profile-card">
                    <div class="profile-avatar">${user.avatar || (isOwner ? '👑' : '👨‍🏫')}</div>
                    <div class="profile-info">
                        <h3>${this.escapeHtml(user.fullname)}</h3>
                        <p class="profile-email">📧 ${this.escapeHtml(user.email || 'Не указан')}</p>
                        <p class="profile-date">📅 ${isOwner ? 'Аккаунт владельца' : 'Аккаунт преподавателя'}</p>
                    </div>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">${totalStudents}</span>
                            <span class="stat-label">Студентов</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${averageScore}%</span>
                            <span class="stat-label">Средний балл</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-section">
                    <h3 class="section-title">📈 Обзор обучения</h3>
                    <div class="courses-progress">
                        <div class="course-progress-item">
                            <div class="course-info">
                                <span class="course-icon">👥</span>
                                <span class="course-name">Активные студенты</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 100%"></div>
                                </div>
                                <span class="progress-percent">${totalStudents}</span>
                            </div>
                            <span class="topics-count">Всего</span>
                        </div>
                        <div class="course-progress-item">
                            <div class="course-info">
                                <span class="course-icon">📚</span>
                                <span class="course-name">Пройдено тем</span>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(100, totalCompletedTopics)}%"></div>
                                </div>
                                <span class="progress-percent">${totalCompletedTopics}</span>
                            </div>
                            <span class="topics-count">Суммарно</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-section">
                    <h3 class="section-title">⚡ Быстрые действия</h3>
                    <div class="recent-topics">
                        <div class="recent-topic-item" onclick="navigationManager.goTo('scoring')">
                            <div class="topic-breadcrumb"><strong>Рейтинг</strong></div>
                            <h4>Открыть аналитику рейтинга</h4>
                            <p class="topic-preview">Сравнение студентов по предметам и общим баллам.</p>
                        </div>
                        <div class="recent-topic-item" onclick="navigationManager.goTo('profile')">
                            <div class="topic-breadcrumb"><strong>Профиль</strong></div>
                            <h4>Редактировать профиль преподавателя</h4>
                            <p class="topic-preview">Проверьте аккаунт, роль и настройки интерфейса.</p>
                        </div>
                        <div class="recent-topic-item" onclick="navigationManager.goTo('search')">
                            <div class="topic-breadcrumb"><strong>Материалы</strong></div>
                            <h4>Открыть поиск по базе знаний</h4>
                            <p class="topic-preview">Быстрый доступ к предметам, документам и локальным данным.</p>
                        </div>
                        <div class="recent-topic-item" onclick="navigationManager.goTo('tests')">
                            <div class="topic-breadcrumb"><strong>Тесты</strong></div>
                            <h4>Конструктор тестов и отчёты</h4>
                            <p class="topic-preview">Создание вопросов, аналитика группы и экспорт результатов.</p>
                        </div>
                        ${isOwner ? `
                            <div class="recent-topic-item" onclick="navigationManager.goTo('developer')">
                                <div class="topic-breadcrumb"><strong>Владелец</strong></div>
                                <h4>Открыть панель управления</h4>
                                <p class="topic-preview">Правки контента, экранов, пользователей и системных настроек без скрытых жестов.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="dashboard-section">
                    <h3 class="section-title">🏅 Лучшие студенты</h3>
                    <div class="recent-topics">
                        ${topStudents.length > 0 ? topStudents.map(student => `
                            <div class="recent-topic-item">
                                <div class="topic-breadcrumb">
                                    <strong>${this.escapeHtml(student.fullname)}</strong>
                                </div>
                                <h4>${student.points} баллов</h4>
                                <p class="topic-preview">Тем: ${student.completedTopics} • Средний тест: ${student.averageScore}%</p>
                            </div>
                        `).join('') : '<p style="color: rgba(255,255,255,0.6);">Пока нет студентов для анализа.</p>'}
                    </div>
                </div>

                ${isOwner ? `
                    <div class="dashboard-section">
                        <h3 class="section-title">👑 Управление владельца</h3>
                        <div class="recent-topics">
                            <div class="recent-topic-item" onclick="navigationManager.goTo('developer')">
                                <div class="topic-breadcrumb"><strong>Контент</strong></div>
                                <h4>Изменить предметы, темы и медиа</h4>
                                <p class="topic-preview">Редактирование данных сохраняется в appData и localStorage приложения.</p>
                            </div>
                            <div class="recent-topic-item" onclick="navigationManager.goTo('profile')">
                                <div class="topic-breadcrumb"><strong>Система</strong></div>
                                <h4>Настройки и профиль</h4>
                                <p class="topic-preview">Доступ к профилю, предпочтениям и системным параметрам.</p>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    renderSubjectsProgress: function() {
        let html = '';
        const user = this.currentUser;
        const doneSubjects = (user.progress.completedSubjects || []).map(String);

        for (let subjectId in (this.appData.subjects || {})) {
            const subject = this.appData.subjects[subjectId];
            const isCompleted = doneSubjects.includes(String(subjectId));

            const topics = Array.isArray(subject.topics) ? subject.topics : [];
            const totalTopics = topics.length;
            const completedTopics = topics.filter((topic, idx) =>
                user.progress.completedTopics.includes(`${subjectId}-${idx}`)
            ).length;

            const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            html += `
                <div class="course-progress-item ${isCompleted ? 'completed' : ''}">
                    <div class="course-info">
                        <span class="course-icon">${this.escapeHtml(subject.icon || '📖')}</span>
                        <span class="course-name">${this.escapeHtml(subject.title)}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <span class="progress-percent">${percent}%</span>
                    </div>
                    <span class="topics-count">${completedTopics}/${totalTopics}</span>
                </div>
            `;
        }

        return html || '<p style="color: rgba(0,0,0,0.5);">Начните изучение предметов →</p>';
    },

    renderRecentTopics: function() {
        const user = this.currentUser;
        const topicIds = user.progress.completedTopics.slice(-3).reverse();
        
        if (topicIds.length === 0) {
            return '<p style="color: rgba(0,0,0,0.5);">Вы еще не изучали темы</p>';
        }
        
        let html = '';
        
        topicIds.forEach(topicId => {
            const [subjectId, topicIdx] = topicId.split('-').map(Number);
            const subject = (this.appData.subjects || {})[subjectId];
            if (!subject || !subject.topics) return;
            
            const topic = subject.topics[topicIdx];
            if (!topic) return;
            
            html += `
                <div class="recent-topic-item" onclick="navigationManager.goTo('subjects'); setTimeout(() => topicsModule.selectTopic(${subjectId}, ${topicIdx}), 100)">
                    <div class="topic-breadcrumb">
                        <strong>${this.escapeHtml(subject.title)}</strong>
                    </div>
                    <h4>${this.escapeHtml(topic.title)}</h4>
                    <p class="topic-preview">${(topic.content || '').substring(0, 80)}...</p>
                </div>
            `;
        });
        
        return html;
    },
    
    getLastViewedTopics: function(count) {
        const user = this.currentUser;
        return user.progress.completedTopics.slice(-count).reverse();
    },
    
    getAchievements: function() {
        const user = this.currentUser;
        const achievements = [];
        
        // 🎓 Первый предмет
        if ((user.progress.completedSubjects || []).length >= 1) {
            achievements.push({ icon: '🎓', name: 'Первый предмет' });
        }
        
        // 📚 5 тем
        if (user.progress.completedTopics.length >= 5) {
            achievements.push({ icon: '📚', name: '5 тем' });
        }
        
        // 🌟 10 тем
        if (user.progress.completedTopics.length >= 10) {
            achievements.push({ icon: '⭐', name: '10 тем' });
        }
        
        // 🔥 Усердный студент
        if (user.progress.points >= 100) {
            achievements.push({ icon: '🔥', name: 'Усердный' });
        }
        
        return achievements;
    },
    
    escapeHtml: function(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
};
