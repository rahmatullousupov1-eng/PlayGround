// Topics Module: отметка прохождения тем.
// Сам просмотр предметов и тем рисует knowledgeModule (modules/knowledge/knowledge.js).
const topicsModule = {
    init: function() {
        console.log('✓ Topics Module Initialized');
    },

    show: function(subjectId) {
        if (typeof knowledgeModule !== 'undefined') knowledgeModule.openSubject(String(subjectId));
    },

    selectTopic: function(subjectId, topicIndex) {
        if (typeof knowledgeModule !== 'undefined') knowledgeModule.openTopic(String(subjectId), Number(topicIndex));
    },

    // Отметить тему пройденной / снять отметку. Ключ темы: «предмет-номер темы».
    toggleCompletion: function(subjectId, topicIndex) {
        if (!appData.user || !appData.user.progress) return;

        const progress = appData.user.progress;
        const topicId = `${subjectId}-${topicIndex}`;
        const index = progress.completedTopics.indexOf(topicId);
        const wasCompleted = index > -1;

        if (wasCompleted) {
            progress.completedTopics.splice(index, 1);
        } else {
            progress.completedTopics.push(topicId);
        }

        // Предмет считается завершённым, когда пройдены все его темы
        const completedSubjects = progress.completedSubjects || [];
        const subjectKey = String(subjectId);
        const subjectIdx = completedSubjects.indexOf(subjectKey);
        const subjectDone = this.isSubjectCompleted(subjectId);

        if (subjectDone && subjectIdx === -1) {
            completedSubjects.push(subjectKey);
        } else if (!subjectDone && subjectIdx > -1) {
            completedSubjects.splice(subjectIdx, 1);
        }
        progress.completedSubjects = completedSubjects;

        if (!wasCompleted && typeof scoringModule !== 'undefined') {
            scoringModule.addPoints(getCurrentUserId(), 'read-topic', subjectId);
        }

        if (typeof persistCurrentUserState === 'function') persistCurrentUserState();

        this.selectTopic(subjectId, topicIndex);

        if (typeof progressModule !== 'undefined' && progressModule.renderProgress) {
            progressModule.renderProgress();
        }

        showTempMessage('✓ Прогресс обновлён');
    },

    isSubjectCompleted: function(subjectId) {
        const subject = appData.subjects && appData.subjects[subjectId];
        if (!subject || !appData.user?.progress) return false;

        const topics = subject.topics || [];
        if (!topics.length) return false;

        return topics.every((topic, index) =>
            appData.user.progress.completedTopics.includes(`${subjectId}-${index}`)
        );
    }
};
