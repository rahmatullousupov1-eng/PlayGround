// Invictus Center - Photo-based Test Module with hybrid questions
const invictusCenterModule = {
    currentSubject: 'histology',
    currentQuestionIndex: 0,
    userAnswers: {},
    testStartTime: null,
    
    // Test data with mixed images and text questions
    subjects: {
        histology: {
            title: 'Гистология',
            icon: '🔬',
            description: 'Изучение строения тканей организма',
            tests: [
                {
                    id: 'h1',
                    title: 'Эпителиальная ткань',
                    questions: [
                        {
                            id: 1,
                            image: 'https://via.placeholder.com/400x300/4a90e2/ffffff?text=Epithelial+Tissue',
                            text: 'Какой тип эпителия изображен на микрофотографии?',
                            answers: [
                                { id: 'a', text: 'Однослойный кубический', correct: false },
                                { id: 'b', text: 'Многослойный плоский', correct: true },
                                { id: 'c', text: 'Однослойный цилиндрический', correct: false },
                                { id: 'd', text: 'Переходный', correct: false }
                            ]
                        },
                        {
                            id: 2,
                            text: 'Какие клетки входят в состав эпителия?',
                            answers: [
                                { id: 'a', text: 'Только соматические', correct: false },
                                { id: 'b', text: 'Плотно прилегающие друг к другу клетки на базовой мембране', correct: true },
                                { id: 'c', text: 'Изолированные клетки', correct: false },
                                { id: 'd', text: 'Клетки с жировыми включениями', correct: false }
                            ]
                        },
                        {
                            id: 3,
                            image: 'https://via.placeholder.com/400x300/7cb342/ffffff?text=Columnar+Epithelium',
                            text: 'Это клетки какого типа эпителия?',
                            answers: [
                                { id: 'a', text: 'Кубический', correct: false },
                                { id: 'b', text: 'Цилиндрический', correct: true },
                                { id: 'c', text: 'Плоский', correct: false },
                                { id: 'd', text: 'Железистый', correct: false }
                            ]
                        },
                        {
                            id: 4,
                            text: 'Какую функцию выполняет кубический эпителий?',
                            answers: [
                                { id: 'a', text: 'Защита от механического воздействия', correct: false },
                                { id: 'b', text: 'Выстилка и защита выводных протоков', correct: true },
                                { id: 'c', text: 'Газообмен', correct: false },
                                { id: 'd', text: 'Проведение импульсов', correct: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'h2',
                    title: 'Соединительная ткань',
                    questions: [
                        {
                            id: 1,
                            image: 'https://via.placeholder.com/400x300/e74c3c/ffffff?text=Bone+Structure',
                            text: 'Какая соединительная ткань показана?',
                            answers: [
                                { id: 'a', text: 'Хрящевая', correct: false },
                                { id: 'b', text: 'Костная', correct: true },
                                { id: 'c', text: 'Соединительная рыхлая', correct: false },
                                { id: 'd', text: 'Жировая', correct: false }
                            ]
                        },
                        {
                            id: 2,
                            text: 'Какие неорганические вещества входят в состав костной ткани?',
                            answers: [
                                { id: 'a', text: 'Только белки', correct: false },
                                { id: 'b', text: 'Фосфат и карбонат кальция', correct: true },
                                { id: 'c', text: 'Жиры и углеводы', correct: false },
                                { id: 'd', text: 'Вода и минеральные соли', correct: false }
                            ]
                        },
                        {
                            id: 3,
                            image: 'https://via.placeholder.com/400x300/9b59b6/ffffff?text=Cartilage',
                            text: 'Какой тип соединительной ткани показан?',
                            answers: [
                                { id: 'a', text: 'Сухожилие', correct: false },
                                { id: 'b', text: 'Связка', correct: false },
                                { id: 'c', text: 'Хрящ', correct: true },
                                { id: 'd', text: 'Кость', correct: false }
                            ]
                        }
                    ]
                }
            ]
        },
        pathoanatomy: {
            title: 'Патанатомия',
            icon: '🩺',
            description: 'Изучение патологических изменений тканей и органов',
            tests: [
                {
                    id: 'p1',
                    title: 'Воспалительные процессы',
                    questions: [
                        {
                            id: 1,
                            image: 'https://via.placeholder.com/400x300/c0392b/ffffff?text=Acute+Inflammation',
                            text: 'Какое воспалительное изменение показано на микрофотографии?',
                            answers: [
                                { id: 'a', text: 'Острое воспаление', correct: true },
                                { id: 'b', text: 'Хроническое воспаление', correct: false },
                                { id: 'c', text: 'Гранулема', correct: false },
                                { id: 'd', text: 'Фиброз', correct: false }
                            ]
                        },
                        {
                            id: 2,
                            text: 'Какие медиаторы воспаления выделяются при остром воспалении?',
                            answers: [
                                { id: 'a', text: 'Только ферменты', correct: false },
                                { id: 'b', text: 'Гистамин, цитокины, простагландины', correct: true },
                                { id: 'c', text: 'Только белки', correct: false },
                                { id: 'd', text: 'Жиры и углеводы', correct: false }
                            ]
                        },
                        {
                            id: 3,
                            image: 'https://via.placeholder.com/400x300/e67e22/ffffff?text=Chronic+Inflammation',
                            text: 'Какие клетки преобладают при хроническом воспалении?',
                            answers: [
                                { id: 'a', text: 'Нейтрофилы', correct: false },
                                { id: 'b', text: 'Лимфоциты и макрофаги', correct: true },
                                { id: 'c', text: 'Эозинофилы', correct: false },
                                { id: 'd', text: 'Базофилы', correct: false }
                            ]
                        },
                        {
                            id: 4,
                            text: 'Сколько стадий имеет воспалительный процесс?',
                            answers: [
                                { id: 'a', text: '2', correct: false },
                                { id: 'b', text: '3', correct: true },
                                { id: 'c', text: '4', correct: false },
                                { id: 'd', text: '5', correct: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'p2',
                    title: 'Дегенеративные изменения',
                    questions: [
                        {
                            id: 1,
                            image: 'https://via.placeholder.com/400x300/8e44ad/ffffff?text=Necrosis',
                            text: 'Какой тип повреждения ткани показан?',
                            answers: [
                                { id: 'a', text: 'Атрофия', correct: false },
                                { id: 'b', text: 'Некроз', correct: true },
                                { id: 'c', text: 'Дистрофия', correct: false },
                                { id: 'd', text: 'Гиперплазия', correct: false }
                            ]
                        },
                        {
                            id: 2,
                            text: 'Какой тип некроза является специфичным для туберкулеза?',
                            answers: [
                                { id: 'a', text: 'Коагуляционный', correct: false },
                                { id: 'b', text: 'Казеозный (творожистый)', correct: true },
                                { id: 'c', text: 'Колликвационный', correct: false },
                                { id: 'd', text: 'Гангрена', correct: false }
                            ]
                        },
                        {
                            id: 3,
                            image: 'https://via.placeholder.com/400x300/16a085/ffffff?text=Fibrosis',
                            text: 'Это изменение характеризует процесс:',
                            answers: [
                                { id: 'a', text: 'Восстановления ткани', correct: false },
                                { id: 'b', text: 'Фиброза с рубцеванием', correct: true },
                                { id: 'c', text: 'Активного воспаления', correct: false },
                                { id: 'd', text: 'Острого повреждения', correct: false }
                            ]
                        },
                        {
                            id: 4,
                            text: 'Какие клетки участвуют в рубцевании?',
                            answers: [
                                { id: 'a', text: 'Только фибробласты', correct: false },
                                { id: 'b', text: 'Фибробласты, миофибробласты, эндотелиальные клетки', correct: true },
                                { id: 'c', text: 'Только макрофаги', correct: false },
                                { id: 'd', text: 'Эпителиальные клетки', correct: false }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    
    init: function() {
        console.log('✓ Invictus Center Module Initialized');
    },
    
    // Show main Invictus Center screen with subject selection
    show: function() {
        const content = document.getElementById('tests-content');
        if (!content) return;
        
        let html = `
            <div class="invictus-center-container">
                <button class="btn-back" onclick="testCategoriesModule.show()">← Назад к категориям</button>
                
                <div class="invictus-header">
                    <h2>🎯 Invictus Center</h2>
                    <p class="subtitle">Интерактивные тесты - фото и вопросы</p>
                </div>
                
                <div class="invictus-tabs">
                    <button class="invictus-tab ${this.currentSubject === 'histology' ? 'active' : ''}" 
                            onclick="invictusCenterModule.switchSubject('histology')">
                        🔬 Гистология
                    </button>
                    <button class="invictus-tab ${this.currentSubject === 'pathoanatomy' ? 'active' : ''}" 
                            onclick="invictusCenterModule.switchSubject('pathoanatomy')">
                        🩺 Патанатомия
                    </button>
                </div>
                
                <div class="invictus-content">
        `;
        
        const subject = this.subjects[this.currentSubject];
        html += `
                    <div class="subject-header">
                        <h3>${subject.icon} ${Safe.esc(subject.title)}</h3>
                        <p>${Safe.esc(subject.description)}</p>
                    </div>
                    
                    <div class="tests-grid">
        `;
        
        subject.tests.forEach(test => {
            html += `
                        <div class="invictus-test-card" onclick="invictusCenterModule.startTest('${this.currentSubject}', '${test.id}')">
                            <div class="test-thumbnail">
                                <span class="test-icon">📋📸</span>
                            </div>
                            <h4>${Safe.esc(test.title)}</h4>
                            <p class="test-meta">${test.questions.length} вопросов</p>
                        </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    },
    
    // Switch between subjects
    switchSubject: function(subjectName) {
        this.currentSubject = subjectName;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.show();
    },
    
    // Start a test
    startTest: function(subjectName, testId) {
        this.currentSubject = subjectName;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.testStartTime = new Date();
        
        const subject = this.subjects[subjectName];
        const test = subject.tests.find(t => t.id === testId);
        
        if (!test) {
            showTempMessage('❌ Тест не найден');
            return;
        }
        
        this.currentTestId = testId;
        this.showQuestion();
    },
    
    // Show current question
    showQuestion: function() {
        const subject = this.subjects[this.currentSubject];
        const test = subject.tests.find(t => t.id === this.currentTestId);
        
        if (!test || test.questions.length === 0) return;
        
        const question = test.questions[this.currentQuestionIndex];
        const content = document.getElementById('tests-content');
        if (!content) return;
        
        const progressPercent = Math.round(((this.currentQuestionIndex + 1) / test.questions.length) * 100);
        const selectedAnswer = this.userAnswers[question.id];
        
        let html = `
            <div class="invictus-test-container">
                <button class="btn-back" onclick="invictusCenterModule.show()">← Назад</button>
                
                <div class="invictus-test-header">
                    <div class="test-progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <p class="progress-text">Вопрос ${this.currentQuestionIndex + 1} из ${test.questions.length}</p>
                </div>
                
                <h3>${subject.icon} ${Safe.esc(test.title)}</h3>
                
                <div class="photo-test-content ${question.image ? 'with-image' : 'text-only'}">
        `;
        
        // Show image if available
        if (question.image) {
            html += `
                    <div class="photo-container">
                        <img src="${Safe.url(question.image)}" alt="Микрофотография" class="test-image">
                    </div>
            `;
        }
        
        html += `
                    <div class="question-section">
                        <p class="question-text">${Safe.esc(question.text)}</p>
                        
                        <div class="answers-group">
        `;
        
        question.answers.forEach(answer => {
            const isSelected = selectedAnswer === answer.id;
            html += `
                            <button class="answer-button ${isSelected ? 'selected' : ''}" 
                                    onclick="invictusCenterModule.selectAnswer('${answer.id}')">
                                <span class="answer-letter">${answer.id.toUpperCase()}</span>
                                <span class="answer-text">${answer.text}</span>
                            </button>
            `;
        });
        
        html += `
                        </div>
                    </div>
                </div>
                
                <div class="test-navigation">
                    <button class="btn-secondary" 
                            onclick="invictusCenterModule.previousQuestion()"
                            ${this.currentQuestionIndex === 0 ? 'disabled' : ''}>
                        ← Предыдущий
                    </button>
                    
                    <div class="question-indicators">
        `;
        
        test.questions.forEach((q, index) => {
            const answered = this.userAnswers[q.id] !== undefined ? 'answered' : '';
            const active = index === this.currentQuestionIndex ? 'active' : '';
            html += `
                        <button class="indicator ${answered} ${active}" 
                                onclick="invictusCenterModule.goToQuestion(${index})"
                                title="Вопрос ${index + 1}">
                        </button>
            `;
        });
        
        html += `
                    </div>
                    
                    ${this.currentQuestionIndex < test.questions.length - 1 ? `
                        <button class="btn-primary" onclick="invictusCenterModule.nextQuestion()">
                            Следующий →
                        </button>
                    ` : `
                        <button class="btn-primary btn-submit" onclick="invictusCenterModule.submitTest()">
                            Завершить и проверить ✓
                        </button>
                    `}
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    },
    
    // Select answer
    selectAnswer: function(answerId) {
        const subject = this.subjects[this.currentSubject];
        const test = subject.tests.find(t => t.id === this.currentTestId);
        const question = test.questions[this.currentQuestionIndex];
        
        this.userAnswers[question.id] = answerId;
        this.showQuestion();
    },
    
    // Navigate to next question
    nextQuestion: function() {
        const subject = this.subjects[this.currentSubject];
        const test = subject.tests.find(t => t.id === this.currentTestId);
        
        if (this.currentQuestionIndex < test.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    },
    
    // Navigate to previous question
    previousQuestion: function() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    },
    
    // Go to specific question
    goToQuestion: function(index) {
        const subject = this.subjects[this.currentSubject];
        const test = subject.tests.find(t => t.id === this.currentTestId);
        
        if (index >= 0 && index < test.questions.length) {
            this.currentQuestionIndex = index;
            this.showQuestion();
        }
    },
    
    // Submit test
    submitTest: function() {
        const subject = this.subjects[this.currentSubject];
        const test = subject.tests.find(t => t.id === this.currentTestId);
        
        // Calculate score
        let correctCount = 0;
        test.questions.forEach(question => {
            const selectedAnswerId = this.userAnswers[question.id];
            if (selectedAnswerId) {
                const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
                if (selectedAnswer && selectedAnswer.correct) {
                    correctCount++;
                }
            }
        });
        
        const score = Math.round((correctCount / test.questions.length) * 100);
        this.showResults(test, correctCount, test.questions.length, score);
    },
    
    // Show test results
    showResults: function(test, correctCount, totalQuestions, score) {
        const content = document.getElementById('tests-content');
        const subject = this.subjects[this.currentSubject];
        
        const isPassed = score >= 60;
        
        let html = `
            <div class="invictus-results-container">
                <div class="results-header ${isPassed ? 'passed' : 'failed'}">
                    <div class="result-icon">${isPassed ? '✓' : '✗'}</div>
                    <h2>${isPassed ? 'Отлично!' : 'Попробуйте еще раз'}</h2>
                </div>
                
                <div class="results-score">
                    <div class="score-value">${score}%</div>
                    <div class="score-label">Ваш результат</div>
                </div>
                
                <div class="results-details">
                    <div class="detail-item">
                        <span class="detail-label">Правильных ответов:</span>
                        <span class="detail-value">${correctCount} из ${totalQuestions}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Тест:</span>
                        <span class="detail-value">${Safe.esc(test.title)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Предмет:</span>
                        <span class="detail-value">${subject.icon} ${Safe.esc(subject.title)}</span>
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn-primary" onclick="invictusCenterModule.startTest('${this.currentSubject}', '${test.id}')">
                        🔄 Пройти еще раз
                    </button>
                    <button class="btn-secondary" onclick="invictusCenterModule.show()">
                        ← Вернуться к тестам
                    </button>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }
};
