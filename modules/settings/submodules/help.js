// Help Submodule - Help and FAQ
const helpModule = {
    faqItems: [
        {
            question: 'Как отметить тему как пройденную?',
            answer: 'Откройте тему и нажмите кнопку "Отметить как пройдено". Это обновит ваш прогресс.'
        },
        {
            question: 'Как пройти тест?',
            answer: 'Перейдите в "Интерактивные тесты", выберите категорию, затем тест. Ответьте на все вопросы и нажмите "Завершить тест".'
        },
        {
            question: 'Сохраняются ли мои результаты?',
            answer: 'Да! Все ваши результаты и прогресс автоматически сохраняются на вашем устройстве в браузере.'
        },
        {
            question: 'Как найти нужный материал быстро?',
            answer: 'Используйте поиск! Нажмите 🔍 кнопку в углу или Ctrl+K на клавиатуре и введите то, что ищете.'
        },
        {
            question: 'Что такое "звёзды" рейтинга?',
            answer: '⭐ 1-2 звезды = результат 60-70%, ⭐⭐⭐ 3 = 70-80%, ⭐⭐⭐⭐ 4 = 80-90%, ⭐⭐⭐⭐⭐ 5 = 90%+'
        },
        {
            question: 'Можно ли переделать тест?',
            answer: 'Да! После завершения теста вы можете пройти его ещё раз. Будет сохранена лучшая попытка.'
        },
        {
            question: 'Как посмотреть свою статистику?',
            answer: 'Перейдите в "Отслеживание прогресса" или в Профиль, там вы увидите все статистики.'
        }
    ],
    
    init: function() {
        console.log('✓ Help Submodule Initialized');
    },
    
    // Show help
    show: function() {
        const content = document.getElementById('settings-content');
        if (!content) return;
        
        let html = `
            <div class="help-container">
                <button class="btn-back" onclick="navigationManager.goTo('profile')">← Назад к профилю</button>
                
                <div class="help-header">
                    <h2>❓ Справка и ЧаВО</h2>
                    <p class="help-subtitle">Найдите ответы на часто задаваемые вопросы</p>
                </div>
                
                <div class="faq-section">
                    <h3>📋 Часто задаваемые вопросы</h3>
        `;
        
        this.faqItems.forEach((item, index) => {
            html += `
                <div class="faq-item">
                    <button class="faq-question" onclick="helpModule.toggleAnswer(${index})">
                        <span class="faq-icon">+</span>
                        <span>${item.question}</span>
                    </button>
                    <div class="faq-answer" id="faq-${index}" style="display: none;">
                        <p>${item.answer}</p>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div class="help-section">
                    <h3>🎓 Руководство пользователя</h3>
                    
                    <div class="guide-card">
                        <h4>📚 Изучение предметов</h4>
                        <ol>
                            <li>Откройте раздел «Предметы» на главном экране</li>
                            <li>Выберите предмет</li>
                            <li>Проходите темы по порядку</li>
                            <li>Отмечайте пройденные темы</li>
                            <li>Проходите тесты для проверки знаний</li>
                        </ol>
                    </div>
                    
                    <div class="guide-card">
                        <h4>🧪 Прохождение тестов</h4>
                        <ol>
                            <li>Перейдите в "Интерактивные тесты"</li>
                            <li>Выберите интересующую вас категорию</li>
                            <li>Нажмите на тест для начала</li>
                            <li>Ответьте на все вопросы</li>
                            <li>Нажмите "Завершить тест" и получите результат</li>
                        </ol>
                    </div>
                    
                    <div class="guide-card">
                        <h4>📊 Отслеживание прогресса</h4>
                        <ol>
                            <li>Ваш прогресс обновляется автоматически</li>
                            <li>Посмотрите статистику в "Отслеживание прогресса"</li>
                            <li>Сравнивайте результаты с целями</li>
                            <li>Следите за средним баллом</li>
                        </ol>
                    </div>
                </div>
                
                <div class="help-section">
                    <h3>⌨️ Горячие клавиши</h3>
                    <div class="shortcuts-grid">
                        <div class="shortcut-item">
                            <span class="shortcut-key">Ctrl+K / Cmd+K</span>
                            <span class="shortcut-desc">Открыть поиск</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Escape</span>
                            <span class="shortcut-desc">Закрыть поиск/модаль</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-key">Home</span>
                            <span class="shortcut-desc">Перейти на главную</span>
                        </div>
                    </div>
                </div>
                
                <div class="help-section">
                    <h3>💡 Советы для эффективного обучения</h3>
                    <div class="tips-list">
                        <div class="tip-item">
                            <span class="tip-number">1</span>
                            <div>
                                <h4>Проходите темы последовательно</h4>
                                <p>Не пропускайте темы - каждая следующая тема опирается на предыдущие</p>
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-number">2</span>
                            <div>
                                <h4>Повторяйте материал</h4>
                                <p>Вернитесь к сложным темам несколько раз для лучшего усвоения</p>
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-number">3</span>
                            <div>
                                <h4>Проходите тесты регулярно</h4>
                                <p>Тесты помогают закрепить знания и выявить пробелы</p>
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-number">4</span>
                            <div>
                                <h4>Используйте поиск</h4>
                                <p>Быстро найдите нужный материал через встроенный поиск</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="help-contact">
                    <h3>📧 Нужна помощь?</h3>
                    <p>Если вы не нашли ответ на свой вопрос, свяжитесь с нами:</p>
                    <p><strong>Email:</strong> support@invictusapp.local</p>
                    <p><strong>Поддержка:</strong> 24/7 через встроенный чат</p>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    },
    
    // Toggle FAQ answer visibility
    toggleAnswer: function(index) {
        const answer = document.getElementById(`faq-${index}`);
        if (answer) {
            if (answer.style.display === 'none') {
                answer.style.display = 'block';
                event.target.closest('.faq-question').querySelector('.faq-icon').textContent = '−';
            } else {
                answer.style.display = 'none';
                event.target.closest('.faq-question').querySelector('.faq-icon').textContent = '+';
            }
        }
    }
};
