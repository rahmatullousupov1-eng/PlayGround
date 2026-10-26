// ============================================
// Knowledge Search UI Module - Интерфейс локального поиска по данным
// ============================================

const aiSearchUI = {
    aiSearchModule: null,
    currentResults: [],
    
    init: function(aiSearchModule) {
        this.aiSearchModule = aiSearchModule;
        this.setupEventListeners();
        this.syncAssistantControls();
        window.knowledgeSearchUI = this;
        console.log('✓ Knowledge Search UI Initialized');
    },
    
    // Установка слушателей событий для нового экрана
    setupEventListeners: function() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
            
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }
    },

    syncAssistantControls: function() {
        const studyBtn = document.getElementById('assistant-mode-study');
        const developerBtn = document.getElementById('assistant-mode-developer');
        const internetToggle = document.getElementById('assistant-internet-toggle');
        const internetWrap = document.getElementById('assistant-internet-wrap');
        const devOpenBtn = document.getElementById('knowledge-dev-open-btn');
        const mode = this.aiSearchModule?.assistantMode || 'study';
        const canUseDeveloper = typeof developerMode !== 'undefined' && developerMode.isActive;

        if (studyBtn) studyBtn.classList.toggle('active', mode !== 'developer');
        if (developerBtn) {
            developerBtn.classList.toggle('active', mode === 'developer');
            developerBtn.disabled = !canUseDeveloper;
            developerBtn.style.display = canUseDeveloper ? 'inline-flex' : 'none';
        }
        if (internetWrap) {
            internetWrap.style.display = canUseDeveloper && mode === 'developer' ? 'flex' : 'none';
        }
        if (devOpenBtn) {
            devOpenBtn.style.display = canUseDeveloper ? 'inline-flex' : 'none';
        }
        if (internetToggle) {
            internetToggle.checked = Boolean(this.aiSearchModule?.internetEnabled);
        }
    },

    switchAssistantMode: function(mode) {
        if (!this.aiSearchModule) return;
        if (mode === 'developer' && (typeof developerMode === 'undefined' || !developerMode.isActive)) {
            this.showError('❌ Dev-режим ассистента доступен только при активном режиме разработчика');
            return;
        }
        this.aiSearchModule.setAssistantMode(mode);
        this.syncAssistantControls();
    },

    toggleInternetAccess: function(enabled) {
        if (!this.aiSearchModule) return;
        this.aiSearchModule.setInternetEnabled(enabled);
        this.syncAssistantControls();
    },
    
    // Обработать ввод в поиск (для реал-тайм предложений)
    handleSearchInput: function(value) {
        if (!value || value.length < 2) {
            // Очистить предложения если ввод слишком короткий
            return;
        }
        // Можно добавить REAL-TIME предложения если нужно
    },
    
    // Выполнить поиск
    async performSearch(query) {
        if (!query) {
            query = document.getElementById('search-input').value.trim();
        }
        
        if (!query) {
            alert('⚠️ Пожалуйста, введите вопрос');
            return;
        }
        
        // Показать загрузку
        this.showLoading();
        
        try {
            // Выполнить локальный поиск по данным
            const result = await this.aiSearchModule.aiSearch(query);
            
            // Обработать результаты
            this.displayResults(result);
            
            // Сохранить в историю
            this.saveToHistory(query, result);
            
        } catch (error) {
            console.error('Ошибка при поиске:', error);
            this.showError('❌ Ошибка при выполнении поиска');
        }
    },
    
    // Показать загрузку
    showLoading: function() {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = `
                <div class="search-loading">
                    <div class="spinner"></div>
                    <p>⏳ Поиск анализирует локальные данные...</p>
                </div>
        `;
    },
    
    // Отобразить результаты
    displayResults: function(result) {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = '';
        
        if (!result) {
            this.showError('❌ Ошибка: результат не получен');
            return;
        }
        
        // special developer mode trigger
        if (result.type === 'knowledge-response' || result.type === 'developer-response') {
            this.displayAIResponse(result, resultsDiv);
        } else if (result.type === 'file-processing') {
            this.displayFileWaiting(result, resultsDiv);
        } else {
            this.displaySearchResults(result, resultsDiv);
        }
    },
    
    // Отобразить локальный ответ
    displayAIResponse: function(result, container) {
        const aiResponseHtml = `
            <div class="ai-response-container">
                <div class="ai-response-header">
                    <span class="ai-icon">${result.type === 'developer-response' ? '🧠' : '🔎'}</span>
                    <span>${result.type === 'developer-response' ? 'Dev-ассистент' : 'Локальный анализ'}</span>
                </div>
                <p class="ai-response-text" style="white-space: pre-line;">${Safe.esc(result.analysis)}</p>
                
                ${result.recommendations && result.recommendations.length > 0 ? `
                    <div class="recommendations">
                        <h4>💡 Рекомендации:</h4>
                        ${result.recommendations.map(rec => `
                            <div class="recommendation-item">✓ ${Safe.esc(rec)}</div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        container.innerHTML = aiResponseHtml;
        
        // Добавить результаты под ответом
        if (result.results && result.results.length > 0) {
            const resultsHtml = result.results.map((item, index) => 
                this.generateResultCard(item, index)
            ).join('');
            container.innerHTML += resultsHtml;
        }
    },
    
    // Отобразить ожидание файла
    displayFileWaiting: function(result, container) {
        const html = `
            <div class="file-waiting-container">
                <div class="waiting-icon">📂</div>
                <h3>${Safe.esc(result.message)}</h3>
                <p>Добавьте нужный файл в локальную базу знаний. PDF, Word и презентации индексируются по тексту; изображения и видео пока ищутся по имени, тегам и метаданным.</p>
                ${typeof developerMode !== 'undefined' && developerMode.isActive ? `
                    <button class="dev-mode-btn" onclick="developerMode.showScreen()">
                        📂 Открыть редактор данных
                    </button>
                ` : ''}
            </div>
        `;
        container.innerHTML = html;
    },
    
    // Отобразить результаты поиска
    displaySearchResults: function(results, container) {
        if (!results || results.length === 0) {
            container.innerHTML = `
                <div class="search-empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">Результаты не найдены</div>
                    <div class="empty-subtext">Попробуйте переформулировать ваш запрос или используйте более точные ключевые слова</div>
                </div>
            `;
            return;
        }
        
        const resultsHtml = results.map((item, index) => 
            this.generateResultCard(item, index)
        ).join('');
        
        container.innerHTML = resultsHtml;
    },
    
    // Генерировать карточку результата
    generateResultCard: function(item, index) {
        const icon = item.icon || (item.type === 'file' ? '📎' : '📖');
        const title = item.title || 'Без названия';
        const categoryName = item.categoryLabel || item.subjectName || 'Общее';
        const subjectName = item.categoryLabel ? (item.subjectName || '') : '';
        const content = item.content || 'Нет описания';
        const truncatedContent = content.substring(0, 200) + (content.length > 200 ? '...' : '');
        const scoreBadge = item.score ? `<span class="keyword-tag">Релевантность ${item.score}</span>` : '';
        const analysisBadge = item.analysisMode ? `<span class="keyword-tag">${item.analysisMode === 'text-extracted' ? 'Текст проиндексирован' : 'Метаданные'}</span>` : '';
        
        return `
            <div class="result-item">
                <div class="result-header-section">
                    <span class="result-icon">${icon}</span>
                    <div class="result-title-section">
                        <h3 class="result-title">${Safe.esc(title)}</h3>
                        <span class="result-category">📚 ${Safe.esc(categoryName)}${subjectName ? ` · ${Safe.esc(subjectName)}` : ''}</span>
                    </div>
                </div>
                
                <div class="result-desc">${Safe.esc(truncatedContent)}</div>
                
                <div class="result-keywords">
                    ${scoreBadge}
                    ${analysisBadge}
                    ${this.generateTags(item).map(tag => 
                        `<span class="keyword-tag">${Safe.esc(tag)}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    },
    
    // Генерировать теги для результата
    generateTags: function(item) {
        const title = item.title || '';
        const words = title.toLowerCase().split(' ');
        const tags = words.filter(w => w.length > 3).slice(0, 3);
        if (item.subjectName) tags.unshift(item.subjectName);
        return [...new Set(tags)].slice(0, 4);
    },

    handleKnowledgeUpload: async function(event) {
        const files = Array.from(event.target.files || []);
        const status = document.getElementById('knowledge-upload-status');
        if (!files.length) return;

        if (status) status.textContent = `⏳ Обрабатываю ${files.length} файла(ов)...`;

        const results = [];
        for (const file of files) {
            const result = await this.aiSearchModule.uploadAndParseFile(file);
            results.push(result);
        }

        const successCount = results.filter(item => item && item.success).length;
        if (status) {
            status.textContent = `✅ Добавлено ${successCount} из ${files.length} файлов. Данные проиндексированы локально.`;
        }

        this.aiSearchModule.buildSearchDatabase();
        this.aiSearchModule.indexKnowledgeFiles();
        event.target.value = '';

        const query = document.getElementById('search-input')?.value?.trim();
        if (query) {
            await this.performSearch(query);
        }
    },
    
    // Показать ошибку
    showError: function(message) {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = `
            <div class="search-error-container">
                <div class="error-icon">❌</div>
                <h3>Ошибка</h3>
                <p>${message}</p>
            </div>
        `;
    },
    
    // Сохранить в историю
    saveToHistory: function(query, result) {
        try {
            let history = JSON.parse(localStorage.getItem('aiSearchHistory') || '[]');
            const settings = this.aiSearchModule && typeof this.aiSearchModule.getSearchSettings === 'function'
                ? this.aiSearchModule.getSearchSettings()
                : {};
            const historyLimit = Math.max(5, Math.min(50, Number(settings.historyLength || 10)));
            history.unshift({
                query: query,
                resultCount: result.results ? result.results.length : 0,
                timestamp: new Date().toISOString()
            });
            history = history.slice(0, historyLimit);
            localStorage.setItem('aiSearchHistory', JSON.stringify(history));
        } catch (error) {
            console.log('Ошибка при сохранении истории:', error);
        }
    }
};
