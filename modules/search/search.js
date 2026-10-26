
// Search Module - Local Knowledge Search
const searchModule = {
    searchDatabase: [],
    searchHistory: [],
    
    init: function(appData) {
        this.appData = appData;
        this.buildSearchDatabase();
        console.log('✓ Search Module Initialized');
        console.log(`📚 Search database: ${this.searchDatabase.length} items`);
    },

    getSearchSettings: function() {
        if (this.appData && typeof normalizeSearchSettings === 'function') {
            this.appData.searchSettings = normalizeSearchSettings(this.appData.searchSettings);
            return this.appData.searchSettings;
        }

        try {
            return JSON.parse(localStorage.getItem('searchSettings') || '{}');
        } catch (error) {
            return {};
        }
    },
    
    // Построить базу данных для поиска из всех предметов
    buildSearchDatabase: function() {
        this.searchDatabase = [];
        for (let subjectId in (this.appData.subjects || {})) {
            const subject = this.appData.subjects[subjectId];

            // Добавить предмет в базу
            this.searchDatabase.push({
                type: 'subject',
                subjectId: subjectId,
                title: subject.title,
                icon: subject.icon || '📖',
                description: subject.description || 'Предмет',
                content: subject.content || '',
                searchText: `${subject.title} ${subject.description || ''}`.toLowerCase()
            });

            // Добавить все темы предмета в базу
            if (subject.topics && Array.isArray(subject.topics)) {
                subject.topics.forEach((topic, topicIndex) => {
                    this.searchDatabase.push({
                        type: 'topic',
                        subjectId: subjectId,
                        topicId: topicIndex,
                        title: topic.title,
                        subjectName: subject.title,
                        content: topic.content || '',
                        icon: topic.icon || subject.icon || '📄',
                        description: topic.content || '',
                        searchText: `${topic.title} ${subject.title} ${topic.content || ''}`.toLowerCase()
                    });
                });
            }
        }
    },

    // Вычислить расстояние Левенштейна между строками (для fuzzy)
    levenshtein: function(a, b) {
        if (!a) return b.length;
        if (!b) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    },

    // Оценить совпадение строки с запросом (0..1)
    matchScore: function(text, query) {
        if (!text || !query) return 0;
        text = text.toLowerCase();
        query = query.toLowerCase();
        if (text.includes(query)) return 1;
        // fuzzy: использовать левенштейн на словах
        const words = text.split(/\s+/).filter(Boolean);
        let best = 0;
        for (let w of words) {
            const maxLen = Math.max(w.length, query.length);
            if (maxLen === 0) continue;
            const dist = this.levenshtein(w, query);
            const score = Math.max(0, 1 - dist / maxLen);
            if (score > best) best = score;
        }
        return best;
    },

    getAllowedTypes: function() {
        const settings = this.getSearchSettings();
        const allowed = new Set();
        if (settings.searchSubjects !== false) allowed.add('subject');
        if (settings.searchTopics !== false) allowed.add('topic');
        return allowed;
    },

    // Поиск в базе данных с ранжированием и фильтрами
    // filterType: 'all' | 'subject' | 'topic' | 'test'
    search: function(query, filterType = 'all') {
        try {
            if (!query || query.trim().length === 0) return [];
            const settings = this.getSearchSettings();
            const q = query.toLowerCase().trim();
            const keywords = q.split(/\s+/).filter(k => k.length > 0);
            const allowFuzzy = settings.fuzzyEnabled !== false;
            const allowContent = settings.searchInContent !== false;
            const maxResults = Math.max(5, Math.min(50, Number(settings.maxResults || 15)));
            const allowedTypes = this.getAllowedTypes();

            const results = [];

            for (let item of this.searchDatabase) {
                if (filterType !== 'all' && item.type !== filterType) continue;
                if (filterType === 'all' && !allowedTypes.has(item.type)) continue;

                // Оценка по полям: заголовок(3), описание(2), content(1)
                let titleScore = 0, descScore = 0, contentScore = 0;
                for (let kw of keywords) {
                    const titleMatch = allowFuzzy ? this.matchScore(item.title || '', kw) : ((item.title || '').toLowerCase().includes(kw) ? 1 : 0);
                    const descMatch = allowFuzzy ? this.matchScore(item.description || '', kw) : ((item.description || '').toLowerCase().includes(kw) ? 1 : 0);
                    const contentMatch = allowContent
                        ? (allowFuzzy ? this.matchScore(item.content || '', kw) : ((item.content || '').toLowerCase().includes(kw) ? 1 : 0))
                        : 0;
                    titleScore = Math.max(titleScore, titleMatch);
                    descScore = Math.max(descScore, descMatch);
                    contentScore = Math.max(contentScore, contentMatch);
                }

                const totalScore = (3 * titleScore) + (2 * descScore) + (1 * contentScore);
                if (totalScore > 0) {
                    results.push(Object.assign({score: totalScore}, item));
                }
            }

            // Сортировать по score desc
            results.sort((a, b) => b.score - a.score);

            const limited = results.slice(0, maxResults);

            // Группировать: subjects -> topics
            const grouped = [];
            const subjects = limited.filter(r => r.type === 'subject');
            const topics = limited.filter(r => r.type === 'topic');

            grouped.push(...subjects, ...topics);
            return grouped;
        } catch (err) {
            console.error('Search error', err);
            return [];
        }
    },
    
    // Добавить в историю поиска
    addToHistory: function(query) {
        if (!this.searchHistory.includes(query)) {
            const historyLimit = Math.max(5, Math.min(50, Number(this.getSearchSettings().historyLength || 10)));
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > historyLimit) {
                this.searchHistory = this.searchHistory.slice(0, historyLimit);
            }
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        }
    },
    
    // Получить историю поиска
    getHistory: function() {
        const saved = localStorage.getItem('searchHistory');
        const historyLimit = Math.max(5, Math.min(50, Number(this.getSearchSettings().historyLength || 10)));
        return saved ? JSON.parse(saved).slice(0, historyLimit) : [];
    },
    
    // Подсветить найденные ключевые слова в тексте
    highlight: function(text, query) {
        // Сначала экранируем исходный текст, затем подсвечиваем совпадения
        return Safe.highlight(text, query);
    },

    // Показать результаты поиска с фильтрами
    showResults: function(query, filterType = 'all') {
        const results = this.search(query, filterType);
        const container = document.getElementById('search-results');

        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="search-no-results">❌ Ничего не найдено</div>';
            return;
        }

        // Добавить панель фильтров
        const filtersHtml = `
            <div class="search-filters">
                <button data-query="${Safe.esc(query)}" onclick="searchModule.showResults(this.dataset.query, 'all')">Все</button>
                <button data-query="${Safe.esc(query)}" onclick="searchModule.showResults(this.dataset.query, 'subject')">Предметы</button>
                <button data-query="${Safe.esc(query)}" onclick="searchModule.showResults(this.dataset.query, 'topic')">Темы</button>
            </div>
        `;

        container.innerHTML = filtersHtml + results.map(item => {
            const title = this.highlight(item.title || '', query);
            const desc = this.highlight((item.description || item.subjectName || ''), query);
            if (item.type === 'subject') {
                return `
                    <div class="search-result-item" onclick="searchModule.openSearchResult(${item.subjectId}, null, 'subject')">
                        <div class="result-icon">${item.icon}</div>
                        <div class="result-info">
                            <div class="result-title">📚 ${title}</div>
                            <div class="result-desc">${desc}</div>
                        </div>
                    </div>
                `;
            } else if (item.type === 'topic') {
                return `
                    <div class="search-result-item" onclick="searchModule.openSearchResult(${item.subjectId}, ${item.topicId}, 'topic')">
                        <div class="result-icon">${item.icon}</div>
                        <div class="result-info">
                            <div class="result-title">📖 ${title}</div>
                            <div class="result-desc">${desc}</div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    },

    // Открыть результат поиска (предмет / тема)
    // Комментарий: открывает соответствующий раздел и закрывает поиск
    openSearchResult: function(subjectId, topicId, type) {
        try {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';

            if (typeof navigationManager !== 'undefined') {
                navigationManager.goTo('subjects');
            }

            if (type === 'subject') {
                appData.currentSubject = subjectId;
                setTimeout(() => {
                    if (typeof subjectsModule !== 'undefined') subjectsModule.openSubject(subjectId);
                }, 50);
            } else if (type === 'topic') {
                appData.currentSubject = subjectId;
                appData.currentTopic = topicId;
                setTimeout(() => {
                    if (typeof topicsModule !== 'undefined') topicsModule.selectTopic(subjectId, topicId);
                }, 50);
            }
        } catch (err) {
            console.error('openSearchResult error', err);
        }
    },

    // Выбрать предмет из поиска
    selectSubject: function(subjectId) {
        appData.currentSubject = subjectId;
        navigationManager.goTo('subjects');
        setTimeout(() => {
            if (typeof subjectsModule !== 'undefined') {
                subjectsModule.openSubject(subjectId);
            }
        }, 100);
        this.closeSearch();
    },

    // Выбрать тему из поиска
    selectTopic: function(subjectId, topicId) {
        appData.currentSubject = subjectId;
        appData.currentTopic = topicId;
        navigationManager.goTo('subjects');
        setTimeout(() => {
            if (typeof topicsModule !== 'undefined') {
                topicsModule.selectTopic(subjectId, topicId);
            }
        }, 100);
        this.closeSearch();
    },

    // Открыть поиск
    openSearch: function() {
        const modal = document.getElementById('search-modal');
        const input = document.getElementById('search-input');
        
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => input?.focus(), 100);
            return;
        }

        if (typeof navigationManager !== 'undefined') {
            navigationManager.goTo('search');
            setTimeout(() => input?.focus(), 100);
        }
    },
    
    // Закрыть поиск
    closeSearch: function() {
        // Clear search input and go back  
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        if (typeof navigationManager !== 'undefined' && navigationManager.currentScreen === 'search' && navigationManager.history.length > 1) {
            navigationManager.goBack();
            return;
        }
        navigationManager.goTo('home');
    },
    
    // Обработчик ввода в поиск
    handleSearchInput: function(query) {
        if (query.length > 0) {
            this.addToHistory(query);
            this.showResults(query);
        } else {
            const container = document.getElementById('search-results');
            if (container) {
                const history = this.getHistory();
                if (history.length > 0) {
                    container.innerHTML = `
                        <div class="search-history-title">📋 История поиска:</div>
                        ${history.map(item => `
                            <div class="search-history-item" onclick="document.getElementById('search-input').value='" + item.replace(/'/g, "\'") + "'; searchModule.handleSearchInput('" + item.replace(/'/g, "\'") + "')">${item}</div>
                        `).join('')}
                    `;
                } else {
                    container.innerHTML = '<div class="search-hint">💡 Введите запрос для поиска по приложению</div>';
                }
            }
        }
    },
    
    // Выполнить поиск (Enter)
    performSearch: function(query) {
        if (query.trim()) {
            this.handleSearchInput(query);
        }
    }
};

