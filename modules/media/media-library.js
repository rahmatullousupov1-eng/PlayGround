// ============================================
// Media Library Module - File Upload System
// ============================================

const mediaLibrary = {
    files: {},        // {fileId: {name, type, url, size, uploadedAt, ...}}
    fileIdCounter: 1,
    maxFileSize: 50 * 1024 * 1024,  // 50MB
    
    init: function() {
        this.loadMedia();
        console.log('✓ Media Library Initialized');
    },
    
    // Загрузить медиа из localStorage
    loadMedia: function() {
        const saved = localStorage.getItem('appMediaLibrary');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.files = data.files || {};
                this.fileIdCounter = data.fileIdCounter || 1;
            } catch (e) {
                console.error('Ошибка при загрузке медиа-библиотеки:', e);
            }
        }
    },
    
    // Сохранить медиа в localStorage
    saveMedia: function() {
        localStorage.setItem('appMediaLibrary', JSON.stringify({
            files: this.files,
            fileIdCounter: this.fileIdCounter
        }));
    },
    
    // Загрузить файл (обработка File input)
    uploadFile: function(file, callback) {
        // Проверка размера
        if (file.size > this.maxFileSize) {
            callback({ success: false, message: `❌ Файл слишком большой. Максимум: ${this.maxFileSize / 1024 / 1024}MB` });
            return;
        }
        
        // Проверка типа файла
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedTypes.includes(file.type)) {
            callback({ success: false, message: '❌ Недопустимый тип файла. Разрешены: JPG, PNG, GIF, MP4, WebM, OGG' });
            return;
        }
        
        // Конвертировать в Data URL (для localStorage)
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileId = 'file_' + this.fileIdCounter++;
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');
            
            this.files[fileId] = {
                id: fileId,
                name: file.name,
                type: file.type,
                size: file.size,
                url: event.target.result,  // Data URL
                uploadedAt: new Date().toISOString(),
                isVideo: isVideo,
                isImage: isImage,
                category: isVideo ? 'video' : 'image'
            };
            
            this.saveMedia();
            callback({ 
                success: true, 
                message: '✅ Файл загружен успешно',
                fileId: fileId,
                file: this.files[fileId]
            });
        };
        
        reader.onerror = () => {
            callback({ success: false, message: '❌ Ошибка при чтении файла' });
        };
        
        reader.readAsDataURL(file);
    },
    
    // Получить все файлы
    getAllFiles: function() {
        return Object.keys(this.files).map(fileId => this.files[fileId]);
    },
    
    // Получить только видео
    getVideos: function() {
        return this.getAllFiles().filter(f => f.isVideo);
    },
    
    // Получить только изображения
    getImages: function() {
        return this.getAllFiles().filter(f => f.isImage);
    },
    
    // Получить файл по ID
    getFile: function(fileId) {
        return this.files[fileId] || null;
    },
    
    // Удалить файл
    deleteFile: function(fileId) {
        if (!this.files[fileId]) {
            return { success: false, message: '❌ Файл не найден' };
        }
        
        delete this.files[fileId];
        this.saveMedia();
        return { success: true, message: '✅ Файл удалён' };
    },
    
    // Получить размер файла в читаемом формате
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    // Рендер медиа в теме
    renderMediaInTopic: function(mediaIds = []) {
        if (!mediaIds || mediaIds.length === 0) return '';
        
        let html = '<div class="topic-media-section">';
        
        mediaIds.forEach(fileId => {
            const file = this.getFile(fileId);
            if (!file) return;
            
            if (file.isVideo) {
                html += `
                    <div class="media-item video-item">
                        <video controls style="max-width: 100%; max-height: 300px; border-radius: 8px;">
                            <source src="${Safe.url(file.url)}" type="${Safe.esc(file.type)}">
                            Ваш браузер не поддерживает видео
                        </video>
                        <p class="media-title">${this.escapeHtml(file.name)}</p>
                    </div>
                `;
            } else if (file.isImage) {
                html += `
                    <div class="media-item image-item">
                        <img src="${Safe.url(file.url)}" alt="${this.escapeHtml(file.name)}" 
                             style="max-width: 100%; max-height: 300px; border-radius: 8px; object-fit: cover;">
                        <p class="media-title">${this.escapeHtml(file.name)}</p>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    },
    
    // Безопасное экранирование HTML
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

// ============================================
// Media Library UI - File Manager
// ============================================

const mediaLibraryUI = {
    selectedFiles: [],  // Массив выбранных файлов для добавления в тему
    
    // Показать модал выбора файлов для темы
    showFilePicker: function(onSelect) {
        this.onSelectCallback = onSelect;
        
        const modal = document.getElementById('profile-modal');
        const body = document.getElementById('modal-body');
        if (!modal || !body) return;
        
        let html = `
            <div class="media-picker-modal">
                <h2>📁 Выбрать медиа для темы</h2>
                
                <div class="media-tabs">
                    <button class="media-tab active" onclick="mediaLibraryUI.switchMediaTab('library')">
                        📚 Библиотека
                    </button>
                    <button class="media-tab" onclick="mediaLibraryUI.switchMediaTab('upload')">
                        📤 Загрузить файл
                    </button>
                </div>
                
                <!-- Вкладка библиотеки -->
                <div id="media-library-tab" class="media-tab-content active">
                    <h3>Имеющиеся файлы</h3>
                    <div id="media-library-grid" class="media-library-grid">
                        ${this.renderLibraryGrid()}
                    </div>
                </div>
                
                <!-- Вкладка загрузки -->
                <div id="media-upload-tab" class="media-tab-content">
                    <h3>Загрузить новый файл</h3>
                    <div class="file-upload-zone" ondrop="mediaLibraryUI.handleDrop(event)" 
                         ondragover="event.preventDefault()" ondragleave="event.target.style.borderColor=''">
                        <input type="file" id="media-file-input" accept="image/*,video/*" 
                               onchange="mediaLibraryUI.handleFileSelect(event)">
                        <div class="upload-prompt">
                            <p>Перетащите файл или нажмите для выбора</p>
                            <p style="font-size: 0.85rem; color: rgba(255,255,255,0.5);">
                                Макс: 50MB | Форматы: JPG, PNG, GIF, MP4, WebM
                            </p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 16px; display: flex; gap: 10px;">
                    <button class="btn-primary" onclick="mediaLibraryUI.confirmSelection()" 
                            style="flex: 1;">✅ Выбрать (${this.selectedFiles.length})</button>
                    <button class="btn-ghost" onclick="profileManager.close()">❌ Отмена</button>
                </div>
            </div>
        `;
        
        body.innerHTML = html;
        modal.style.display = 'block';
    },
    
    // Рендер сетки библиотеки
    renderLibraryGrid: function() {
        const files = mediaLibrary.getAllFiles();
        
        if (files.length === 0) {
            return '<p style="color: rgba(255,255,255,0.6);">📭 Библиотека пуста</p>';
        }
        
        let html = '';
        files.forEach(file => {
            const isSelected = this.selectedFiles.includes(file.id);
            const icon = file.isVideo ? '🎬' : '🖼️';
            
            html += `
                <div class="media-item-card ${isSelected ? 'selected' : ''}" 
                     data-file-id="${Safe.esc(file.id)}" onclick="mediaLibraryUI.toggleFile(this.dataset.fileId)">
                    <div class="media-preview">
                        ${file.isVideo ? 
                            `<video src="${Safe.url(file.url)}" style="max-width: 100%; max-height: 100%;"></video>` :
                            `<img src="${Safe.url(file.url)}" alt="${Safe.esc(file.name)}" style="max-width: 100%; max-height: 100%; object-fit: cover;">`
                        }
                    </div>
                    <div class="media-card-info">
                        <p class="media-name" title="${Safe.esc(file.name)}">${icon} ${Safe.esc(file.name.substring(0, 20))}</p>
                        <p class="media-size">${mediaLibrary.formatFileSize(file.size)}</p>
                        ${isSelected ? '<span class="media-selected">✓</span>' : ''}
                    </div>
                </div>
            `;
        });
        
        return html;
    },
    
    // Переключение вкладок медиа
    switchMediaTab: function(tabName) {
        document.querySelectorAll('.media-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.media-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const tabElement = document.getElementById('media-' + tabName + '-tab');
        if (tabElement) {
            tabElement.classList.add('active');
        }
        
        if (event && event.target) {
            event.target.classList.add('active');
        }
    },
    
    // Переключить выбор файла
    toggleFile: function(fileId) {
        const index = this.selectedFiles.indexOf(fileId);
        if (index > -1) {
            this.selectedFiles.splice(index, 1);
        } else {
            this.selectedFiles.push(fileId);
        }
        
        const grid = document.getElementById('media-library-grid');
        if (grid) {
            grid.innerHTML = this.renderLibraryGrid();
        }
    },
    
    // Обработка выбора файла
    handleFileSelect: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        mediaLibrary.uploadFile(file, (result) => {
            if (result.success) {
                this.selectedFiles.push(result.fileId);
                this.switchMediaTab('library');
                
                const grid = document.getElementById('media-library-grid');
                if (grid) {
                    grid.innerHTML = this.renderLibraryGrid();
                }
                
                showTempMessage(result.message);
                document.getElementById('media-file-input').value = '';
            } else {
                showTempMessage(result.message);
            }
        });
    },
    
    // Обработка drag & drop
    handleDrop: function(event) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            mediaLibrary.uploadFile(file, (result) => {
                if (result.success) {
                    this.selectedFiles.push(result.fileId);
                    this.switchMediaTab('library');
                    
                    const grid = document.getElementById('media-library-grid');
                    if (grid) {
                        grid.innerHTML = this.renderLibraryGrid();
                    }
                    
                    showTempMessage(result.message);
                } else {
                    showTempMessage(result.message);
                }
            });
        }
    },
    
    // Подтвердить выбор
    confirmSelection: function() {
        if (this.selectedFiles.length === 0) {
            showTempMessage('❌ Выберите хотя бы один файл');
            return;
        }
        
        if (this.onSelectCallback) {
            this.onSelectCallback(this.selectedFiles);
        }
        
        this.selectedFiles = [];
        profileManager.close();
    }
};

