// ============================================
// Videos Module
// ============================================

const videosModule = {
    isActive: false,
    
    init: function(appData) {
        this.appData = appData;
        this.loadVideos();
        console.log('✓ Videos Module Initialized');
    },
    
    loadVideos: function() {
        // Load videos from localStorage or use defaults
        const saved = localStorage.getItem('appVideos');
        if (saved) {
            try {
                this.videos = JSON.parse(saved);
                return;
            } catch (e) {
                console.warn('Failed to load videos:', e);
            }
        }
        
        // Default empty videos array
        this.videos = [];
    },
    
    addVideo: function(video) {
        if (!video.title || !video.url) return false;
        
        this.videos.push({
            id: Date.now(),
            title: video.title,
            url: video.url,
            description: video.description || '',
            subject: video.subject || null,
            topic: video.topic || null,
            createdAt: new Date().toISOString()
        });
        
        this.saveVideos();
        return true;
    },
    
    deleteVideo: function(videoId) {
        this.videos = this.videos.filter(v => v.id !== videoId);
        this.saveVideos();
    },
    
    getVideos: function(subjectId = null) {
        if (subjectId) {
            return this.videos.filter(v => String(v.subject) === String(subjectId));
        }
        return this.videos;
    },
    
    displayVideos: function(container, subjectId = null) {
        const videos = this.getVideos(subjectId);
        
        if (videos.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">📹 Видео не найдены</p>';
            return;
        }
        
        let html = '<div class="videos-grid">';
        videos.forEach(video => {
            const embedUrl = Safe.youtubeEmbed(video.url);
            const isYouTube = Boolean(embedUrl);
            const videoSrc = Safe.url(video.url);
            
            html += `
                <div class="video-item">
                    <div class="video-preview">
                        ${isYouTube ? 
                            `<iframe width="100%" height="180" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>` :
                            `<video width="100%" height="180" controls>
                                <source src="${videoSrc}">
                                Your browser does not support video playback.
                            </video>`
                        }
                    </div>
                    <div class="video-info">
                        <h4>${Safe.esc(video.title)}</h4>
                        <p>${Safe.esc(video.description)}</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    },
    
    saveVideos: function() {
        localStorage.setItem('appVideos', JSON.stringify(this.videos));
    },
    
    show: function() {
        const screen = document.getElementById('videos-screen');
        if (screen) {
            screen.style.display = 'block';
            this.renderVideos();
        }
    },
    
    renderVideos: function() {
        const container = document.getElementById('videos-container');
        if (!container) return;
        
        let html = `
            <div class="videos-header">
                <h2>📹 Видео материалы</h2>
                <p>Все загруженные видеоуроки и материалы</p>
            </div>
        `;
        
        const allVideos = this.getVideos();
        if (allVideos.length === 0) {
            html += '<p style="text-align: center; padding: 2rem;">Видео материалы отсутствуют</p>';
        } else {
            html += '<div class="videos-grid">';
            allVideos.forEach(video => {
                const embedUrl = Safe.youtubeEmbed(video.url);
                const isYouTube = Boolean(embedUrl);
                const videoSrc = Safe.url(video.url);
                
                html += `
                    <div class="video-card">
                        <div class="video-player">
                            ${isYouTube ? 
                                `<iframe width="100%" height="200" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>` :
                                `<video width="100%" height="200" controls style="background: #000;">
                                    <source src="${videoSrc}">
                                    Your browser does not support video playback.
                                </video>`
                            }
                        </div>
                        <div class="video-details">
                            <h3>${Safe.esc(video.title)}</h3>
                            <p>${Safe.esc(video.description)}</p>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
    },
    
    hide: function() {
        const screen = document.getElementById('videos-screen');
        if (screen) {
            screen.style.display = 'none';
        }
    }
};
