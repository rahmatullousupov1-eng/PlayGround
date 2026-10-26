const crosswordModule = {
    init: function() {
        this.currentCrossword = null;
        this.hints = 3;
        this.loadCrosswordData();
        console.log('✓ Crossword Module Initialized');
    },

    loadCrosswordData: function() {
        this.currentCrossword = {
            title: "Медицинские термины",
            words: [
                { word: "СЕРДЦЕ", clue: "Орган, качающий кровь", position: { row: 0, col: 0 }, direction: "horizontal" },
                { word: "ЛЕГКИЕ", clue: "Органы дыхания", position: { row: 2, col: 0 }, direction: "horizontal" },
                { word: "ПЕЧЕНЬ", clue: "Самый большой орган", position: { row: 4, col: 0 }, direction: "horizontal" },
                { word: "КОСТИ", clue: "Основа скелета", position: { row: 0, col: 7 }, direction: "horizontal" },
                { word: "МЫШЦЫ", clue: "Органы движения", position: { row: 2, col: 7 }, direction: "horizontal" },
                { word: "КРОВЬ", clue: "Жидкая ткань организма", position: { row: 4, col: 7 }, direction: "horizontal" },
                { word: "НЕРВЫ", clue: "Проводники импульсов", position: { row: 6, col: 0 }, direction: "horizontal" },
                { word: "МОЗГ", clue: "Центральный орган нервной системы", position: { row: 6, col: 6 }, direction: "horizontal" }
            ],
            size: 12
        };
    },

    show: function() {
        const screen = document.getElementById('crossword-screen');
        if (screen) {
            screen.style.display = 'block';
            this.render();
        }
    },

    hide: function() {
        const screen = document.getElementById('crossword-screen');
        if (screen) {
            screen.style.display = 'none';
        }
    },

    render: function() {
        this.renderGrid();
        this.renderClues();
        this.updateStats();
    },

    renderGrid: function() {
        const gridContainer = document.getElementById('crossword-grid');
        gridContainer.innerHTML = '';
        
        const grid = Array(this.currentCrossword.size).fill(null).map(() => 
            Array(this.currentCrossword.size).fill(null)
        );

        // Отметить позиции букв
        this.currentCrossword.words.forEach((word, wordIdx) => {
            const row = word.position.row;
            const col = word.position.col;
            
            for (let i = 0; i < word.word.length; i++) {
                if (word.direction === 'horizontal') {
                    if (grid[row][col + i] === null) {
                        grid[row][col + i] = { letter: '', wordIdx: wordIdx, letterIdx: i };
                    } else {
                        grid[row][col + i].wordIdx = wordIdx;
                        grid[row][col + i].letterIdx = i;
                    }
                } else {
                    if (grid[row + i][col] === null) {
                        grid[row + i][col] = { letter: '', wordIdx: wordIdx, letterIdx: i };
                    } else {
                        grid[row + i][col].wordIdx = wordIdx;
                        grid[row + i][col].letterIdx = i;
                    }
                }
            }
        });

        // Создать таблицу
        const table = document.createElement('table');
        table.className = 'crossword-table';
        
        for (let r = 0; r < this.currentCrossword.size; r++) {
            const tr = document.createElement('tr');
            for (let c = 0; c < this.currentCrossword.size; c++) {
                const td = document.createElement('td');
                
                if (grid[r][c] !== null) {
                    td.className = 'crossword-cell active';
                    
                    // Input для ввода буквы
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = '1';
                    input.className = 'cell-input';
                    input.dataset.row = r;
                    input.dataset.col = c;
                    
                    input.addEventListener('input', (e) => {
                        e.target.value = e.target.value.toUpperCase();
                        if (e.target.value.length === 1) {
                            // Перейти к следующей ячейке
                            const nextInput = document.querySelector(`input[data-row="${r}"][data-col="${c+1}"]`);
                            if (nextInput) nextInput.focus();
                        }
                    });
                    
                    td.appendChild(input);
                } else {
                    td.className = 'crossword-cell inactive';
                }
                
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        
        gridContainer.appendChild(table);
    },

    renderClues: function() {
        const horizontalClues = document.getElementById('horizontal-clues');
        const verticalClues = document.getElementById('vertical-clues');
        
        horizontalClues.innerHTML = '';
        verticalClues.innerHTML = '';

        this.currentCrossword.words.forEach((word, idx) => {
            const li = document.createElement('li');
            li.className = 'clue-item';
            li.innerHTML = `<strong>${idx + 1}.</strong> ${word.clue}`;
            
            if (word.direction === 'horizontal') {
                horizontalClues.appendChild(li);
            } else {
                verticalClues.appendChild(li);
            }
        });

        document.getElementById('total-answers').textContent = this.currentCrossword.words.length;
    },

    updateStats: function() {
        const inputs = document.querySelectorAll('.cell-input');
        let filled = 0;
        
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                filled++;
            }
        });

        document.getElementById('crossword-solved').textContent = `Решено: ${filled}/${this.currentCrossword.words.length}`;
    },

    checkAnswers: function() {
        let correct = 0;
        let total = 0;
        const resultDiv = document.getElementById('crossword-result');
        let details = '';

        this.currentCrossword.words.forEach((word, idx) => {
            total++;
            let userAnswer = '';
            const inputs = document.querySelectorAll('.cell-input');
            const row = word.position.row;
            const col = word.position.col;
            
            for (let i = 0; i < word.word.length; i++) {
                if (word.direction === 'horizontal') {
                    const input = document.querySelector(`input[data-row="${row}"][data-col="${col + i}"]`);
                    if (input) userAnswer += input.value;
                } else {
                    const input = document.querySelector(`input[data-row="${row + i}"][data-col="${col}"]`);
                    if (input) userAnswer += input.value;
                }
            }

            if (userAnswer === word.word) {
                correct++;
                details += `<p style="color: #4caf50;">✓ ${word.clue}</p>`;
            } else {
                details += `<p style="color: #f44336;">✗ ${word.clue} <strong>(${word.word})</strong></p>`;
            }
        });

        const percentage = Math.round((correct / total) * 100);
        
        document.getElementById('result-title').textContent = `Результат: ${percentage}%`;
        document.getElementById('result-message').textContent = `Правильных ответов: ${correct} из ${total}`;
        document.getElementById('result-details').innerHTML = details;
        
        resultDiv.style.display = 'flex';
        
        // Сохранить прогресс
        if (appData.user) {
            appData.user.progress = appData.user.progress || {};
            appData.user.progress.crosswordScore = percentage;
            if (typeof scoringModule !== 'undefined') {
                const currentUserId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : (appData.user.id || appData.user.fullname);
                scoringModule.addPoints(currentUserId, 'complete-crossword');
            }
            if (typeof persistCurrentUserState === 'function') persistCurrentUserState();
        }
    },

    showHint: function() {
        if (this.hints > 0) {
            const randomWord = this.currentCrossword.words[Math.floor(Math.random() * this.currentCrossword.words.length)];
            showTempMessage(`💡 Подсказка: ${randomWord.clue}`);
            this.hints--;
        } else {
            showTempMessage('❌ Подсказки закончились!');
        }
    },

    resetCrossword: function() {
        document.querySelectorAll('.cell-input').forEach(input => {
            input.value = '';
        });
        this.updateStats();
        showTempMessage('🔄 Сканворд очищен');
    },

    closeResult: function() {
        document.getElementById('crossword-result').style.display = 'none';
    }
};
