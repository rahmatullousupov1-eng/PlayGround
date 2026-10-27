// Progress Module Manager
const progressModule = {
    init: function(appData) {
        this.appData = appData;
        console.log('✓ Progress Module Initialized');
    },
    
    show: function() {
        if ((appData.user?.role === 'teacher' || appData.user?.role === 'owner') && typeof navigationManager !== 'undefined') {
            navigationManager.goTo('dashboard');
            return;
        }

        const screen = document.getElementById('progress-screen');
        if (screen) {
            screen.style.display = 'block';
            this.renderProgress();
        }
    },
    
    hide: function() {
        const screen = document.getElementById('progress-screen');
        if (screen) {
            screen.style.display = 'none';
        }
    },
    
    renderProgress: function() {
        const container = document.getElementById('progress-container');
        if (!container || !appData.user) return;
        
        const totalTopics = this.calculateTotalTopics();
        const completedCount = appData.user.progress.completedTopics.length;

        const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
        
        container.innerHTML = `
            <div class="progress-card">
                <div class="user-info">
                    <div class="user-avatar-large">${appData.user.avatar}</div>
                    <div class="user-details">
                        <h2>${Safe.esc(appData.user.fullname)}</h2>
                    </div>
                </div>
            </div>
            
            <div class="progress-stats">
                <div class="stat-card">
                    <div class="stat-icon">📖</div>
                    <div class="stat-value">${completedCount}</div>
                    <div class="stat-label">Тем пройдено</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">${progressPercent}%</div>
                    <div class="stat-label">Общий прогресс</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${totalTopics}</div>
                    <div class="stat-label">Всего тем</div>
                </div>
            </div>
            
            <div class="progress-bar-container">
                <h3>Прогресс обучения</h3>
                <div class="progress-bar-full">
                    <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
                <p class="progress-text">${completedCount} из ${totalTopics} тем завершено</p>
            </div>
            
            <div class="courses-progress">
                <h3>Предметы</h3>
                <div class="course-progress-list">
                    ${this.renderSubjectProgress()}
                </div>
            </div>
        `;

        if (typeof knowledgeModule !== 'undefined' && typeof knowledgeModule.renderProgressAddon === 'function') {
            container.insertAdjacentHTML('beforeend', knowledgeModule.renderProgressAddon());
        }
    },
    
    calculateTotalTopics: function() {
        let total = 0;
        for (let subjectId in (this.appData.subjects || {})) {
            total += (this.appData.subjects[subjectId].topics || []).length;
        }
        return total;
    },

    // Прогресс по каждому предмету
    renderSubjectProgress: function() {
        let html = '';
        for (let subjectId in (this.appData.subjects || {})) {
            const subject = this.appData.subjects[subjectId];
            const subjectTopics = (subject.topics || []).length;

            // Подсчитать только реальные темы этого предмета, без коллизий префиксов
            const completedSet = new Set((appData.user?.progress?.completedTopics || []).map(String));
            const completed = (subject.topics || []).reduce((count, _topic, index) =>
                completedSet.has(`${subjectId}-${index}`) ? count + 1 : count, 0);

            const percent = subjectTopics > 0 ? Math.round((completed / subjectTopics) * 100) : 0;

            html += `
                <div class="course-progress-item">
                    <div class="course-progress-name">
                        <span class="course-icon">${Safe.esc(subject.icon || '📖')}</span>
                        <span>${Safe.esc(subject.title)}</span>
                    </div>
                    <div class="course-progress-bar">
                        <div class="progress-bar-full" style="margin: 5px 0;">
                            <div class="progress-bar-fill" style="width: ${percent}%"></div>
                        </div>
                    </div>
                    <div class="course-progress-text">${completed}/${subjectTopics} (${percent}%)</div>
                </div>
            `;
        }
        return html;
    }
};
