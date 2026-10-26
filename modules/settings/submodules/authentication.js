// ============================================
// Authentication Module - Registration & Login
// ============================================

const BUILTIN_OWNER_ACCOUNT = {
    id: 'owner',
    username: 'owner',
    fullname: 'Владелец приложения',
    email: 'owner@invictus.app',
    needsSetup: true,
    role: 'owner',
    avatar: '👑',
    isGuest: false,
    registrationDate: '2026-01-01T00:00:00.000Z',
    permissions: {
        canViewStudents: true,
        canViewRatings: true,
        canReviewProgress: true,
        canManageContent: true,
        canManageUsers: true,
        canManageSettings: true,
        canExportData: true,
        canManageTasks: true,
        canAssignTasks: true,
        canReviewTasks: true,
        canManageSync: true
    }
};


// ============================================
// WebCrypto PBKDF2 Password Hashing
// ============================================
const CryptoHash = {
    SALT_LEN: 16,
    ITERATIONS: 100000,
    KEY_LEN: 32,

    _getSalt: function() {
        return crypto.getRandomValues(new Uint8Array(this.SALT_LEN));
    },

    _toHex: function(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    _fromHex: function(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    },

    hash: async function(password) {
        const salt = this._getSalt();
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: salt, iterations: this.ITERATIONS, hash: 'SHA-256' },
            key,
            this.KEY_LEN * 8
        );
        const saltHex = this._toHex(salt);
        const hashHex = this._toHex(bits);
        return 'pbkdf2:' + this.ITERATIONS + ':' + saltHex + ':' + hashHex;
    },

    verify: async function(password, stored) {
        if (!stored) return false;
        // Legacy Base64 format migration
        if (!stored.startsWith('pbkdf2:')) {
            return stored === btoa(password + 'invictussalt');
        }
        const parts = stored.split(':');
        if (parts.length !== 4) return false;
        const iterations = parseInt(parts[1]);
        const salt = this._fromHex(parts[2]);
        const expectedHash = parts[3];
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' },
            key,
            this.KEY_LEN * 8
        );
        return this._toHex(bits) === expectedHash;
    }
};

const ROLE_META = {
    owner: { label: 'Владелец', avatar: '👑', usernamePrefix: 'owner' },
    assistant_admin: { label: 'Главный помощник', avatar: '🛠️', usernamePrefix: 'assistant' },
    assistant_editor: { label: 'Помощник-редактор', avatar: '🧩', usernamePrefix: 'editor' },
    teacher: { label: 'Преподаватель', avatar: '👨‍🏫', usernamePrefix: 'teacher' },
    student: { label: 'Студент', avatar: '👤', usernamePrefix: 'student' }
};

const authenticationModule = {
    users: {},        // Хранилище пользователей {username: userData}
    teacherPasswords: {},  // Спец. пароли для преподавателей {username: password}
    currentUser: null,
    
    init: function() {
        this.loadUsers();
        this.restoreSession();
        console.log('✓ Authentication Module Initialized');
    },

    getDefaultPermissions: function(role) {
        if (role === 'owner') {
            return {
                canViewStudents: true,
                canViewRatings: true,
                canReviewProgress: true,
                canManageContent: true,
                canManageUsers: true,
                canManageSettings: true,
                canExportData: true,
                canManageTasks: true,
                canAssignTasks: true,
                canReviewTasks: true,
                canManageSync: true
            };
        }

        if (role === 'assistant_admin') {
            return {
                canViewStudents: true,
                canViewRatings: true,
                canReviewProgress: true,
                canManageContent: true,
                canManageUsers: false,
                canManageSettings: false,
                canExportData: true,
                canManageTasks: true,
                canAssignTasks: true,
                canReviewTasks: true,
                canManageSync: false
            };
        }

        if (role === 'assistant_editor') {
            return {
                canViewStudents: false,
                canViewRatings: true,
                canReviewProgress: false,
                canManageContent: true,
                canManageUsers: false,
                canManageSettings: false,
                canExportData: true,
                canManageTasks: true,
                canAssignTasks: false,
                canReviewTasks: false,
                canManageSync: false
            };
        }

        if (role === 'teacher') {
            return {
                canViewStudents: true,
                canViewRatings: true,
                canReviewProgress: true,
                canManageContent: false,
                canManageTasks: false,
                canAssignTasks: false,
                canReviewTasks: false
            };
        }

        return {
            canViewStudents: false,
            canViewRatings: true,
            canReviewProgress: false,
            canManageContent: false,
            canManageTasks: false,
            canAssignTasks: false,
            canReviewTasks: false
        };
    },

    getRoleMeta: function(role) {
        return ROLE_META[role] || ROLE_META.student;
    },

    normalizeStoredUser: function(userData) {
        const baseProgress = typeof createEmptyProgress === 'function'
            ? createEmptyProgress()
            : { completedTopics: [], completedSubjects: [], scores: {}, testResults: [], points: 0 };

        const progress = { ...baseProgress, ...(userData.progress || {}) };
        if (!Array.isArray(progress.completedTopics)) progress.completedTopics = [];
        if (!Array.isArray(progress.completedSubjects)) progress.completedSubjects = [];
        delete progress.completedCourses;
        if (!progress.scores || typeof progress.scores !== 'object') progress.scores = {};
        if (!Array.isArray(progress.testResults)) progress.testResults = [];
        if (typeof progress.points !== 'number') progress.points = 0;

        progress.completedTopics = [...new Set(progress.completedTopics.map(key =>
            typeof migrateLegacyTopicKey === 'function' ? migrateLegacyTopicKey(key) : String(key)
        ))];
        if (typeof recomputeCompletedSubjects === 'function' && window.appData?.subjects) {
            progress.completedSubjects = recomputeCompletedSubjects(progress, window.appData.subjects);
        }

        const { course: _legacyCourse, ...userDataWithoutCourse } = userData;

        return {
            ...userDataWithoutCourse,
            id: userData.id || userData.username || userData.email,
            username: userData.username || userData.id || userData.email,
            fullname: userData.fullname || 'Пользователь',
            email: userData.email || '',
            role: userData.role || 'student',
            avatar: userData.avatar || this.getRoleMeta(userData.role).avatar,
            isGuest: false,
            registrationDate: userData.registrationDate || new Date().toISOString(),
            needsSetup: Boolean(userData.needsSetup),
            permissions: { ...this.getDefaultPermissions(userData.role), ...(userData.permissions || {}) },
            progress
        };
    },

    validateFullname: function(fullname) {
        const v = String(fullname || '').trim();
        // 3–80 символов, без угловых скобок, кавычек-ловушек и управляющих символов
        return v.length >= 3 && v.length <= 80 && !/[<>\u0000-\u001f]/.test(v);
    },

    normalizeFullname: function(fullname) {
        return String(fullname || '').trim().replace(/\s+/g, ' ');
    },

    RESERVED_USERNAMES: ['__proto__', 'constructor', 'prototype', 'owner', 'admin', 'root', 'system', 'guest'],

    // Безопасный username: только a-z, 0-9, _ и -; уникальный; не совпадает со служебными именами
    makeUsername: function(email, prefix) {
        let base = String(email || '').split('@')[0].toLowerCase()
            .replace(/[^a-z0-9_-]/g, '_').replace(/^_+|_+$/g, '').slice(0, 32) || 'user';
        if (prefix) base = prefix + '_' + base;
        if (this.RESERVED_USERNAMES.includes(base)) base = 'u_' + base;
        let username = base;
        let counter = 1;
        while (Object.prototype.hasOwnProperty.call(this.users, username) || this.RESERVED_USERNAMES.includes(username)) {
            username = base + counter;
            counter++;
        }
        return username;
    },

    validateEmail: function(email) {
        // Строгая проверка: без кавычек, угловых скобок и пробелов (адрес потом попадает в интерфейс и в идентификаторы)
        return Boolean(email && String(email).length <= 254 && /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/.test(email));
    },

    validatePassword: function(password) {
        return Boolean(password && password.length >= 8 && /[A-Za-zА-Яа-я]/.test(password) && /\d/.test(password));
    },
    
    // Загрузить пользователей из localStorage
    loadUsers: function() {
        const saved = localStorage.getItem('appUsers');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.users = Object.keys(parsed || {}).reduce((acc, username) => {
                    acc[username] = this.normalizeStoredUser(parsed[username]);
                    return acc;
                }, {});
            } catch (e) {
                console.error('Ошибка при загрузке пользователей:', e);
            }
        }

        // Безопасность: пароли сотрудников больше не хранятся. Удаляем то, что накопилось в старых версиях.
        try { localStorage.removeItem('appTeacherPasswords'); } catch (e) { /* ignore */ }
        this.teacherPasswords = {};

        this.ensureBuiltInUsers();
    },

    restoreSession: function() {
        const saved = localStorage.getItem('currentUser');
        if (!saved) return;

        try {
            const parsed = JSON.parse(saved);
            const username = parsed.username || parsed.id;
            if (username && this.users[username]) {
                this.currentUser = this.normalizeStoredUser(this.users[username]);
            }
        } catch (error) {
            console.warn('Не удалось восстановить текущую сессию:', error);
        }
    },
    
    // Сохранить пользователей в localStorage
    saveUsers: function() {
        localStorage.setItem('appUsers', JSON.stringify(this.users));
    },

    ensureBuiltInUsers: function() {
        const ownerUsername = BUILTIN_OWNER_ACCOUNT.username;
        if (!this.users[ownerUsername]) {
            const ownerRecord = {
                ...BUILTIN_OWNER_ACCOUNT,
                password: null,
                needsSetup: true
            };
            this.users[ownerUsername] = this.normalizeStoredUser(ownerRecord);
            this.saveUsers();
        }
    },

    saveSessionUser: function(userData) {
        this.currentUser = this.normalizeStoredUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    },

    syncStoredUser: function(userData) {
        if (!userData || userData.isGuest) return;

        const username = userData.username || userData.id;
        if (!username) return;

        const normalized = this.normalizeStoredUser(userData);
        this.users[username] = {
            ...(this.users[username] || {}),
            ...normalized
        };
        this.saveUsers();

        if (this.currentUser && (this.currentUser.username === username || this.currentUser.id === username)) {
            this.saveSessionUser(normalized);
        }
    },
    
    // Зарегистрировать нового пользователя (Студент)
    registerStudent: async function(fullname, email, password) {
        // Валидация
        if (!this.validateFullname(fullname)) {
            return { success: false, message: '❌ Имя: от 3 до 80 символов, без символов < и >' };
        }
        email = String(email || '').trim().toLowerCase();
        fullname = this.normalizeFullname(fullname);
        if (!this.validateEmail(email)) {
            return { success: false, message: '❌ Некорректный email' };
        }
        if (!this.validatePassword(password)) {
            return { success: false, message: '❌ Пароль должен быть минимум 8 символов и содержать буквы и цифры' };
        }
        
        // Проверка уникальности email (без учёта регистра)
        for (let existing in this.users) {
            if (String(this.users[existing].email || '').toLowerCase() === email) {
                return { success: false, message: '❌ Этот email уже зарегистрирован' };
            }
        }
        
        // Безопасный username (не берём «сырую» часть email)
        const username = this.makeUsername(email);
        
        // Создать пользователя
        const userData = {
            id: username,
            username: username,
            fullname: fullname,
            email: email,
            password: await this.hashPassword(password),
            role: 'student',
            avatar: '👤',
            registrationDate: new Date().toISOString(),
            isGuest: false,
            permissions: this.getDefaultPermissions('student'),
            progress: typeof createEmptyProgress === 'function' ? createEmptyProgress() : { completedTopics: [], completedSubjects: [], scores: {}, testResults: [], points: 0 }
        };
        
        this.users[username] = this.normalizeStoredUser(userData);
        this.saveUsers();
        
        console.log(`✓ Студент зарегистрирован: ${username}`);
        return { success: true, message: '✅ Регистрация успешна! Добро пожаловать, ' + fullname, userData: this.users[username] };
    },
    
    // Логин пользователя
    loginUser: async function(email, password) {
        const login = String(email || '').trim();
        // Найти пользователя по email или username
        let userData = null;
        let username = null;

        if (Object.prototype.hasOwnProperty.call(this.users, login)) {
            userData = this.users[login];
            username = login;
        }
        
        if (!userData) {
            const loginLower = login.toLowerCase();
            for (let uname in this.users) {
                if (String(this.users[uname].email || '').toLowerCase() === loginLower) {
                    userData = this.users[uname];
                    username = uname;
                    break;
                }
            }
        }
        
        if (!userData) {
            return { success: false, message: '❌ Логин или email не найден' };
        }
        
        // Проверить пароль
        if (!await this.checkPassword(password, userData.password)) {
            return { success: false, message: '❌ Неверный пароль' };
        }

        // Старый обратимый хэш (base64) заменяем на PBKDF2 сразу после успешного входа
        if (typeof userData.password === 'string' && !userData.password.startsWith('pbkdf2:')) {
            userData.password = await this.hashPassword(password);
            this.users[username] = this.normalizeStoredUser(userData);
            userData = this.users[username];
            this.saveUsers();
        }
        
        this.saveSessionUser(userData);
        console.log(`✓ Пользователь логирован: ${username}`);
        return { success: true, message: '✅ Вход успешен!', userData: this.currentUser };
    },

    logout: function() {
        this.currentUser = null;
        ['currentUser', 'supabase_session', 'aiSearchHistory', 'searchHistory'].forEach(k => {
            try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
        });
        try {
            if (typeof SupabaseAuthProvider !== 'undefined' && SupabaseAuthProvider.signOut) SupabaseAuthProvider.signOut();
        } catch (e) { /* ignore */ }
    },
    
    // Простое хеширование пароля (не криптографический, для демо)
    hashPassword: async function(password) {
        return await CryptoHash.hash(password);
    },
    
    // Проверить пароль (async, поддерживает миграцию legacy Base64)
    checkPassword: async function(password, hash) {
        if (!hash) return false;
        return await CryptoHash.verify(password, hash);
    },
    
    // Настройка пароля владельца при первом входе
    setupOwnerPassword: async function(password) {
        const ownerUsername = BUILTIN_OWNER_ACCOUNT.username;
        const userData = this.users[ownerUsername];
        if (!userData) return { success: false, message: '❌ Аккаунт владельца не найден' };
        if (!userData.needsSetup) return { success: false, message: '✅ Пароль уже настроен' };
        if (!this.validatePassword(password)) {
            return { success: false, message: '❌ Пароль должен быть минимум 8 символов и содержать буквы и цифры' };
        }
        userData.password = await this.hashPassword(password);
        userData.needsSetup = false;
        this.users[ownerUsername] = this.normalizeStoredUser(userData);
        this.saveUsers();
        this.saveSessionUser(userData);
        return { success: true, message: '✅ Пароль владельца настроен!' };
    },

    // Получить пользователя по username
    getUserByUsername: function(username) {
        return this.users[username] || null;
    },
    
    // Получить пользователя по email
    getUserByEmail: function(email) {
        for (let username in this.users) {
            if (this.users[username].email === email) {
                return this.users[username];
            }
        }
        return null;
    },
    
    // Получить список всех пользователей (для режима разработчика)
    getAllUsers: function() {
        return Object.keys(this.users).map(username => ({
            username: username,
            ...this.users[username]
        }));
    },

    getAllStudents: function() {
        return this.getAllUsers().filter(user => user.role === 'student');
    },

    getAllTeachers: function() {
        return this.getAllUsers().filter(user => user.role === 'teacher');
    },

    getAllAssistants: function() {
        return this.getAllUsers().filter(user => user.role === 'assistant_admin' || user.role === 'assistant_editor');
    },

    createStaffUser: async function(fullname, email, password, role = 'assistant_editor') {
        if (!this.validateFullname(fullname)) {
            return { success: false, message: '❌ Имя должно быть минимум 3 символа' };
        }
        if (!this.validateEmail(email)) {
            return { success: false, message: '❌ Некорректный email' };
        }
        if (!this.validatePassword(password)) {
            return { success: false, message: '❌ Пароль должен быть минимум 8 символов и содержать буквы и цифры' };
        }

        const allowedRoles = ['teacher', 'assistant_admin', 'assistant_editor'];
        const normalizedRole = allowedRoles.includes(role) ? role : 'assistant_editor';

        email = String(email || '').trim().toLowerCase();
        fullname = this.normalizeFullname(fullname);
        for (let existing in this.users) {
            if (String(this.users[existing].email || '').toLowerCase() === email) {
                return { success: false, message: '❌ Этот email уже используется' };
            }
        }

        const meta = this.getRoleMeta(normalizedRole);
        const username = this.makeUsername(email, meta.usernamePrefix);

        const userData = {
            id: username,
            username,
            fullname,
            email,
            password: await this.hashPassword(password),
            role: normalizedRole,
            avatar: meta.avatar,
            registrationDate: new Date().toISOString(),
            isGuest: false,
            permissions: this.getDefaultPermissions(normalizedRole),
            progress: typeof createEmptyProgress === 'function' ? createEmptyProgress() : { completedTopics: [], completedSubjects: [], scores: {}, testResults: [], points: 0 }
        };

        this.users[username] = this.normalizeStoredUser(userData);
        this.saveUsers();

        // Пароль показывается создателю один раз и нигде не сохраняется
        return { success: true, message: `✅ ${meta.label} создан!`, userData: this.users[username], password };
    },
    
    // Создать преподавателя (только из режима разработчика)
    createTeacher: async function(fullname, email, password) {
        const result = await this.createStaffUser(fullname, email, password, 'teacher');
        if (result.success) {
            console.log(`✓ Преподаватель создан: ${result.userData.username}`);
        }
        return result;
    },

    updateUserRole: function(username, role) {
        const userData = this.users[username];
        if (!userData) {
            return { success: false, message: '❌ Пользователь не найден' };
        }

        if (username === BUILTIN_OWNER_ACCOUNT.username) {
            return { success: false, message: '❌ Роль владельца менять нельзя' };
        }

        if (!ROLE_META[role] || role === 'owner') {
            return { success: false, message: '❌ Некорректная роль' };
        }

        userData.role = role;
        userData.avatar = this.getRoleMeta(role).avatar;
        userData.permissions = this.getDefaultPermissions(role);
        this.users[username] = this.normalizeStoredUser(userData);
        this.saveUsers();

        return { success: true, message: '✅ Роль обновлена', userData: this.users[username] };
    },
    
    // Удалить пользователя (для администратора)
    deleteUser: function(username) {
        if (!this.users[username]) {
            return { success: false, message: '❌ Пользователь не найден' };
        }

        if (username === BUILTIN_OWNER_ACCOUNT.username) {
            return { success: false, message: '❌ Встроенный аккаунт владельца удалять нельзя' };
        }
        
        delete this.users[username];
        if (this.teacherPasswords[username]) {
            delete this.teacherPasswords[username];
        }
        
        this.saveUsers();
        console.log(`✓ Пользователь удален: ${username}`);
        return { success: true, message: '✅ Пользователь удален' };
    },
    
    // Изменить пароль пользователя
    changePassword: async function(username, oldPassword, newPassword) {
        const userData = this.users[username];
        if (!userData) {
            return { success: false, message: '❌ Пользователь не найден' };
        }
        
        if (!await this.checkPassword(oldPassword, userData.password)) {
            return { success: false, message: '❌ Старый пароль неверный' };
        }
        
        if (!this.validatePassword(newPassword)) {
            return { success: false, message: '❌ Новый пароль должен быть минимум 8 символов и содержать буквы и цифры' };
        }
        
        userData.password = await this.hashPassword(newPassword);
        this.saveUsers();
        return { success: true, message: '✅ Пароль изменен' };
    },

    getStudentOverview: function() {
        return this.getAllStudents().map(student => {
            const progress = student.progress || {};
            const scores = Object.values(progress.scores || {});
            const averageScore = scores.length
                ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
                : 0;

            return {
                id: student.id,
                fullname: student.fullname,
                email: student.email,
                points: progress.points || 0,
                completedTopics: (progress.completedTopics || []).length,
                averageScore
            };
        }).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.averageScore - a.averageScore;
        });
    }
};

// ============================================
// Registration/Login Modal UI
// ============================================

function showRegistrationModal() {
    const modal = document.getElementById('profile-modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;
    
    let html = `
        <div class="registration-form auth-modal">
            <div class="auth-tabs">
                <button class="auth-tab active" onclick="switchAuthTab('login')">
                    🔐 Входе
                </button>
                <button class="auth-tab" onclick="switchAuthTab('register')"> 
                    ✍️ Регистрация
                </button>
            </div>
            
            <!-- Вкладка входа -->
            <div id="login-tab" class="auth-tab-content active">
                <h2>🔐 Вход в аккаунт</h2>
                
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="login-email" class="form-input" placeholder="example@mail.com">
                </div>
                
                <div class="form-group">
                    <label>Пароль:</label>
                    <input type="password" id="login-password" class="form-input" placeholder="Ваш пароль">
                </div>
                
                <button class="btn-primary" onclick="performLogin()" style="width: 100%; margin-top: 16px;">
                    🔓 Войти
                </button>
                
                <p style="text-align: center; font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 12px;">
                    Нет аккаунта? Переключитесь на вкладку "Регистрация"
                </p>
            </div>
            
            <!-- Вкладка регистрации -->
            <div id="register-tab" class="auth-tab-content">
                <h2>✍️ Создать новый аккаунт</h2>
                
                <div class="form-group">
                    <label>Полное имя:</label>
                    <input type="text" id="register-name" class="form-input" placeholder="Иван Иванов">
                </div>
                
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="register-email" class="form-input" placeholder="example@mail.com">
                </div>
                
                <div class="form-group">
                    <label>Пароль:</label>
                    <input type="password" id="register-password" class="form-input" placeholder="Минимум 8 символов (буквы + цифры)">
                </div>
                
                <div class="form-group">
                    <label>Подтверждение пароля:</label>
                    <input type="password" id="register-password-confirm" class="form-input" placeholder="Повторите пароль">
                </div>
                
                <div class="form-group">
                    <label>Роль:</label>
                    <select id="register-role" class="form-select">
                        <option value="student" selected>🎓 Студент (доступна самостоятельная регистрация)</option>
                        <option value="teacher" disabled>👨‍🏫 Преподаватель (обратитесь к администратору)</option>
                    </select>
                </div>
                
                <button class="btn-primary" onclick="performRegistration()" style="width: 100%; margin-top: 16px;">
                    ✅ Зарегистрироваться
                </button>
                
                <p style="text-align: center; font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 12px;">
                    👨‍🏫 Если вы преподаватель, обратитесь к администратору приложения для создания аккаунта.
                </p>
            </div>
    `;
    
    body.innerHTML = html;
    modal.style.display = 'block';
}

// Переключение вкладок авторизации
function switchAuthTab(tabName) {
    document.querySelectorAll('.auth-tab-content, .auth-form').forEach(tab => {
        tab.classList.remove('active');
        if (tab.classList.contains('auth-form')) {
            tab.style.display = '';
        }
    });

    document.querySelectorAll('.auth-tab, .auth-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const modalTab = document.getElementById(`${tabName}-tab`);
    if (modalTab) {
        modalTab.classList.add('active');
    }

    const screenForm = document.getElementById(`${tabName}-form`);
    if (screenForm) {
        screenForm.classList.add('active');
    }

    const screenBtn = document.querySelector(`.auth-tab-btn[data-tab="${tabName}"]`);
    if (screenBtn) {
        screenBtn.classList.add('active');
    }

    const modalButtons = document.querySelectorAll('.auth-tab');
    if (modalButtons.length >= 2) {
        modalButtons[tabName === 'login' ? 0 : 1].classList.add('active');
    }
}

// Выполнить логин
async function performLogin() {
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    
    if (!email || !password) {
        showTempMessage('❌ Заполните все поля');
        return;
    }
    
    const result = await authenticationModule.loginUser(email, password);
    
    // Если владелец должен настроить пароль
    if (result.success && result.needsSetup) {
        appData.user = typeof normalizeUserData === 'function' ? normalizeUserData(result.userData) : result.userData;
        if (typeof persistCurrentUserState === 'function') persistCurrentUserState();
        showOwnerSetupModal();
        return;
    }
    
    if (result.success) {
        // Сохранить пользователя в appData и localStorage
        appData.user = typeof normalizeUserData === 'function' ? normalizeUserData(result.userData) : result.userData;
        if (typeof persistCurrentUserState === 'function') {
            persistCurrentUserState();
        } else {
            localStorage.setItem('invictusUser', JSON.stringify(appData.user));
        }
        
        // Добавить баллы при входе
        if (typeof scoringModule !== 'undefined' && scoringModule.updateScoreDisplay) {
            scoringModule.updateScoreDisplay();
        }
        
        showTempMessage(result.message);
        profileManager.close();
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.style.display = 'none';
        navigationManager.goTo('home');
        
        // Обновить интерфейс профиля
        if (typeof settingsModule !== 'undefined') {
            settingsModule.renderSettings();
        }
    } else {
        showTempMessage(result.message);
    }
}

// Выполнить регистрацию
async function performRegistration() {
    const fullname = document.getElementById('register-name')?.value || document.getElementById('register-fullname')?.value;
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;
    const passwordConfirm = document.getElementById('register-password-confirm')?.value || document.getElementById('register-confirm')?.value;
    
    if (!fullname || !email || !password || !passwordConfirm) {
        showTempMessage('❌ Заполните все поля');
        return;
    }
    
    if (password !== passwordConfirm) {
        showTempMessage('❌ Пароли не совпадают');
        return;
    }
    
    const result = await authenticationModule.registerStudent(fullname, email, password);
    
    if (result.success) {
        // Автоматически логировать пользователя после регистрации
        appData.user = typeof normalizeUserData === 'function' ? normalizeUserData(result.userData) : result.userData;
        if (typeof persistCurrentUserState === 'function') {
            persistCurrentUserState();
        } else {
            localStorage.setItem('invictusUser', JSON.stringify(appData.user));
        }
        
        // Добавить баллы при входе
        if (typeof scoringModule !== 'undefined' && scoringModule.updateScoreDisplay) {
            scoringModule.updateScoreDisplay();
        }
        
        showTempMessage(result.message);
        profileManager.close();
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.style.display = 'none';
        navigationManager.goTo('home');
        
        // Обновить интерфейс профиля
        if (typeof settingsModule !== 'undefined') {
            settingsModule.renderSettings();
        }
    } else {
        showTempMessage(result.message);
    }
}

function showOwnerSetupModal() {
    const screen = document.getElementById('settings-content');
    if (screen) {
        screen.innerHTML = `
            <div class="preferences-container">
                <h2>⚙️ Настройка пароля владельца</h2>
                <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">
                    Это ваш первый вход. Пожалуйста, задайте пароль для аккаунта владельца.
                </p>
                <div class="preference-item">
                    <label for="setup-password">Новый пароль:</label>
                    <input type="password" id="setup-password" class="form-input" placeholder="Минимум 8 символов">
                </div>
                <div class="preference-item">
                    <label for="setup-confirm">Подтвердите пароль:</label>
                    <input type="password" id="setup-confirm" class="form-input" placeholder="Повторите пароль">
                </div>
                <button class="btn-primary" onclick="completeOwnerSetup()" style="margin-top: 15px;">
                    💾 Сохранить пароль
                </button>
            </div>
        `;
        navigationManager.goTo('settings');
    }
}

async function completeOwnerSetup() {
    const password = document.getElementById('setup-password')?.value;
    const confirm = document.getElementById('setup-confirm')?.value;
    
    if (!password || !confirm) {
        showTempMessage('❌ Заполните все поля');
        return;
    }
    if (password !== confirm) {
        showTempMessage('❌ Пароли не совпадают');
        return;
    }
    
    const result = await authenticationModule.setupOwnerPassword(password);
    showTempMessage(result.message);
    
    if (result.success) {
        if (typeof settingsModule !== 'undefined') settingsModule.renderSettings();
        if (typeof profileManager !== 'undefined') profileManager.close();
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.style.display = 'none';
        navigationManager.goTo('home');
    }
}

function performLogout() {
    if (typeof enterGuestMode === 'function') {
        enterGuestMode();
    }

    showTempMessage('✅ Вы вышли из профиля');
    if (typeof settingsModule !== 'undefined') {
        settingsModule.renderSettings();
    }
    navigationManager.goTo('home');
}

window.authModule = authenticationModule;
window.showAuthModal = showRegistrationModal;

