// Subjects Module: экран «Предметы». Список предметов и тем рисует knowledgeModule.
const subjectsModule = {
    currentSubject: null,

    init: function(appData) {
        this.appData = appData;
        if (typeof topicsModule !== 'undefined') topicsModule.init();
        console.log('✓ Subjects Module Initialized');
    },

    show: function() {
        const screen = document.getElementById('subjects-screen');
        if (screen) {
            screen.style.display = 'block';
            this.renderSubjects();
        }
    },

    hide: function() {
        const screen = document.getElementById('subjects-screen');
        if (screen) screen.style.display = 'none';
    },

    renderSubjects: function() {
        if (typeof knowledgeModule !== 'undefined') knowledgeModule.renderSubjects();
    },

    openSubject: function(subjectId) {
        this.currentSubject = subjectId;
        if (typeof knowledgeModule !== 'undefined') knowledgeModule.openSubject(String(subjectId));
    }
};
