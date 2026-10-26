// Tests Module Manager
const testsModule = {
    appData: null,
    builderState: null,

    init: function(appData) {
        this.appData = appData;
        if (typeof testCategoriesModule !== 'undefined') testCategoriesModule.init();
        if (typeof testQuestionsModule !== 'undefined') testQuestionsModule.init();
        if (typeof testResultsModule !== 'undefined') testResultsModule.init();
        if (typeof invictusCenterModule !== 'undefined') invictusCenterModule.init();
        console.log('✓ Tests Module Initialized (with submodules)');
    },

    show: function() {
        const screen = document.getElementById('tests-screen');
        if (screen) {
            screen.style.display = 'block';
            this.renderTests();
        }
    },

    hide: function() {
        const screen = document.getElementById('tests-screen');
        if (screen) {
            screen.style.display = 'none';
        }
    },

    renderTests: function() {
        if (appData.user && (appData.user.role === 'teacher' || appData.user.role === 'owner')) {
            this.renderTeacherWorkspace();
            return;
        }

        if (typeof testCategoriesModule !== 'undefined') {
            testCategoriesModule.show();
        }
    },

    getTeacherStudentsData: function() {
        if (typeof authenticationModule === 'undefined') return [];
        return authenticationModule.getAllStudents().map(student => {
            const progress = student.progress || {};
            const results = Array.isArray(progress.testResults) ? progress.testResults : [];
            const scores = Object.values(progress.scores || {});
            const averageScore = scores.length
                ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
                : 0;

            return {
                id: student.id,
                fullname: student.fullname,
                points: progress.points || 0,
                testCount: scores.length,
                averageScore,
                completedTopics: (progress.completedTopics || []).length,
                lastResult: results.length ? results[results.length - 1] : null
            };
        });
    },

    getWeakTests: function() {
        return (appData.tests || [])
            .map(test => {
                const attempts = (typeof authenticationModule !== 'undefined' ? authenticationModule.getAllStudents() : [])
                    .flatMap(student => (student.progress?.testResults || []).filter(result => result.testId === test.id));
                const average = attempts.length
                    ? Math.round(attempts.reduce((sum, result) => sum + (result.score || 0), 0) / attempts.length)
                    : 0;

                return {
                    id: test.id,
                    title: test.title,
                    attempts: attempts.length,
                    average
                };
            })
            .filter(test => test.attempts > 0)
            .sort((a, b) => a.average - b.average)
            .slice(0, 5);
    },

    renderTeacherWorkspace: function() {
        const content = document.getElementById('tests-content');
        if (!content) return;

        const students = this.getTeacherStudentsData();
        const weakTests = this.getWeakTests();
        const totalAttempts = students.reduce((sum, student) => sum + student.testCount, 0);
        const averageScore = students.length
            ? Math.round(students.reduce((sum, student) => sum + student.averageScore, 0) / students.length)
            : 0;

        content.innerHTML = `
            <div class="test-categories-container teacher-tests-workspace">
                <h2>Панель преподавателя</h2>
                <p class="subtitle">Конструктор тестов, аналитика группы и выгрузка отчётов в одном месте.</p>

                <div class="test-stats">
                    <div class="stat-card">
                        <div class="stat-value">${students.length}</div>
                        <div class="stat-label">Студентов</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalAttempts}</div>
                        <div class="stat-label">Попыток тестов</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${averageScore}%</div>
                        <div class="stat-label">Средний балл</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(appData.tests || []).length}</div>
                        <div class="stat-label">Тестов в банке</div>
                    </div>
                </div>

                <div class="home-quick-actions">
                    <button class="home-quick-btn" onclick="testsModule.showTeacherBuilder()">✍️ Новый тест</button>
                    <button class="home-quick-btn" onclick="testsModule.exportTeacherReports('csv')">📄 CSV</button>
                    <button class="home-quick-btn" onclick="testsModule.exportTeacherReports('excel')">📊 Excel</button>
                    <button class="home-quick-btn" onclick="testsModule.exportTeacherReports('pdf')">🖨 PDF</button>
                </div>

                <div class="dashboard-section teacher-tests-section">
                    <h3 class="section-title">Конструктор тестов</h3>
                    <div class="recent-topics">
                        ${(appData.tests || []).map(test => `
                            <div class="recent-topic-item">
                                <div class="topic-breadcrumb">
                                    <strong>${test.title}</strong> / <span>${test.questionCount || (test.questions || []).length} вопросов</span>
                                </div>
                                <h4>${test.difficulty || 'Средний'}</h4>
                                <p class="topic-preview">${test.description || 'Без описания'}</p>
                                <div class="home-quick-actions">
                                    <button class="home-quick-btn" onclick="testsModule.showTeacherBuilder(${test.id})">Редактировать</button>
                                    <button class="home-quick-btn" onclick="testsModule.deleteTeacherTest(${test.id})">Удалить</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="dashboard-section teacher-tests-section">
                    <h3 class="section-title">Слабые места группы</h3>
                    <div class="recent-topics">
                        ${weakTests.length ? weakTests.map(test => `
                            <div class="recent-topic-item">
                                <div class="topic-breadcrumb"><strong>${test.title}</strong></div>
                                <h4>${test.average}% средний результат</h4>
                                <p class="topic-preview">Попыток: ${test.attempts}. Этот тест стоит усилить объяснениями или пересмотреть сложность.</p>
                            </div>
                        `).join('') : '<p class="topic-preview">Пока не хватает результатов для анализа слабых мест.</p>'}
                    </div>
                </div>

                <div class="dashboard-section teacher-tests-section">
                    <h3 class="section-title">Статистика по группе</h3>
                    <div class="teacher-table-wrap">
                        <table class="teacher-report-table">
                            <thead>
                                <tr>
                                    <th>Студент</th>
                                    <th>Тестов</th>
                                    <th>Средний балл</th>
                                    <th>Баллы</th>
                                    <th>Последний тест</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${students.length ? students.map(student => `
                                    <tr>
                                        <td>${Safe.esc(student.fullname)}</td>
                                        <td>${student.testCount}</td>
                                        <td>${student.averageScore}%</td>
                                        <td>${student.points}</td>
                                        <td>${student.lastResult ? `${Safe.esc(student.lastResult.testTitle)} (${Safe.esc(student.lastResult.score)}%)` : 'Нет данных'}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="6">Нет данных по студентам</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    showTeacherBuilder: function(testId = null) {
        const content = document.getElementById('tests-content');
        if (!content) return;

        const editing = testId ? (appData.tests || []).find(test => Number(test.id) === Number(testId)) : null;
        const questions = editing && Array.isArray(editing.questions) && editing.questions.length
            ? editing.questions
            : [{ text: '', options: ['', '', '', ''], correct: 0, explanation: '' }];

        this.builderState = {
            id: editing ? editing.id : null,
            questions: questions.map(question => ({
                text: question.text || '',
                options: Array.isArray(question.options) ? [...question.options] : ['', '', '', ''],
                correct: Number(question.correct || 0),
                explanation: question.explanation || ''
            }))
        };

        content.innerHTML = `
            <div class="test-categories-container teacher-tests-workspace">
                <button class="btn-back" onclick="testsModule.renderTeacherWorkspace()">← Назад к панели преподавателя</button>
                <h2>${editing ? 'Редактирование теста' : 'Новый тест'}</h2>
                <p class="subtitle">Создавайте тест прямо в приложении без ручного редактирования JSON.</p>

                <div class="teacher-builder-form">
                    <label class="dev-label">Название
                        <input id="teacher-test-title" class="dev-input" value="${editing ? this.escapeHtml(editing.title) : ''}">
                    </label>
                    <label class="dev-label">Описание
                        <input id="teacher-test-description" class="dev-input" value="${editing ? this.escapeHtml(editing.description || '') : ''}">
                    </label>
                    <div class="dev-grid-two">
                        <label class="dev-label">Категория
                            <select id="teacher-test-category" class="dev-input">
                                ${(typeof testCategoriesModule !== 'undefined' ? testCategoriesModule.categories : []).filter(category => !category.isSpecial).map(category => `
                                    <option value="${category.id}" ${Number(editing?.categoryId || 1) === Number(category.id) ? 'selected' : ''}>${category.title}</option>
                                `).join('')}
                            </select>
                        </label>
                        <label class="dev-label">Предмет
                            <select id="teacher-test-subject" class="dev-input">
                                <option value="">Без предмета</option>
                                ${Object.entries(appData.subjects || {}).map(([subjectId, subject]) => `
                                    <option value="${this.escapeHtml(subjectId)}" ${String(editing?.subjectId ?? '') === String(subjectId) ? 'selected' : ''}>${this.escapeHtml(subject.title || subjectId)}</option>
                                `).join('')}
                            </select>
                        </label>
                    </div>
                    <label class="dev-label">Сложность
                        <select id="teacher-test-difficulty" class="dev-input">
                            ${['Легкий', 'Средний', 'Сложный'].map(level => `<option value="${level}" ${editing?.difficulty === level ? 'selected' : ''}>${level}</option>`).join('')}
                        </select>
                    </label>

                    <div id="teacher-question-list">
                        ${this.renderBuilderQuestions()}
                    </div>

                    <div class="home-quick-actions">
                        <button class="home-quick-btn" onclick="testsModule.addBuilderQuestion()">➕ Добавить вопрос</button>
                        <button class="home-quick-btn" onclick="testsModule.saveTeacherTest()">💾 Сохранить тест</button>
                        <button class="home-quick-btn" onclick="testsModule.renderTeacherWorkspace()">Отмена</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderBuilderQuestions: function() {
        return (this.builderState?.questions || []).map((question, index) => `
            <div class="teacher-question-card">
                <div class="teacher-question-head">
                    <h4>Вопрос ${index + 1}</h4>
                    <button class="home-quick-btn" onclick="testsModule.removeBuilderQuestion(${index})">Удалить</button>
                </div>
                <label class="dev-label">Формулировка
                    <textarea class="dev-textarea" id="builder-question-text-${index}">${this.escapeHtml(question.text)}</textarea>
                </label>
                ${question.options.map((option, optionIndex) => `
                    <label class="dev-label">Вариант ${optionIndex + 1}
                        <input class="dev-input" id="builder-question-option-${index}-${optionIndex}" value="${this.escapeHtml(option)}">
                    </label>
                `).join('')}
                <label class="dev-label">Правильный вариант
                    <select class="dev-input" id="builder-question-correct-${index}">
                        ${[0, 1, 2, 3].map(optionIndex => `<option value="${optionIndex}" ${Number(question.correct) === optionIndex ? 'selected' : ''}>Вариант ${optionIndex + 1}</option>`).join('')}
                    </select>
                </label>
                <label class="dev-label">Объяснение
                    <textarea class="dev-textarea" id="builder-question-explanation-${index}">${this.escapeHtml(question.explanation || '')}</textarea>
                </label>
            </div>
        `).join('');
    },

    addBuilderQuestion: function() {
        if (!this.builderState) return;
        this.builderState.questions.push({ text: '', options: ['', '', '', ''], correct: 0, explanation: '' });
        this.showTeacherBuilder(this.builderState.id);
    },

    removeBuilderQuestion: function(index) {
        if (!this.builderState || this.builderState.questions.length <= 1) return;
        this.builderState.questions.splice(index, 1);
        this.showTeacherBuilder(this.builderState.id);
    },

    collectBuilderQuestions: function() {
        return (this.builderState?.questions || []).map((question, index) => ({
            text: document.getElementById(`builder-question-text-${index}`)?.value?.trim() || '',
            options: [0, 1, 2, 3].map(optionIndex => document.getElementById(`builder-question-option-${index}-${optionIndex}`)?.value?.trim() || ''),
            correct: Number(document.getElementById(`builder-question-correct-${index}`)?.value || 0),
            explanation: document.getElementById(`builder-question-explanation-${index}`)?.value?.trim() || ''
        }));
    },

    saveTeacherTest: function() {
        const title = document.getElementById('teacher-test-title')?.value?.trim();
        const description = document.getElementById('teacher-test-description')?.value?.trim() || '';
        const categoryId = Number(document.getElementById('teacher-test-category')?.value || 1);
        const subjectValue = document.getElementById('teacher-test-subject')?.value;
        const subjectId = subjectValue ? Number(subjectValue) : null;
        const difficulty = document.getElementById('teacher-test-difficulty')?.value || 'Средний';
        const questions = this.collectBuilderQuestions();

        if (!title) {
            alert('Введите название теста');
            return;
        }

        if (questions.some(question => !question.text || question.options.some(option => !option))) {
            alert('Заполните текст вопроса и все варианты ответа');
            return;
        }

        const existingId = this.builderState?.id;
        const nextId = existingId || ((appData.tests || []).reduce((maxId, test) => Math.max(maxId, Number(test.id || 0)), 0) + 1);
        const nextTest = {
            id: nextId,
            title,
            description,
            difficulty,
            categoryId,
            subjectId,
            questions,
            isTeacherCreated: true,
            updatedAt: new Date().toISOString()
        };

        appData.tests = appData.tests || [];
        const existingIndex = appData.tests.findIndex(test => Number(test.id) === Number(nextId));
        if (existingIndex >= 0) {
            appData.tests[existingIndex] = { ...appData.tests[existingIndex], ...nextTest };
        } else {
            appData.tests.push(nextTest);
        }

        if (typeof normalizeTestsData === 'function') normalizeTestsData();
        this.persistTestsState();
        this.renderTeacherWorkspace();
    },

    deleteTeacherTest: function(testId) {
        if (!confirm('Удалить этот тест?')) return;
        appData.tests = (appData.tests || []).filter(test => Number(test.id) !== Number(testId));
        if (typeof normalizeTestsData === 'function') normalizeTestsData();
        this.persistTestsState();
        this.renderTeacherWorkspace();
    },

    persistTestsState: function() {
        if (typeof developerMode !== 'undefined' && typeof developerMode.saveToDB === 'function') {
            developerMode.saveToDB('Обновление тестового банка');
            return;
        }
        localStorage.setItem('appData', JSON.stringify(appData));
    },

    getTeacherReportRows: function() {
        return this.getTeacherStudentsData().map(student => ({
            student: student.fullname,
            testsCompleted: student.testCount,
            averageScore: `${student.averageScore}%`,
            points: student.points,
            lastTest: student.lastResult ? student.lastResult.testTitle : 'Нет данных'
        }));
    },

    exportTeacherReports: function(format) {
        const rows = this.getTeacherReportRows();
        if (!rows.length) {
            alert('Нет данных для экспорта');
            return;
        }

        if (format === 'csv') {
            const header = ['Студент', 'Тестов', 'Средний балл', 'Баллы', 'Последний тест'];
            const csv = [header.join(';')].concat(rows.map(row => [
                row.student,
                row.testsCompleted,
                row.averageScore,
                row.points,
                row.lastTest
            ].map(value => {
                let cell = String(value);
                if (/^[=+\-@\t\r]/.test(cell)) cell = "'" + cell; // не даём Excel принять текст за формулу
                return `"${cell.replace(/"/g, '""')}"`;
            }).join(';'))).join('\n');
            this.downloadBlob(`\ufeff${csv}`, 'text/csv;charset=utf-8', 'invictus-teacher-report.csv');
            return;
        }

        if (format === 'excel') {
            const html = `
                <table>
                    <tr><th>Студент</th><th>Тестов</th><th>Средний балл</th><th>Баллы</th><th>Последний тест</th></tr>
                    ${rows.map(row => `
                        <tr>
                            <td>${Safe.esc(row.student)}</td>
                            <td>${row.testsCompleted}</td>
                            <td>${row.averageScore}</td>
                            <td>${row.points}</td>
                            <td>${Safe.esc(row.lastTest)}</td>
                        </tr>
                    `).join('')}
                </table>
            `;
            this.downloadBlob(html, 'application/vnd.ms-excel', 'invictus-teacher-report.xls');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=1100,height=800');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
            <head>
                <title>Invictus Teacher Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 24px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                    th { background: #f1f5f9; }
                </style>
            </head>
            <body>
                <h1>Отчёт по группе</h1>
                <p>Сформировано: ${new Date().toLocaleString('ru-RU')}</p>
                <table>
                    <tr><th>Студент</th><th>Тестов</th><th>Средний балл</th><th>Баллы</th><th>Последний тест</th></tr>
                    ${rows.map(row => `
                        <tr>
                            <td>${Safe.esc(row.student)}</td>
                            <td>${row.testsCompleted}</td>
                            <td>${row.averageScore}</td>
                            <td>${row.points}</td>
                            <td>${Safe.esc(row.lastTest)}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    },

    downloadBlob: function(content, mimeType, fileName) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    escapeHtml: function(text) {
        return String(text || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    }
};
