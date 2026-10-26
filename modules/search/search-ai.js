// ============================================
// Knowledge Search Module - Поиск по данным приложения
// ============================================

const aiSearchModule = {
    appData: null,
    searchDatabase: [],
    uploadedFiles: [],
    aiContext: {},
    assistantMode: 'study',
    internetEnabled: false,
    
    init: function(appData) {
        this.appData = appData;
        this.loadUploadedFiles();
        this.indexKnowledgeFiles();
        this.buildSearchDatabase();
        this.assistantMode = localStorage.getItem('assistantMode') || 'study';
        this.internetEnabled = localStorage.getItem('assistantInternetEnabled') === 'true';
        console.log('✓ Knowledge Search Module Initialized');
    },

    setAssistantMode: function(mode) {
        this.assistantMode = mode === 'developer' ? 'developer' : 'study';
        localStorage.setItem('assistantMode', this.assistantMode);
    },

    setInternetEnabled: function(enabled) {
        this.internetEnabled = Boolean(enabled);
        localStorage.setItem('assistantInternetEnabled', String(this.internetEnabled));
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

    syncAppState: function() {
        if (!this.appData) return;
        this.appData.knowledgeFiles = this.normalizeUploadedFiles(this.uploadedFiles);
        this.appData.searchSettings = typeof normalizeSearchSettings === 'function'
            ? normalizeSearchSettings(this.appData.searchSettings)
            : (this.appData.searchSettings || {});
    },

    normalizeUploadedFiles: function(files) {
        if (!Array.isArray(files)) return [];

        return files
            .filter(file => file && typeof file === 'object')
            .map(file => ({
                id: file.id || Date.now(),
                name: file.name || 'Без названия',
                type: file.type || 'unknown',
                kind: file.kind || file.type || 'file',
                content: file.content || '',
                summary: file.summary || file.uploadedContent || file.content || '',
                uploadDate: file.uploadDate || new Date().toLocaleString('ru-RU'),
                size: Number(file.size || 0),
                tags: Array.isArray(file.tags) ? file.tags : this.extractKeywords(`${file.name || ''} ${file.content || ''}`),
                analysisMode: file.analysisMode || (file.kind === 'image' || file.kind === 'video' ? 'metadata-only' : 'text-extracted')
            }));
    },
    
    // Построить базу данных для поиска
    buildSearchDatabase: function() {
        this.searchDatabase = [];
        
        for (let subjectId in (this.appData.subjects || {})) {
            const subject = this.appData.subjects[subjectId];

            if (subject.topics && Array.isArray(subject.topics)) {
                subject.topics.forEach((topic, topicIndex) => {
                    this.searchDatabase.push({
                        type: 'topic',
                        subjectId: subjectId,
                        topicId: topicIndex,
                        title: topic.title,
                        subjectName: subject.title,
                        content: topic.content,
                        icon: subject.icon,
                        searchText: `${topic.title} ${subject.title}`.toLowerCase()
                    });
                });
            }
        }
    },
    
    // Главная функция поиска
    aiSearch: async function(query) {
        if (this.assistantMode === 'developer' && typeof developerMode !== 'undefined' && developerMode.isActive) {
            return this.generateDeveloperResponse(query);
        }
        return this.searchKnowledge(query);
    },

    generateDeveloperResponse: async function(query) {
        const weakTests = (appData.tests || [])
            .map(test => {
                const attempts = (typeof authenticationModule !== 'undefined' ? authenticationModule.getAllStudents() : [])
                    .flatMap(student => (student.progress?.testResults || []).filter(result => result.testId === test.id));
                const average = attempts.length
                    ? Math.round(attempts.reduce((sum, result) => sum + (result.score || 0), 0) / attempts.length)
                    : 0;
                return { title: test.title, attempts: attempts.length, average };
            })
            .filter(test => test.attempts > 0)
            .sort((a, b) => a.average - b.average)
            .slice(0, 3);

        const suggestions = [
            `Сейчас в приложении ${(appData.tests || []).length} тестов, ${(appData.customScreens || []).length} кастомных экранов и ${(appData.knowledgeFiles || []).length} файлов базы знаний.`,
            weakTests.length
                ? `Слабее всего группа проходит: ${weakTests.map(test => `${test.title} (${test.average}%)`).join(', ')}.`
                : 'Для группы пока мало попыток, чтобы уверенно находить слабые места.',
            'Для следующего шага полезно проверять связку контент → тест → аналитика → экспорт, а не только отдельные экраны.'
        ];

        let onlineNotes = [];
        if (this.internetEnabled) {
            onlineNotes = await this.fetchOnlineContext(query);
        }

        return {
            type: 'developer-response',
            query,
            analysis: [
                `Стратегический режим разработчика активен.`,
                `Запрос: ${query}.`,
                ...suggestions,
                onlineNotes.length ? `Онлайн-контекст: ${onlineNotes.join(' ')}` : 'Интернет-контекст выключен, вывод построен только на данных приложения.'
            ].join('\n\n'),
            results: [],
            recommendations: [
                'Проверьте, как новая функция влияет на студенческий сценарий, а не только на dev UI.',
                'Фиксируйте изменения через снимки dev mode перед крупным редактированием.',
                'Сначала усиливайте слабые тесты и аналитику преподавателя, затем расширяйте контент.'
            ],
            internetEnabled: this.internetEnabled
        };
    },

    fetchOnlineContext: async function(query) {
        try {
            const url = `https://ru.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&namespace=0&format=json&origin=*`;
            const response = await fetch(url);
            const data = await response.json();
            const titles = Array.isArray(data?.[1]) ? data[1] : [];
            const descriptions = Array.isArray(data?.[2]) ? data[2] : [];
            return titles.map((title, index) => `${title}: ${descriptions[index] || 'краткое описание недоступно'}`).filter(Boolean);
        } catch (error) {
            console.warn('Online context failed', error);
            return ['Не удалось получить внешний контекст.'];
        }
    },

    // Поиск по знаниям
    searchKnowledge: function(query) {
        // Ключевые слова для поиска
        const settings = this.getSearchSettings();
        const keywords = this.extractKeywords(query);
        const results = this.smartSearch(query);
        const knowledgeHits = this.searchUploadedFiles(query);
        const maxResults = Math.max(5, Math.min(50, Number(settings.maxResults || 15)));
        const mergedResults = [...results, ...knowledgeHits]
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, maxResults);
        
        return {
            type: 'knowledge-response',
            query: query,
            keywords: keywords,
            results: mergedResults,
            analysis: this.generateAnalysis(keywords, results, knowledgeHits),
            relatedTopics: this.findRelatedTopics(keywords),
            recommendations: this.getRecommendations(keywords),
            uploadedFiles: this.uploadedFiles
        };
    },
    
    // Извлечение ключевых слов из запроса
    extractKeywords: function(query) {
        const stopWords = ['что', 'как', 'где', 'когда', 'почему', 'какой', 'какая', 'какие', 'это', 'есть', 'у', 'в', 'на', 'для', 'с'];
        const words = query.toLowerCase().split(/\s+/);
        return words.filter(w => w.length > 2 && !stopWords.includes(w));
    },
    
    // Умный поиск по базе данных
    smartSearch: function(query) {
        const searchQuery = query.toLowerCase();
        const keywords = this.extractKeywords(query);

        // Поиск по точному совпадению
        const exactMatches = this.searchDatabase
            .map(item => {
                let score = 0;
                if (item.searchText.includes(searchQuery)) score += 10;
                if (item.title.toLowerCase().includes(searchQuery)) score += 4;
                score += keywords.reduce((total, keyword) => total + (item.searchText.includes(keyword) ? 2 : 0), 0);
                return score > 0 ? { ...item, score } : null;
            })
            .filter(Boolean);
        
        // Поиск по отдельным словам
        const keywordMatches = this.searchDatabase
            .map(item => {
                const score = keywords.reduce((total, keyword) => {
                    const inTitle = item.title.toLowerCase().includes(keyword) ? 3 : 0;
                    const inSearchText = item.searchText.includes(keyword) ? 1 : 0;
                    return total + inTitle + inSearchText;
                }, 0);
                return score > 0 ? { ...item, score } : null;
            })
            .filter(Boolean);
        
        // Объединение результатов с приоритизацией
        const allMatches = [...exactMatches, ...keywordMatches];
        const uniqueMatches = allMatches.filter((item, index, self) => 
            index === self.findIndex(t => t.subjectId === item.subjectId && t.topicId === item.topicId)
        );
        
        return uniqueMatches
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 10); // Вернуть топ 10 результатов
    },

    searchUploadedFiles: function(query) {
        const q = query.toLowerCase().trim();
        if (!q) return [];

        return this.uploadedFiles
            .map(file => {
                const haystack = `${file.name} ${file.summary || ''} ${file.content || ''} ${file.type || ''} ${(file.tags || []).join(' ')}`.toLowerCase();
                const keywords = this.extractKeywords(query);
                let score = 0;

                if (haystack.includes(q)) score += 8;
                score += keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 2 : 0), 0);

                if (score <= 0) {
                    return null;
                }

                return {
                    type: 'file',
                    title: file.name,
                    categoryLabel: file.kind || 'Файл',
                    subjectName: file.type || 'Данные',
                    icon: this.getFileEmoji(file),
                    content: file.summary || file.content || 'Нет текста для предварительного просмотра',
                    source: 'local-file',
                    fileId: file.id,
                    tags: file.tags || [],
                    analysisMode: file.analysisMode || 'metadata',
                    score
                };
            })
            .filter(Boolean);
    },
    
    // Генерирование локального анализа
    generateAnalysis: function(keywords, topicResults, fileResults) {
        const total = topicResults.length + fileResults.length;
        if (total === 0) {
            return '❌ По этому запросу ничего не найдено среди предметов, тем и загруженных файлов.';
        }

        const topResult = topicResults[0] || fileResults[0];
        const sourceLabel = topResult.type === 'file' ? 'загруженного файла' : 'предмета';
        const preview = (topResult.content || '').substring(0, 300);
        return `✅ Найдено ${total} результатов.

🎯 Основной результат: "${topResult.title}" из ${sourceLabel}
📚 Источник: ${topResult.categoryLabel || topResult.subjectName || 'Локальная база'}

${preview}${preview.length >= 300 ? '...' : ''}`;
    },
    
    // Поиск связанных тем
    findRelatedTopics: function(keywords) {
        const relatedSet = new Set();
        
        keywords.forEach(keyword => {
            this.searchDatabase.forEach(item => {
                if (item.searchText.includes(keyword)) {
                    relatedSet.add(`${item.title} (${item.subjectName})`);
                }
            });
        });
        
        return Array.from(relatedSet).slice(0, 5);
    },
    
    // Рекомендации для дальнейшего обучения
    getRecommendations: function(keywords) {
        return [
            '💡 Совет: Изучите теорию перед практическим применением',
            '📖 Рекомендуем: Прочитайте полный контент этой темы',
            '🎯 Задание: Попробуйте применить знания в интерактивном уроке',
            '📝 Проверка: Пройдите тест по этой теме'
        ];
    },
    
    // ============================================
    // Управление загруженными файлами
    // ============================================
    
    // Загрузить файл (PDF, Word, PPT, изображения, видео и прочие файлы)
    async uploadAndParseFile(file) {
        const fileType = this.getFileType(file.name);
        let content = '';
        let kind = 'document';
        let analysisMode = 'metadata';
        
        try {
            // Парсинг в зависимости от типа файла
            if (fileType === 'pdf') {
                content = await this.parsePDF(file);
                kind = 'pdf';
                analysisMode = 'text-extracted';
            } else if (fileType === 'docx' || fileType === 'doc') {
                content = await this.parseWord(file);
                kind = 'word';
                analysisMode = 'text-extracted';
            } else if (fileType === 'pptx' || fileType === 'ppt') {
                content = await this.parsePowerPoint(file);
                kind = 'presentation';
                analysisMode = 'text-extracted';
            } else if (fileType === 'txt') {
                content = await this.parseText(file);
                kind = 'text';
                analysisMode = 'text-extracted';
            } else if (fileType === 'image') {
                content = `Изображение: ${file.name}`;
                kind = 'image';
                analysisMode = 'metadata-only';
            } else if (fileType === 'video') {
                content = `Видео: ${file.name}`;
                kind = 'video';
                analysisMode = 'metadata-only';
            } else {
                content = `Файл: ${file.name}`;
                kind = 'file';
                analysisMode = 'metadata-only';
            }
            
            // Сохранение файла в памяти
            const uploadedFile = {
                id: Date.now(),
                name: file.name,
                type: fileType,
                kind: kind,
                content: content,
                uploadDate: new Date().toLocaleString('ru-RU'),
                size: file.size,
                summary: content.substring(0, 500),
                tags: this.extractKeywords(`${file.name} ${content}`),
                analysisMode
            };
            
            this.uploadedFiles.push(uploadedFile);
            this.saveUploadedFiles();
            
            return {
                success: true,
                fileId: uploadedFile.id,
                fileName: uploadedFile.name,
                content: content,
                message: `✅ Файл '${file.name}' успешно загружен и обработан`
            };
            
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            return {
                success: false,
                error: `❌ Ошибка при обработке файла: ${error.message}`
            };
        }
    },
    
    // Определить тип файла
    getFileType: function(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'pdf',
            'doc': 'doc',
            'docx': 'docx',
            'ppt': 'ppt',
            'pptx': 'pptx',
            'txt': 'txt',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'webp': 'image',
            'mp4': 'video',
            'webm': 'video',
            'ogg': 'video'
        };
        return typeMap[ext] || 'unknown';
    },
    
    // Парсинг текстовых файлов (TXT)
    parseText: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },
    
    // Парсинг PDF файлов (требует PDF.js)
    parsePDF: async function(file) {
        // Создаём URL для файла
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    // Используем pdfjs-dist если доступно
                    if (typeof pdfjsLib !== 'undefined') {
                        const pdf = await pdfjsLib.getDocument(new Uint8Array(e.target.result)).promise;
                        let fullText = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(item => item.str).join(' ');
                            fullText += pageText + '\n';
                        }
                        resolve(fullText);
                    } else {
                        resolve('[PDF контент - требуется подключить pdf.js библиотеку]');
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    },
    
    // Парсинг Word документов (требует mammoth)
    parseWord: async function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    if (typeof mammoth !== 'undefined') {
                        const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
                        resolve(result.value);
                    } else {
                        resolve('[Word контент - требуется подключить mammoth.js библиотеку]');
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    },
    
    // Парсинг PowerPoint файлов (требуется PptxParser)
    parsePowerPoint: async function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    if (typeof PptxParser !== 'undefined') {
                        const parser = new PptxParser();
                        const pptx = await parser.parseArrayBuffer(e.target.result);
                        let fullText = '';
                        pptx.slides.forEach((slide, index) => {
                            fullText += `\n=== Слайд ${index + 1} ===\n`;
                            slide.forEach(shape => {
                                if (shape.text) {
                                    fullText += shape.text + '\n';
                                }
                            });
                        });
                        resolve(fullText);
                    } else {
                        resolve('[PowerPoint контент - требуется подключить pptxparser библиотека]');
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    },
    
    // ============================================
    // Автоматическое распределение по темам
    // ============================================
    
    // Распределить информацию из файла по темам
    async distributeContentToTopics(fileContent) {
        const paragraphs = fileContent.split(/\n\n+/).filter(p => p.trim());
        const distribution = {
            newTopics: [],
            updatedTopics: [],
            analysis: ''
        };
        
        // Анализ каждого параграфа
        for (const paragraph of paragraphs) {
            const analysis = this.analyzeParagraph(paragraph);
            
            if (analysis.relevance > 0.6) {
                // Найти подходящую тему
                const bestMatch = this.findBestTopicMatch(analysis.keywords, paragraph);
                
                if (bestMatch) {
                    distribution.updatedTopics.push({
                        topicId: bestMatch.topicId,
                        subjectId: bestMatch.subjectId,
                        newContent: paragraph,
                        confidence: analysis.relevance
                    });
                } else if (analysis.isNewTopic) {
                    distribution.newTopics.push({
                        title: analysis.suggestedTitle,
                        content: paragraph,
                        keywords: analysis.keywords,
                        confidence: analysis.relevance
                    });
                }
            }
        }
        
        distribution.analysis = `✅ Анализ завершён:
        - Обновлено тем: ${distribution.updatedTopics.length}
        - Предложено новых тем: ${distribution.newTopics.length}
        - Всего параграфов обработано: ${paragraphs.length}`;
        
        return distribution;
    },
    
    // Анализ одного параграфа
    analyzeParagraph: function(text) {
        const words = text.toLowerCase().split(/\s+/);
        const medicalTerms = ['боль', 'лечение', 'болезнь', 'симптом', 'диагноз', 'пациент', 'врач', 'орган', 'система', 'инфекция', 'вирус', 'бактерия', 'лекарство'];
        const foundTerms = words.filter(w => medicalTerms.some(term => w.includes(term)));
        
        const relevance = Math.min(foundTerms.length / words.length * 10, 1);
        const wordCount = words.length;
        const isNewTopic = wordCount > 50; // Параграф достаточно большой для новой темы
        
        // Генерирование предложенного названия темы
        const suggestedTitle = text.split('\n')[0].substring(0, 50).trim() || 'Новая тема';
        
        return {
            relevance: relevance,
            keywords: foundTerms.slice(0, 5),
            isNewTopic: isNewTopic,
            suggestedTitle: suggestedTitle,
            wordCount: wordCount
        };
    },
    
    // Найти лучшее соответствие существующей теме
    findBestTopicMatch: function(keywords, content) {
        let bestMatch = null;
        let bestScore = 0;
        
        this.searchDatabase.forEach(item => {
            let score = 0;
            
            // Проверка ключевых слов
            keywords.forEach(keyword => {
                if (item.searchText.includes(keyword)) {
                    score += 1;
                }
            });
            
            // Проверка содержания
            if (content.toLowerCase().includes(item.title.toLowerCase())) {
                score += 2;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        });
        
        return bestScore > 0 ? bestMatch : null;
    },
    
    // ============================================
    // Сохранение и загрузка файлов
    // ============================================
    
    saveUploadedFiles: function() {
        if (typeof localStorage !== 'undefined') {
            this.syncAppState();
            localStorage.setItem('uploadedFiles', JSON.stringify(this.uploadedFiles));
        }
    },
    
    loadUploadedFiles: function() {
        if (this.appData && Array.isArray(this.appData.knowledgeFiles)) {
            this.uploadedFiles = this.normalizeUploadedFiles(this.appData.knowledgeFiles);
            return;
        }

        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('uploadedFiles');
            if (saved) {
                this.uploadedFiles = this.normalizeUploadedFiles(JSON.parse(saved));
                this.syncAppState();
            }
        }
    },

    indexKnowledgeFiles: function() {
        this.uploadedFiles = this.normalizeUploadedFiles(this.uploadedFiles);
        this.syncAppState();
    },

    getFileEmoji: function(file) {
        if (!file) return '📄';
        if (file.kind === 'video' || file.type === 'video') return '🎬';
        if (file.kind === 'image' || file.type === 'image') return '🖼️';
        if (file.type === 'pdf') return '📄';
        if (file.type === 'ppt' || file.type === 'pptx') return '📊';
        if (file.type === 'doc' || file.type === 'docx') return '📝';
        return '📚';
    },
    
    // Получить загруженные файлы
    getUploadedFiles: function() {
        return this.uploadedFiles;
    },
    
    // Удалить загруженный файл
    deleteUploadedFile: function(fileId) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
        this.saveUploadedFiles();
        this.syncAppState();
    }
};

window.knowledgeSearchModule = aiSearchModule;
