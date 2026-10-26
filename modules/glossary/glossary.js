const glossaryModule = {
    init: function() {
        this.allTerms = [];
        this.filteredTerms = [];
        this.selectedCategory = '';
        this.searchQuery = '';
        this.sortBy = 'name';
        this.loadGlossaryData();
        console.log('✓ Glossary Module Initialized');
    },

    loadGlossaryData: function() {
        this.allTerms = [
            {
                term: "Анатомия",
                category: "анатомия",
                definition: "Наука о строении организма и его частей.",
                examples: ["Анатомия человека изучает все органы и системы"],
                related: ["Физиология", "Гистология"],
                popularity: 95
            },
            {
                term: "Атрофия",
                category: "патология",
                definition: "Уменьшение размера и функции органа или ткани.",
                examples: ["Атрофия мышц может возникнуть при длительной неподвижности"],
                related: ["Дистрофия", "Гипотрофия"],
                popularity: 85
            },
            {
                term: "Кардиология",
                category: "диагностика",
                definition: "Раздел медицины, занимающийся болезнями сердца и сосудов.",
                examples: ["Кардиология является одной из основных клинических дисциплин"],
                related: ["Кардиотерапия", "Аритмия"],
                popularity: 90
            },
            {
                term: "Гипертензия",
                category: "патология",
                definition: "Повышенное артериальное давление.",
                examples: ["Гипертензия может привести к инсульту и инфаркту"],
                related: ["Гипотензия", "Гипертонический криз"],
                popularity: 92
            },
            {
                term: "Диагноз",
                category: "диагностика",
                definition: "Определение болезни на основе обследования пациента.",
                examples: ["Врач поставил диагноз после проведения анализов"],
                related: ["Прогноз", "Дифференциальный диагноз"],
                popularity: 98
            },
            {
                term: "Фармакология",
                category: "фармакология",
                definition: "Наука о лекарственных веществах и их действии на организм.",
                examples: ["Фармакология изучает эффекты лекарств"],
                related: ["Лекарство", "Антибиотик"],
                popularity: 88
            },
            {
                term: "Микробиология",
                category: "микробиология",
                definition: "Наука о микроорганизмах и их роли в природе и медицине.",
                examples: ["Микробиология включает изучение бактерий, вирусов и грибков"],
                related: ["Бактерия", "Вирус", "Инфекция"],
                popularity: 86
            },
            {
                term: "Физиология",
                category: "физиология",
                definition: "Наука о функциях живого организма и его частей.",
                examples: ["Физиология изучает как работают органы организма"],
                related: ["Биология", "Анатомия"],
                popularity: 93
            },
            {
                term: "Гепатит",
                category: "патология",
                definition: "Воспаление печени, вызванное различными причинами.",
                examples: ["Гепатит может быть вирусным или аутоиммунным"],
                related: ["Печень", "Цирроз"],
                popularity: 87
            },
            {
                term: "Инфекция",
                category: "микробиология",
                definition: "Проникновение и размножение патогенных микроорганизмов в организме.",
                examples: ["Бактериальная инфекция требует антибиотиков"],
                related: ["Иммунитет", "Антибиотик"],
                popularity: 94
            },
            {
                term: "Метаболизм",
                category: "физиология",
                definition: "Совокупность химических реакций, протекающих в организме.",
                examples: ["Метаболизм обеспечивает энергию для жизни"],
                related: ["Катаболизм", "Анаболизм"],
                popularity: 84
            },
            {
                term: "Синдром",
                category: "диагностика",
                definition: "Совокупность симптомов, характерных для определённого заболевания.",
                examples: ["Синдром Дауна - хромосомная патология"],
                related: ["Симптом", "Болезнь"],
                popularity: 89
            },
            {
                term: "Антибиотик",
                category: "фармакология",
                definition: "Вещество, способное убивать или замедлять рост микроорганизмов.",
                examples: ["Пенициллин - первый открытый антибиотик"],
                related: ["Фармакология", "Инфекция"],
                popularity: 91
            },
            {
                term: "Онкология",
                category: "патология",
                definition: "Раздел медицины, изучающий опухоли и рак.",
                examples: ["Онкология занимается лечением злокачественных опухолей"],
                related: ["Рак", "Опухоль", "Метастаз"],
                popularity: 88
            },
            {
                term: "Анемия",
                category: "патология",
                definition: "Уменьшение количества эритроцитов или гемоглобина в крови.",
                examples: ["Железодефицитная анемия - самый распространённый вид"],
                related: ["Эритроциты", "Гемоглобин"],
                popularity: 85
            }
        ];

        this.filteredTerms = [...this.allTerms];
        this.sortTerms();
    },

    show: function() {
        const screen = document.getElementById('glossary-screen');
        if (screen) {
            screen.style.display = 'block';
            this.render();
        }
    },

    hide: function() {
        const screen = document.getElementById('glossary-screen');
        if (screen) {
            screen.style.display = 'none';
        }
    },

    render: function() {
        this.renderTermsList();
        this.updateStats();
    },

    renderTermsList: function() {
        const termsList = document.getElementById('terms-list');
        termsList.innerHTML = '';

        this.filteredTerms.forEach(term => {
            const termCard = document.createElement('div');
            termCard.className = 'term-card';
            termCard.innerHTML = `
                <div class="term-header">
                    <h3 class="term-name">${term.term}</h3>
                    <span class="category-badge category-${term.category}">${term.category}</span>
                </div>
                <p class="term-preview">${term.definition.substring(0, 80)}...</p>
                <button class="term-btn" data-term="${Safe.esc(term.term)}" onclick="glossaryModule.showDetail(this.dataset.term)">Читать полностью →</button>
            `;
            termsList.appendChild(termCard);
        });
    },

    showDetail: function(termName) {
        const term = this.allTerms.find(t => t.term === termName);
        if (!term) return;

        document.getElementById('detail-term').textContent = term.term;
        document.getElementById('detail-category').textContent = term.category;
        document.getElementById('detail-category').className = `category-badge category-${term.category}`;
        document.getElementById('detail-definition').textContent = term.definition;

        // Примеры
        let examplesHTML = '<h4>Примеры:</h4><ul>';
        term.examples.forEach(ex => {
            examplesHTML += `<li>${ex}</li>`;
        });
        examplesHTML += '</ul>';
        document.getElementById('detail-examples').innerHTML = examplesHTML;

        // Связанные термины
        let relatedHTML = '<h4>Связанные термины:</h4><div class="related-tags">';
        term.related.forEach(rel => {
            relatedHTML += `<span class="related-tag" data-term="${Safe.esc(rel)}" onclick="glossaryModule.searchTerm(this.dataset.term)">${Safe.esc(rel)}</span>`;
        });
        relatedHTML += '</div>';
        document.getElementById('detail-related').innerHTML = relatedHTML;

        document.getElementById('term-detail').style.display = 'flex';
    },

    closeDetail: function() {
        document.getElementById('term-detail').style.display = 'none';
    },

    filterTerms: function() {
        this.searchQuery = document.getElementById('glossary-search').value.toLowerCase();
        this.applyFilters();
    },

    filterByCategory: function() {
        this.selectedCategory = document.getElementById('glossary-filter').value;
        this.applyFilters();
    },

    applyFilters: function() {
        this.filteredTerms = this.allTerms.filter(term => {
            const matchesSearch = term.term.toLowerCase().includes(this.searchQuery) ||
                                 term.definition.toLowerCase().includes(this.searchQuery);
            const matchesCategory = !this.selectedCategory || term.category === this.selectedCategory;
            return matchesSearch && matchesCategory;
        });

        this.sortTerms();
    },

    sortTerms: function() {
        this.sortBy = document.getElementById('glossary-sort')?.value || 'name';

        if (this.sortBy === 'name') {
            this.filteredTerms.sort((a, b) => a.term.localeCompare(b.term));
        } else if (this.sortBy === 'popularity') {
            this.filteredTerms.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        } else if (this.sortBy === 'recent') {
            this.filteredTerms.reverse();
        }

        this.renderTermsList();
        this.updateStats();
    },

    searchTerm: function(term) {
        document.getElementById('glossary-search').value = term;
        this.filterTerms();
        this.closeDetail();
        document.querySelector('.terms-list').scrollIntoView({ behavior: 'smooth' });
    },

    updateStats: function() {
        document.getElementById('terms-count').textContent = `Найдено: ${this.filteredTerms.length} терминов`;
    }
};
