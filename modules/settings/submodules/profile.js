// Profile Submodule - User profile management
const profileSubmodule = {
    init: function() {
        console.log('✓ Profile Submodule Initialized');
    },
    
    // Show profile management
    show: function() {
        const content = document.getElementById('settings-content');
        if (!content || !appData.user) return;
        
        const user = appData.user;
        const isOwner = user.role === 'owner';
        const isTeacher = user.role === 'teacher';
        const registrationDate = new Date(user.registrationDate).toLocaleDateString('ru-RU');
        
        let html = `
            <div class="profile-container">
                <button class="btn-back" onclick="navigationManager.goTo('profile')">← Назад к профилю</button>
                
                <div class="profile-header">
                    <div class="avatar-display">${user.avatar}</div>
                    <div class="profile-info">
                        <h2>${Safe.esc(user.fullname)}</h2>
                        <p class="profile-subtitle">${isOwner ? 'Владелец' : isTeacher ? 'Преподаватель' : 'Студент'}</p>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>👤 Личная информация</h3>
                    <div class="profile-field">
                        <label>Фамилия:</label>
                        <input type="text" id="profile-lastname" value="${user.lastname}" placeholder="Фамилия">
                    </div>
                    <div class="profile-field">
                        <label>Имя:</label>
                        <input type="text" id="profile-name" value="${Safe.esc(user.name)}" placeholder="Имя">
                    </div>
                    <div class="profile-field">
                        <label>Пол:</label>
                        <select id="profile-gender">
                            <option value="male" ${user.gender === 'male' ? 'selected' : ''}>Мужчина</option>
                            <option value="female" ${user.gender === 'female' ? 'selected' : ''}>Женщина</option>
                        </select>
                    </div>
                </div>
                
                ${!isTeacher && !isOwner ? '' : `
                    <div class="profile-section">
                        <h3>${isOwner ? '👑 Роль и доступ' : '👨‍🏫 Роль и доступ'}</h3>
                        <div class="info-field">
                            <span class="label">Роль:</span>
                            <span class="value">${isOwner ? 'Владелец' : 'Преподаватель'}</span>
                        </div>
                        <div class="info-field">
                            <span class="label">Доступ:</span>
                            <span class="value">${isOwner ? 'Полный доступ к контенту, пользователям, аналитике и настройкам' : 'Просмотр студентов, рейтинга и учебной аналитики'}</span>
                        </div>
                    </div>
                `}

                <div class="profile-section">
                    <h3>📊 Статистика</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${user.progress.completedTopics.length}</div>
                            <div class="stat-label">Тем пройдено</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${Object.keys(user.progress.scores).length}</div>
                            <div class="stat-label">Тестов сдано</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${user.progress.testResults ? user.progress.testResults.length : 0}</div>
                            <div class="stat-label">Попыток всего</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">
                                ${user.progress.testResults && user.progress.testResults.length > 0
                                    ? Math.round(user.progress.testResults.reduce((sum, r) => sum + r.score, 0) / user.progress.testResults.length)
                                    : 0}%
                            </div>
                            <div class="stat-label">Средний балл</div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>📅 Информация об аккаунте</h3>
                    <div class="info-field">
                        <span class="label">Дата регистрации:</span>
                        <span class="value">${registrationDate}</span>
                    </div>
                    <div class="info-field">
                        <span class="label">Адрес электронной почты:</span>
                        <span class="value">${Safe.esc(user.email) || 'Не указан'}</span>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn-primary" onclick="profileSubmodule.saveChanges()">
                        💾 Сохранить изменения
                    </button>
                    <button class="btn-danger" onclick="if(confirm('Удалить профиль и все данные?')) profileSubmodule.deleteProfile()">
                        🗑️ Удалить профиль
                    </button>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    },
    
    // Save profile changes
    saveChanges: function() {
        const lastname = document.getElementById('profile-lastname').value.trim();
        const name = document.getElementById('profile-name').value.trim();
        const gender = document.getElementById('profile-gender').value;
        
        if (!lastname || !name) {
            showTempMessage('❌ Заполните все поля');
            return;
        }
        
        appData.user.lastname = lastname;
        appData.user.name = name;
        appData.user.fullname = `${lastname} ${name}`;
        appData.user.gender = gender;
        
        if (typeof persistCurrentUserState === 'function') persistCurrentUserState();
        
        showTempMessage('✓ Профиль обновлён');
        setTimeout(() => this.show(), 1000);
    },
    
    // Delete profile
    deleteProfile: function() {
        if (appData.user?.role === 'owner') {
            showTempMessage('❌ Встроенный аккаунт владельца удалить нельзя');
            return;
        }

        if (!appData.user?.isGuest && typeof authenticationModule !== 'undefined') {
            const deleted = authenticationModule.deleteUser(appData.user.username || appData.user.id);
            if (!deleted?.success) {
                showTempMessage(deleted?.message || '❌ Не удалось удалить профиль');
                return;
            }
        }
        if (typeof enterGuestMode === 'function') {
            enterGuestMode();
        } else {
            localStorage.removeItem('invictusUser');
            appData.user = null;
        }
        showTempMessage('✓ Профиль удален');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
};
