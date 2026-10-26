// ============================================
// 3D/2D Materials Module
// ============================================

const media3dModule = {
    models: {},      // {modelId: {name, type, format, url, ...}}
    modelIdCounter: 1,
    
    init: function(appData) {
        this.appData = appData;
        this.loadModels();
        console.log('✓ 3D/2D Materials Module Initialized');
    },
    
    // Загрузить модели из localStorage
    loadModels: function() {
        const saved = localStorage.getItem('app3DModels');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.models = data.models || {};
                this.modelIdCounter = data.modelIdCounter || 1;
            } catch (e) {
                console.error('Ошибка при загрузке 3D моделей:', e);
            }
        }
    },
    
    // Сохранить модели в localStorage
    saveModels: function() {
        localStorage.setItem('app3DModels', JSON.stringify({
            models: this.models,
            modelIdCounter: this.modelIdCounter
        }));
    },
    
    // Добавить новую 3D/2D модель
    addModel: function(name, description, type, format, url, subjectId = null, topicId = null) {
        if (!name || !url) {
            return { success: false, message: '❌ Заполните название и URL' };
        }
        
        const modelId = 'model_' + this.modelIdCounter++;
        
        this.models[modelId] = {
            id: modelId,
            name: name,
            description: description,
            type: type,  // '3d' или '2d'
            format: format,  // 'obj', 'glb', 'gltf', 'svg', 'png', 'jpg'
            url: url,
            subjectId: subjectId,
            topicId: topicId,
            createdAt: new Date().toISOString(),
            views: 0
        };
        
        this.saveModels();
        return { success: true, message: '✅ Модель добавлена', modelId: modelId };
    },
    
    // Удалить модель
    deleteModel: function(modelId) {
        if (!this.models[modelId]) {
            return { success: false, message: '❌ Модель не найдена' };
        }
        
        delete this.models[modelId];
        this.saveModels();
        return { success: true, message: '✅ Модель удалена' };
    },
    
    // Получить модель по ID
    getModel: function(modelId) {
        return this.models[modelId] || null;
    },
    
    // Получить модели по предмету
    getModelsBySubject: function(subjectId) {
        return Object.keys(this.models)
            .filter(modelId => String(this.models[modelId].subjectId) === String(subjectId))
            .map(modelId => this.models[modelId]);
    },
    
    // Получить все 3D модели
    get3DModels: function() {
        return Object.keys(this.models)
            .filter(modelId => this.models[modelId].type === '3d')
            .map(modelId => this.models[modelId]);
    },
    
    // Получить все 2D изображения
    get2DModels: function() {
        return Object.keys(this.models)
            .filter(modelId => this.models[modelId].type === '2d')
            .map(modelId => this.models[modelId]);
    },
    
    // Увеличить счётчик просмотров
    incrementViews: function(modelId) {
        if (this.models[modelId]) {
            this.models[modelId].views++;
            this.saveModels();
        }
    }
};

// ============================================
// 3D/2D Materials UI
// ============================================

const media3dUI = {
    currentCategory: '3d',
    
    init: function() {
        console.log('✓ 3D/2D Materials UI Initialized');
    },
    
    show: function() {
        navigationManager.goTo('media3d');
    },
    
    render: function() {
        const screen = document.getElementById('media3d-screen');
        if (!screen) return;
        
        let html = `
            <div class="media3d-header">
                <h1>🎨 3D/2D Материалы</h1>
                <p>Изучение анатомии и медицинских концепций с 3D/2D визуализацией</p>
            </div>
            
            <div class="media3d-tabs">
                <button class="media3d-tab active" onclick="media3dUI.switchTab('3d')">
                    🎮 3D Модели
                </button>
                <button class="media3d-tab" onclick="media3dUI.switchTab('2d')">
                    🖼️ 2D Материалы
                </button>
            </div>
            
            <div class="media3d-content">
                <div id="media3d-grid" class="media3d-grid">
                    ${this.renderModels()}
                </div>
            </div>
        `;
        
        screen.innerHTML = html;
    },
    
    switchTab: function(tab) {
        this.currentCategory = tab;
        
        // Обновить активную кнопку
        document.querySelectorAll('.media3d-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Обновить контент
        const grid = document.getElementById('media3d-grid');
        if (grid) {
            grid.innerHTML = this.renderModels();
        }
    },
    
    renderModels: function() {
        const models = this.currentCategory === '3d' 
            ? media3dModule.get3DModels() 
            : media3dModule.get2DModels();
        
        if (models.length === 0) {
            return `
                <div class="media3d-empty">
                    <div class="empty-icon">${this.currentCategory === '3d' ? '🎮' : '🖼️'}</div>
                    <p>Нет ${this.currentCategory === '3d' ? '3D моделей' : '2D материалов'}</p>
                </div>
            `;
        }
        
        let html = '';
        models.forEach(model => {
            const icon = model.type === '3d' ? '🎮' : '🖼️';
            const formatBadge = model.format.toUpperCase();
            
            html += `
                <div class="media3d-card" data-model-id="${Safe.esc(model.id)}" onclick="media3dUI.openModel(this.dataset.modelId)">
                    <div class="media3d-preview">
                        ${this.renderPreview(model)}
                    </div>
                    <div class="media3d-info">
                        <h3>${this.escapeHtml(model.name)}</h3>
                        <p class="media3d-desc">${this.escapeHtml(model.description || 'Нет описания')}</p>
                        <div class="media3d-meta">
                            <span class="badge badge-format">${formatBadge}</span>
                            <span class="badge badge-views">👁️ ${model.views}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return html;
    },
    
    renderPreview: function(model) {
        if (model.type === '3d') {
            // Для 3D: показать плейсхолдер с иконкой формата
            const formatIcon = {
                'obj': '📦',
                'glb': '📦',
                'gltf': '📦'
            }[model.format] || '🎮';
            
            return `<div class="media3d-placeholder">${formatIcon} ${model.format.toUpperCase()}</div>`;
        } else {
            // Для 2D: показать изображение
            if (model.format === 'svg') {
                return `<object data="${Safe.url(model.url)}" type="image/svg+xml"></object>`;
            } else {
                return `<img src="${Safe.url(model.url)}" alt="${this.escapeHtml(model.name)}">`;
            }
        }
    },
    
    openModel: function(modelId) {
        const model = media3dModule.getModel(modelId);
        if (!model) return;
        
        media3dModule.incrementViews(modelId);
        
        const modal = document.getElementById('profile-modal');
        const body = document.getElementById('modal-body');
        if (!modal || !body) return;
        
        let viewerHtml = '';
        
        if (model.type === '3d') {
            // Для 3D используем Three.js (должен быть подключен)
            viewerHtml = `
                <div class="media3d-viewer-3d">
                    <div id="threejs-container" style="width: 100%; height: 400px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                        <p style="padding: 20px; text-align: center; color: rgba(255,255,255,0.6);">
                            📦 Модель: <strong>${this.escapeHtml(model.format.toUpperCase())}</strong><br>
                            <small>Для просмотра требуется Three.js библиотека</small>
                        </p>
                    </div>
                </div>
            `;
        } else {
            // Для 2D покажем изображение
            if (model.format === 'svg') {
                viewerHtml = `
                    <div class="media3d-viewer-2d">
                        <object data="${Safe.url(model.url)}" type="image/svg+xml" style="width: 100%; height: 400px; border-radius: 8px;"></object>
                    </div>
                `;
            } else {
                viewerHtml = `
                    <div class="media3d-viewer-2d">
                        <img src="${Safe.url(model.url)}" alt="${this.escapeHtml(model.name)}" style="width: 100%; max-height: 500px; border-radius: 8px; object-fit: contain;">
                    </div>
                `;
            }
        }
        
        const html = `
            <div class="media3d-modal">
                <h2>${this.escapeHtml(model.name)}</h2>
                <p class="media3d-desc">${this.escapeHtml(model.description || '')}</p>
                
                ${viewerHtml}
                
                <div class="media3d-details">
                    <div class="detail-item">
                        <span class="detail-label">Тип:</span>
                        <span class="detail-value">${model.type === '3d' ? '🎮 3D Модель' : '🖼️ 2D Изображение'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Формат:</span>
                        <span class="detail-value">${model.format.toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Просмотров:</span>
                        <span class="detail-value">${model.views}</span>
                    </div>
                </div>
                
                <button class="btn-ghost" onclick="profileManager.close()" style="width: 100%; margin-top: 16px;">Закрыть</button>
            </div>
        `;
        
        body.innerHTML = html;
        modal.style.display = 'block';
    },
    
    escapeHtml: function(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
};

