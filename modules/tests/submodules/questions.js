// Test Questions Submodule - Shows and manages test questions
const testQuestionsModule = {
    currentCategoryId: null,
    currentTestId: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    testStartTime: null,
    
    init: function() {
        console.log('✓ Test Questions Submodule Initialized');
    },
    
    // Show tests in category
    show: function(categoryId) {
        this.currentCategoryId = categoryId;
        
        // Find category
        const categories = typeof testCategoriesModule.getVisibleCategories === 'function'
            ? testCategoriesModule.getVisibleCategories()
            : testCategoriesModule.categories;
        const category = categories.find(c => Number(c.id) === Number(categoryId));
        if (!category) return;
        
        const content = document.getElementById('tests-content');
        if (!content) return;
        
        let html = `
            <div class="test-selection-container">
                <button class="btn-back" onclick="testCategoriesModule.show()">← Назад к категориям</button>
                <h2>${category.title}</h2>
                <p class="subtitle">${category.description}</p>
                
                <div class="tests-list">
        `;
        
        category.testIds.forEach(testId => {
            const test = appData.tests.find(t => t.id === testId);
            if (!test) return;
            
            const score = appData.user && appData.user.progress && appData.user.progress.scores[testId];
            const isPassed = score !== undefined && score >= 60;
            
            html += `
                <div class="test-card" onclick="testQuestionsModule.startTest(${testId})">
                    <div class="test-header">
                        <h3>${test.title}</h3>
                        ${score !== undefined ? `<span class="test-score ${isPassed ? 'passed' : 'failed'}">${score}%</span>` : ''}
                    </div>
                    <p class="test-description">${test.description}</p>
                    <div class="test-info">
                        <span>📝 ${test.questions.length} вопросов</span>
                        <span>⏱️ ~${Math.ceil(test.questions.length * 2)} мин</span>
                        ${isPassed ? '<span class="badge-passed">✓ Пройден</span>' : '<span class="badge-new">Новый</span>'}
                    </div>
                    ${score !== undefined ? `<p class="test-last-attempt">Последний результат: ${score}%</p>` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    },
    
    // Start test
    startTest: function(testId) {
        this.currentTestId = testId;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.testStartTime = new Date();
        
        const test = appData.tests.find(t => t.id === testId);
        if (!test || !test.questions || test.questions.length === 0) {
            showTempMessage('❌ Тест не найден');
            return;
        }
        
        this.showQuestion();
    },
    
    // Show current question
    showQuestion: function() {
        const test = appData.tests.find(t => t.id === this.currentTestId);
        if (!test) return;
        
        const question = test.questions[this.currentQuestionIndex];
        if (!question) return;
        
        const content = document.getElementById('tests-content');
        if (!content) return;
        
        const progressPercent = Math.round(((this.currentQuestionIndex + 1) / test.questions.length) * 100);
        const selectedAnswer = this.userAnswers[this.currentQuestionIndex];
        const hasSelectedAnswer = selectedAnswer !== undefined;
        const selectedAnswerText = hasSelectedAnswer ? question.options[selectedAnswer] : '';
        const correctAnswerText = question.options[question.correct];
        const isCorrectAnswer = hasSelectedAnswer ? selectedAnswer === question.correct : false;
        const explanation = question.explanation || `Правильный ответ — ${correctAnswerText}.`;
        
        let html = `
            <div class="test-question-container">
                <div class="test-header-bar">
                    <div class="test-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <p class="progress-text">Вопрос ${this.currentQuestionIndex + 1} из ${test.questions.length}</p>
                    </div>
                    <button class="btn-exit" onclick="if(confirm('Выйти из теста?')) testCategoriesModule.show()">✕ Выход</button>
                </div>
                
                <div class="question-content">
                    <h2>${Safe.esc(question.text)}</h2>
                    <p class="question-type">Выберите правильный ответ</p>
                    
                    <div class="answers-list">
        `;
        
        question.options.forEach((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            
            html += `
                <div class="answer-option ${isSelected ? 'selected' : ''}" 
                     onclick="testQuestionsModule.selectAnswer(${index})">
                    <div class="answer-radio ${isSelected ? 'checked' : ''}"></div>
                    <div class="answer-text">${option}</div>
                </div>
            `;
        });
        
        html += `
                    </div>
                    
                    <div class="question-actions">
                        ${this.currentQuestionIndex > 0 ? `
                            <button class="btn-secondary" onclick="testQuestionsModule.previousQuestion()">
                                ← Предыдущий вопрос
                            </button>
                        ` : ''}
                        
                        ${this.currentQuestionIndex < test.questions.length - 1 ? `
                            <button class="btn-primary" onclick="testQuestionsModule.nextQuestion()">
                                Следующий вопрос →
                            </button>
                        ` : `
                            <button class="btn-primary btn-submit" onclick="testQuestionsModule.submitTest()">
                                Завершить тест
                            </button>
                        `}
                    </div>

                    ${hasSelectedAnswer ? `
                        <div class="question-feedback ${isCorrectAnswer ? 'correct' : 'wrong'}">
                            <h3>${isCorrectAnswer ? '✅ Верно' : '🧠 Разбор ответа'}</h3>
                            <p><strong>Ваш ответ:</strong> ${selectedAnswerText || 'нет ответа'}</p>
                            <p><strong>Правильный ответ:</strong> ${correctAnswerText}</p>
                            <p>${explanation}</p>
                        </div>
                    ` : `
                        <div class="question-feedback neutral">
                            <p>Выберите вариант ответа, чтобы увидеть разбор и объяснение.</p>
                        </div>
                    `}
                </div>
                
                <div class="question-sidebar">
                    <div class="question-navigator">
                        <h3>Навигация по вопросам</h3>
                        <div class="question-buttons">
        `;
        
        test.questions.forEach((q, index) => {
            const isAnswered = this.userAnswers[index] !== undefined;
            const isCurrent = index === this.currentQuestionIndex;
            
            html += `
                <button class="question-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}" 
                        onclick="testQuestionsModule.goToQuestion(${index})">
                    ${index + 1}
                </button>
            `;
        });
        
        html += `
                        </div>
                    </div>
                    
                    <div class="test-info-box">
                        <p><strong>Статус:</strong> ${Object.keys(this.userAnswers).length}/${test.questions.length} ответов</p>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    },
    
    // Select answer
    selectAnswer: function(optionIndex) {
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        this.showQuestion(); // Refresh
    },
    
    // Navigate to specific question
    goToQuestion: function(questionIndex) {
        this.currentQuestionIndex = questionIndex;
        this.showQuestion();
    },
    
    // Previous question
    previousQuestion: function() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    },
    
    // Next question
    nextQuestion: function() {
        const test = appData.tests.find(t => t.id === this.currentTestId);
        if (this.currentQuestionIndex < test.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    },
    
    // Submit test and calculate score
    submitTest: function() {
        const test = appData.tests.find(t => t.id === this.currentTestId);
        if (!test) return;
        
        // Calculate score
        let correctAnswers = 0;
        test.questions.forEach((question, index) => {
            if (this.userAnswers[index] === question.correct) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / test.questions.length) * 100);
        const testTime = Math.round((new Date() - this.testStartTime) / 1000); // in seconds
        
        // Save result
        if (!appData.user.progress.scores) {
            appData.user.progress.scores = {};
        }
        appData.user.progress.scores[test.id] = score;
        
        // Save test result details
        if (!appData.user.progress.testResults) {
            appData.user.progress.testResults = [];
        }
        appData.user.progress.testResults.push({
            testId: test.id,
            testTitle: test.title,
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: test.questions.length,
            timestamp: new Date().toISOString(),
            timeSpent: testTime,
            answers: { ...this.userAnswers }
        });
        
        if (typeof scoringModule !== 'undefined') {
            const currentUserId = typeof getCurrentUserId === 'function'
                ? getCurrentUserId()
                : (appData.user.id || appData.user.fullname);
            const subjectId = test.subjectId || test.subject || null;

            if (typeof scoringModule.awardTestPoints === 'function') {
                scoringModule.awardTestPoints(currentUserId, {
                    score,
                    totalQuestions: test.questions.length,
                    timeSpent: testTime,
                    subjectId
                });
            } else {
                scoringModule.addPoints(currentUserId, 'complete-test', subjectId);
            }
        }

        if (typeof persistCurrentUserState === 'function') persistCurrentUserState();
        
        // Show results
        testResultsModule.show(test.id, score, correctAnswers, test.questions.length);
    }
};
