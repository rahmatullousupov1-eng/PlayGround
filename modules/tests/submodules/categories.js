// Test Categories Submodule - Shows test categories
const testCategoriesModule = {
    categories: [
        {
            id: 1,
            title: 'Анатомия и Физиология',
            icon: '🦴',
            testIds: [1, 2],
            description: 'Тесты по строению и функциям человека',
            difficulty: 'Средняя'
        },
        {
            id: 2,
            title: 'Биохимия и Патология',
            icon: '⚗️',
            testIds: [3],
            description: 'Тесты по метаболизму и болезням',
            difficulty: 'Высокая'
        },
        {
            id: 3,
            title: 'Внутренние болезни',
            icon: '🩺',
            testIds: [2, 3],
            description: 'Тесты по диагностике заболеваний',
            difficulty: 'Высокая'
        },
        {
            id: 4,
            title: 'Диагностика и Микробиология',
            icon: '🔬',
            testIds: [4, 5, 6],
            description: 'Тесты по лучевой диагностике и микробам',
            difficulty: 'Высокая'
        },
        {
            id: 5,
            title: 'Инфекции и Онкология',
            icon: '🦠',
            testIds: [7, 8, 9],
            description: 'Тесты по инфекциям и раку',
            difficulty: 'Высокая'
        },
        {
            id: 6,
            title: 'Invictus Center',
            icon: '🎯',
            description: 'Интерактивные тесты с микрофотографиями: гистология, эмбриология, цитология',
            difficulty: 'Средняя',
            isSpecial: true
        }
    ],
    
    init: function() {
        console.log('✓ Test Categories Submodule Initialized');
    },

    getVisibleCategories: function() {
        return this.categories
            .map(category => {
                if (category.isSpecial) return category;
                const dynamicTestIds = (appData.tests || [])
                    .filter(test => Number(test.categoryId) === Number(category.id))
                    .map(test => test.id);

                return {
                    ...category,
                    testIds: dynamicTestIds.length ? dynamicTestIds : category.testIds
                };
            })
            ;
    },
    
    // Show test categories
    show: function(containerId = 'tests-content') {
        const content = document.getElementById(containerId);
        if (!content) return;
        const filteredCategories = this.getVisibleCategories();
        
        let html = `
            <div class="test-categories-container">
                <h2>Интерактивные Тесты</h2>
                <p class="subtitle">Выберите категорию тестов для проверки знаний</p>
                
                <div class="categories-grid">
        `;
        
        filteredCategories.forEach(category => {
            // Count completed tests
            const completedTests = appData.user && appData.user.progress && appData.user.progress.scores && category.testIds
                ? category.testIds.filter(testId => appData.user.progress.scores[testId] !== undefined).length
                : 0;
            
            // Handle special categories like Invictus Center
            const targetFunction = category.isSpecial ? 'invictusCenterModule.show()' : `testQuestionsModule.show(${category.id})`;
            
            html += `
                <div class="category-card" onclick="${targetFunction}">
                    <div class="category-icon">${category.icon}</div>
                    <h3>${category.title}</h3>
                    <p class="category-description">${category.description}</p>
                    
                    <div class="category-meta">
                        <span class="difficulty ${category.difficulty.toLowerCase()}">${category.difficulty}</span>
                        ${category.testIds ? `<span class="test-count">📝 ${category.testIds.length} тестов</span>` : '<span class="test-count">🎯 Специальные тесты</span>'}
                    </div>
                    
                    ${category.testIds ? `
                    <div class="category-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${completedTests > 0 ? (completedTests / category.testIds.length * 100) : 0}%"></div>
                        </div>
                        <p class="progress-text">${completedTests}/${category.testIds.length} пройдено</p>
                    </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div class="test-stats">
                    <div class="stat-card">
                        <div class="stat-value">${appData.user ? appData.user.progress.completedTopics.length : 0}</div>
                        <div class="stat-label">Тем пройдено</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${appData.user ? Object.keys(appData.user.progress.scores).length : 0}</div>
                        <div class="stat-label">Тестов сдано</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">
                            ${appData.user && Object.keys(appData.user.progress.scores).length > 0
                                ? Math.round(Object.values(appData.user.progress.scores).reduce((a, b) => a + b, 0) / Object.keys(appData.user.progress.scores).length)
                                : 0}%
                        </div>
                        <div class="stat-label">Средний балл</div>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }
};
