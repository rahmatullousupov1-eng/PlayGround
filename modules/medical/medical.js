/* ============================================================
   Invictus v3.0 — 🩺 Медицинский блок
   Клинические случаи, словарь, полезные каналы
   ============================================================ */
const medicalModule = {
    CASES: [
        { title: 'Острый аппендицит', tags: ['хирургия'], text: 'Пациент 24 лет, боль в правой подвздошной области, тошнота, t 37,8 °C. Симптом Щёткина-Блюмберга положительный. Лейкоцитоз 14×10⁹/л. Куда направите и почему?' },
        { title: 'Гипертонический криз', tags: ['терапия'], text: 'АД 210/120 мм рт. ст., головная боль, шум в ушах, покраснение лица. Какие препараты первой линии, какой темп снижения АД допустим в первые 2 часа?' },
        { title: 'Диабетический кетоацидоз', tags: ['эндокринология'], text: 'Подросток 17 лет, запах ацетона, дыхание Куссмауля, глюкоза крови 28 ммоль/л, рН 7,1. Алгоритм инфузионной и инсулиновой терапии?' },
        { title: 'Инфаркт миокарда', tags: ['кардиология'], text: 'Мужчина 58 лет, давящая боль за грудиной 40 мин, холодный пот, ЭКГ: ST выше изолинии в V1–V4. Что делать на догоспитальном этапе?' },
        { title: 'Острый панкреатит', tags: ['хирургия'], text: 'Женщина 45 лет после обильного застолья: опоясывающая боль, многократная рвота, амилаза крови >1100 Ед/л. Тактика ведения?' },
        { title: 'Анафилактический шок', tags: ['реанимация'], text: 'После укуса пчелы: крапивница, отёк гортани, АД 70/40, бронхоспазм. Первая помощь и порядок введения адреналина?' }
    ],

    TERMS: [
        { term: 'Аускультация', def: 'Метод выслушивания звуковых явлений, возникающих в органах, с помощью стетоскопа.' },
        { term: 'Пальпация', def: 'Ощупывание поверхностных и глубоких тканей для оценки их состояния.' },
        { term: 'Перкуссия', def: 'Выстукивание участков тела для определения границ и плотности органов.' },
        { term: 'Анамнез', def: 'Совокупность сведений о пациенте, собранных при опросе.' },
        { term: 'Дифференциальный диагноз', def: 'Сравнение симптомов с несколькими возможными заболеваниями для исключения неверных.' },
        { term: 'Триаж', def: 'Сортировка пациентов по тяжести состояния в приёмном отделении.' },
        { term: 'Аускультация лёгких', def: 'Выслушивание дыхательных шумов: везикулярных, бронхиальных, хрипов.' },
        { term: 'Интубация', def: 'Введение трубки в трахею для обеспечения проходимости дыхательных путей.' }
    ],

    CHANNELS: [
        { name: 'Клинические рекомендации МЗ', desc: 'Официальные алгоритмы диагностики и лечения', url: 'https://cr.minzdrav.gov.ru/' },
        { name: 'PubMed', desc: 'Мировая база медицинских исследований', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
        { name: 'Русская Википедия: Медицина', desc: 'Обзоры болезней и методов лечения', url: 'https://ru.wikipedia.org/wiki/Медицина' },
        { name: 'WebMD (ENG)', desc: 'Международный портал о здоровье', url: 'https://www.webmd.com/' },
        { name: 'НМИЦ им. Алмазова', desc: 'Образовательные программы и вебинары', url: 'https://www.almazovcentre.ru/' }
    ],

    activeTab: 'cases',
    filteredCases: null,
    searchTerm: '',

    show: function() {
        const screen = document.getElementById('medical-screen');
        if (screen) screen.style.display = 'block';
        this.render();
    },

    setTab: function(tab) {
        this.activeTab = tab;
        this.render();
    },

    filterCases: function() {
        const q = (document.getElementById('medical-search')?.value || '').toLowerCase().trim();
        this.searchTerm = q;
        if (!q) {
            this.filteredCases = null;
        } else {
            this.filteredCases = this.CASES.filter(c => (c.title + ' ' + (c.tags || []).join(' ') + ' ' + c.text).toLowerCase().includes(q));
        }
        const list = document.getElementById('medical-cases-list');
        if (list) this.renderCases();
    },

    render: function() {
        const root = document.getElementById('medical-content');
        if (!root) return;

        const tab = this.activeTab;
        let body = '';
        if (tab === 'cases') {
            body = `
                <div class="med-search-row">
                    <input id="medical-search" class="med-search" placeholder="🔍 Поиск по случаям: аппендицит, криз..." oninput="medicalModule.filterCases()">
                </div>
                <div class="med-cases" id="medical-cases-list">${this.renderCases()}</div>
            `;
        } else if (tab === 'terms') {
            body = `<div class="med-terms">${this.TERMS.map(t => `
                <div class="med-term-card">
                    <div class="med-term-name">${medicalModule.esc(t.term)}</div>
                    <div class="med-term-def">${medicalModule.esc(t.def)}</div>
                </div>
            `).join('')}</div>`;
        } else {
            body = `<div class="med-channels">${this.CHANNELS.map(c => `
                <div class="med-channel-card" onclick="medicalModule.openUrl('${medicalModule.esc(c.url)}')">
                    <div class="med-channel-name">🔗 ${medicalModule.esc(c.name)}</div>
                    <div class="med-channel-desc">${medicalModule.esc(c.desc)}</div>
                </div>
            `).join('')}</div>`;
        }

        root.innerHTML = `
            <div class="med-head">
                <h1>🩺 Клиническая практика</h1>
                <p>Клинические случаи, словарь и профессиональные ресурсы для врачей и студентов</p>
            </div>
            <div class="med-tabs">
                <button class="med-tab ${tab === 'cases' ? 'active' : ''}" onclick="medicalModule.setTab('cases')">🏥 Случаи</button>
                <button class="med-tab ${tab === 'terms' ? 'active' : ''}" onclick="medicalModule.setTab('terms')">📖 Словарь</button>
                <button class="med-tab ${tab === 'channels' ? 'active' : ''}" onclick="medicalModule.setTab('channels')">📡 Каналы</button>
            </div>
            ${body}
        `;
        if (tab === 'cases' && this.searchTerm) {
            const input = document.getElementById('medical-search');
            if (input) input.value = this.searchTerm;
        }
    },

    renderCases: function() {
        const list = this.filteredCases || this.CASES;
        if (!list.length) return '<div class="med-empty">Ничего не найдено 😔</div>';
        return list.map(c => `
            <div class="med-case-card">
                <div class="med-case-title">${medicalModule.esc(c.title)}
                    <span class="med-case-tags">${(c.tags || []).map(t => `<i>${medicalModule.esc(t)}</i>`).join('')}</span>
                </div>
                <div class="med-case-text">${medicalModule.esc(c.text)}</div>
            </div>
        `).join('');
    },

    openUrl: function(url) {
        const safe = (window.Safe && Safe.url(url, { protocols: ['https:', 'http:'] })) || '';
        if (safe && typeof window.open === 'function') window.open(safe, '_blank', 'noopener,noreferrer');
    },

    esc: function(text) {
        return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
};

window.medicalModule = medicalModule;
