// Test Results Submodule - Shows test results and analysis
const testResultsModule = {
    lastTestId: null,
    lastScore: null,
    
    init: function() {
        console.log('✓ Test Results Submodule Initialized');
    },
    
    // Show test results
    show: function(testId, score, correctAnswers, totalQuestions) {
        this.lastTestId = testId;
        this.lastScore = score;
        
        const test = appData.tests.find(t => t.id === testId);
        if (!test) return;
        
        const content = document.getElementById('tests-content');
        if (!content) return;
        
        const isPassed = score >= 60;
        const timeSpent = appData.user.progress.testResults 
            ? appData.user.progress.testResults.find(r => r.testId === testId)?.timeSpent || 0
            : 0;
        const attempt = appData.user.progress.testResults
            ? [...appData.user.progress.testResults].reverse().find(r => r.testId === testId)
            : null;
        const answers = attempt?.answers || {};
        
        // Get performance rating
        let rating = '⭐';
        if (score >= 90) rating = '⭐⭐⭐⭐⭐';
        else if (score >= 80) rating = '⭐⭐⭐⭐';
        else if (score >= 70) rating = '⭐⭐⭐';
        else if (score >= 60) rating = '⭐⭐';
        
        let html = `
            <div class="test-results-container">
                <div class="result-header ${isPassed ? 'passed' : 'failed'}">
                    <div class="result-icon">${isPassed ? '✓' : '✗'}</div>
                    <h2>${isPassed ? 'Тест пройден!' : 'Тест не пройден'}</h2>
                    <p class="result-subtitle">${test.title}</p>
                </div>
                
                <div class="result-score">
                    <div class="score-display">
                        <div class="score-number">${score}</div>
                        <div class="score-label">%</div>
                    </div>
                    <div class="score-rating">${rating}</div>
                </div>
                
                <div class="result-details">
                    <div class="detail-item">
                        <span class="detail-label">Правильные ответы:</span>
                        <span class="detail-value">${correctAnswers} из ${totalQuestions}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Время прохождения:</span>
                        <span class="detail-value">${Math.floor(timeSpent / 60)}м ${timeSpent % 60}с</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Статус:</span>
                        <span class="detail-value ${isPassed ? 'success' : 'fail'}">
                            ${isPassed ? 'Зачёт' : 'Не зачтено'}
                        </span>
                    </div>
                </div>
                
                <div class="result-recommendations">
                    <h3>📚 Рекомендации:</h3>
                    <div class="recommendations-list">
        `;
        
        if (score < 60) {
            html += `
                        <p>❌ Результат ниже проходного балла (60%). Рекомендуем:</p>
                        <ul>
                            <li>Повторить материал по пройденным темам</li>
                            <li>Изучить теорию перед повторной попыткой</li>
                            <li>Обратиться к учебным материалам</li>
                        </ul>
            `;
        } else if (score < 80) {
            html += `
                        <p>⚠️ Результат хороший, но есть пробелы. Рекомендуем:</p>
                        <ul>
                            <li>Усилить внимание к сложным темам</li>
                            <li>Повторить материал ещё раз</li>
                            <li>Попробовать другие тесты по этой теме</li>
                        </ul>
            `;
        } else if (score < 90) {
            html += `
                        <p>👍 Результат отличный! Рекомендуем:</p>
                        <ul>
                            <li>Перейти к следующей теме</li>
                            <li>Попробовать более сложные тесты</li>
                            <li>Закрепить знания ещё раз</li>
                        </ul>
            `;
        } else {
            html += `
                        <p>🏆 Отличный результат! Вы полностью овладели материалом:</p>
                        <ul>
                            <li>Отлично понимаете тему</li>
                            <li>Готовы к следующему уровню</li>
                            <li>Можете помочь другим студентам</li>
                        </ul>
            `;
        }
        
        html += `
                    </div>
                </div>
                
                <div class="result-actions">
                    <button class="btn-primary" onclick="testCategoriesModule.show()">
                        ← Вернуться к тестам
                    </button>
                    <button class="btn-secondary" onclick="testQuestionsModule.startTest(${testId})">
                        🔄 Пройти тест ещё раз
                    </button>
                </div>
                
                <div class="result-history">
                    <h3>📊 История результатов этого теста:</h3>
                    <div class="history-list">
        `;
        
        // Show previous test results
        const testHistory = appData.user.progress.testResults 
            ? appData.user.progress.testResults.filter(r => r.testId === testId).slice(-5)
            : [];
        
        if (testHistory.length > 0) {
            testHistory.forEach((result, idx) => {
                const resultDate = new Date(result.timestamp).toLocaleDateString('ru-RU');
                html += `
                    <div class="history-item">
                        <span class="history-date">${resultDate}</span>
                        <span class="history-score">${result.score}% (${result.correctAnswers}/${result.totalQuestions})</span>
                    </div>
                `;
            });
        } else {
            html += '<p class="no-history">История результатов пока отсутствует</p>';
        }
        
        html += `
                    </div>
                </div>

                <div class="result-review">
                    <h3>🧠 Разбор ответов</h3>
                    <div class="review-list">
        `;

        test.questions.forEach((question, index) => {
            const selectedIndex = answers[index];
            const selectedText = selectedIndex !== undefined ? question.options[selectedIndex] : 'Нет ответа';
            const correctText = question.options[question.correct];
            const isCorrect = selectedIndex === question.correct;
            const explanation = question.explanation || `Правильный ответ — ${correctText}.`;

            html += `
                <div class="review-item ${isCorrect ? 'correct' : 'wrong'}">
                    <div class="review-item-head">
                        <span class="review-question-number">Вопрос ${index + 1}</span>
                        <span class="review-question-status">${isCorrect ? 'Верно' : 'Ошибка'}</span>
                    </div>
                    <p class="review-question-text">${Safe.esc(question.text)}</p>
                    <p class="review-answer"><strong>Ваш ответ:</strong> ${selectedText}</p>
                    <p class="review-answer"><strong>Правильный ответ:</strong> ${correctText}</p>
                    <p class="review-explanation">${explanation}</p>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }
};
