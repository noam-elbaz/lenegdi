class AudioClassesApp {
    constructor() {
        this.classes = [];
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.currentAudio = null;
        this.currentUser = null;
        
        this.initializeElements();
        this.bindEvents();
        this.checkAuthState();
        this.loadClasses();
    }

    initializeElements() {
        // Modal elements
        this.adminModal = document.getElementById('adminModal');
        this.loginModal = document.getElementById('loginModal');
        this.adminBtn = document.getElementById('adminBtn');
        this.closeModal = document.querySelector('.close');
        this.closeLogin = document.querySelector('.close-login');
        this.uploadForm = document.getElementById('uploadForm');
        this.loginForm = document.getElementById('loginForm');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        // Search and filter elements
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.tagFilters = document.getElementById('tagFilters');
        this.clearFilters = document.getElementById('clearFilters');
        this.classesGrid = document.getElementById('classesGrid');
        
        // Audio player elements
        this.audioPlayer = document.getElementById('audioPlayer');
        this.audioElement = document.getElementById('audioElement');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentTitle = document.getElementById('currentTitle');
        this.currentDescription = document.getElementById('currentDescription');
        this.progressSlider = document.getElementById('progressSlider');
        this.progressBar = document.getElementById('progressBar');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.muteBtn = document.getElementById('muteBtn');
        this.closePlayer = document.getElementById('closePlayer');
        
        // Admin elements
        this.adminClassesList = document.getElementById('adminClassesList');
    }

    bindEvents() {
        // Modal events
        this.adminBtn.addEventListener('click', () => this.handleAdminButtonClick());
        this.closeModal.addEventListener('click', () => this.closeAdminModal());
        this.closeLogin.addEventListener('click', () => this.closeLoginModal());
        this.uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Search and filter events
        this.searchBtn.addEventListener('click', () => this.searchClasses());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchClasses();
        });
        this.clearFilters.addEventListener('click', () => this.clearAllFilters());
        
        // Audio player events
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.closePlayer.addEventListener('click', () => this.closeAudioPlayer());
        
        // Audio element events
        this.audioElement.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        this.audioElement.addEventListener('ended', () => this.nextTrack());
        
        // Progress slider events
        this.progressSlider.addEventListener('input', () => this.seek());
        
        // Volume controls
        this.volumeSlider.addEventListener('input', () => this.updateVolume());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.adminModal) {
                this.closeAdminModal();
            }
            if (e.target === this.loginModal) {
                this.closeLoginModal();
            }
        });
    }

    // Authentication Methods
    async checkAuthState() {
        try {
            this.currentUser = await getCurrentUser();
            if (this.currentUser) {
                this.updateUIForAuthenticatedUser(this.currentUser);
            } else {
                this.updateUIForAnonymousUser();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.updateUIForAnonymousUser();
        }
    }

    updateUIForAuthenticatedUser(user) {
        this.currentUser = user;
        this.adminBtn.textContent = 'Admin Panel';
        this.adminBtn.style.display = 'block';
    }

    updateUIForAnonymousUser() {
        this.currentUser = null;
        this.adminBtn.textContent = 'Login';
        this.adminBtn.style.display = 'block';
    }

    handleAdminButtonClick() {
        if (this.currentUser) {
            this.openAdminModal();
        } else {
            this.openLoginModal();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const { user } = await signInWithEmail(email, password);
            this.updateUIForAuthenticatedUser(user);
            this.closeLoginModal();
            this.openAdminModal();
            alert('Login successful!');
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleLogout() {
        try {
            await signOut();
            this.updateUIForAnonymousUser();
            this.closeAdminModal();
            alert('Logged out successfully!');
        } catch (error) {
            alert('Logout failed: ' + error.message);
        }
    }

    // Data Loading Methods
    async loadClasses() {
        try {
            this.classes = await getAudioClasses();
            this.renderClasses();
            this.renderTagFilters();
        } catch (error) {
            console.error('Failed to load classes:', error);
            this.classesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ccc; padding: 40px;">Failed to load classes. Please try again later.</div>';
        }
    }

    // Modal Methods
    openLoginModal() {
        this.loginModal.classList.add('show');
    }

    closeLoginModal() {
        this.loginModal.classList.remove('show');
        this.loginForm.reset();
    }

    openAdminModal() {
        this.adminModal.classList.add('show');
        this.renderAdminClasses();
    }

    closeAdminModal() {
        this.adminModal.classList.remove('show');
    }

    async handleUpload(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            alert('Please login first');
            return;
        }
        
        const fileInput = document.getElementById('audioFile');
        const titleInput = document.getElementById('classTitle');
        const descriptionInput = document.getElementById('classDescription');
        const tagsInput = document.getElementById('classTags');
        
        if (!fileInput.files[0]) {
            alert('Please select an audio file');
            return;
        }
        
        const file = fileInput.files[0];
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        // Show upload progress
        const submitBtn = this.uploadForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;
        
        try {
            // Upload file to Supabase Storage
            const uploadResult = await uploadAudioFile(file, this.currentUser.id);
            
            // Get audio duration
            const duration = await this.getAudioDuration(file);
            
            // Create database record
            const classData = {
                title,
                description,
                tags,
                audio_file_path: uploadResult.path,
                audio_file_url: uploadResult.publicUrl,
                duration: Math.round(duration),
                file_size: file.size,
                mime_type: file.type,
                created_by: this.currentUser.id
            };
            
            const newClass = await createAudioClass(classData);
            
            // Refresh the classes list
            await this.loadClasses();
            this.renderAdminClasses();
            
            // Reset form
            this.uploadForm.reset();
            
            alert('Class uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async getAudioDuration(file) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.addEventListener('loadedmetadata', () => {
                resolve(audio.duration);
            });
            audio.addEventListener('error', () => {
                resolve(0); // Default to 0 if can't determine duration
            });
            audio.src = URL.createObjectURL(file);
        });
    }

    // Rendering Methods
    renderClasses(filteredClasses = null) {
        const classesToRender = filteredClasses || this.classes;
        
        if (classesToRender.length === 0) {
            this.classesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #ccc; padding: 40px;">No classes found</div>';
            return;
        }
        
        this.classesGrid.innerHTML = classesToRender.map(cls => `
            <div class="class-card" data-id="${cls.id}">
                <h3>${cls.title}</h3>
                <p>${cls.description || 'No description available'}</p>
                <div class="class-tags">
                    ${cls.tags.map(tag => `<span class="class-tag">${tag}</span>`).join('')}
                </div>
                <button class="play-btn" onclick="app.playClass('${cls.id}')">▶ Play</button>
            </div>
        `).join('');
    }

    renderTagFilters() {
        const allTags = [...new Set(this.classes.flatMap(cls => cls.tags || []))];
        
        this.tagFilters.innerHTML = allTags.map(tag => `
            <button class="tag-filter" data-tag="${tag}">${tag}</button>
        `).join('');
        
        // Bind tag filter events
        this.tagFilters.querySelectorAll('.tag-filter').forEach(btn => {
            btn.addEventListener('click', () => this.toggleTagFilter(btn));
        });
    }

    async renderAdminClasses() {
        if (!this.currentUser) return;
        
        // Filter classes created by current user
        const userClasses = this.classes.filter(cls => cls.created_by === this.currentUser.id);
        
        if (userClasses.length === 0) {
            this.adminClassesList.innerHTML = '<p style="color: #ccc;">No classes uploaded yet</p>';
            return;
        }
        
        this.adminClassesList.innerHTML = userClasses.map(cls => `
            <div class="admin-class-item">
                <div class="admin-class-info">
                    <h4>${cls.title}</h4>
                    <p>${cls.description || 'No description'}</p>
                    <p><strong>Tags:</strong> ${cls.tags ? cls.tags.join(', ') : 'None'}</p>
                    <p><strong>Duration:</strong> ${this.formatTime(cls.duration || 0)}</p>
                </div>
                <button class="delete-btn" onclick="app.deleteClass('${cls.id}')">Delete</button>
            </div>
        `).join('');
    }

    // Search and Filter Methods
    searchClasses() {
        const query = this.searchInput.value.toLowerCase().trim();
        const activeTags = Array.from(this.tagFilters.querySelectorAll('.tag-filter.active'))
            .map(btn => btn.dataset.tag);
        
        let filtered = this.classes;
        
        if (query) {
            filtered = filtered.filter(cls => 
                cls.title.toLowerCase().includes(query) ||
                (cls.description && cls.description.toLowerCase().includes(query)) ||
                (cls.tags && cls.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }
        
        if (activeTags.length > 0) {
            filtered = filtered.filter(cls => 
                cls.tags && activeTags.some(tag => cls.tags.includes(tag))
            );
        }
        
        this.renderClasses(filtered);
    }

    toggleTagFilter(btn) {
        btn.classList.toggle('active');
        this.searchClasses();
    }

    clearAllFilters() {
        this.searchInput.value = '';
        this.tagFilters.querySelectorAll('.tag-filter.active').forEach(btn => {
            btn.classList.remove('active');
        });
        this.renderClasses();
    }

    // Audio Player Methods
    playClass(classId) {
        const cls = this.classes.find(c => c.id === classId);
        if (!cls) return;
        
        this.currentPlaylist = this.classes;
        this.currentTrackIndex = this.classes.findIndex(c => c.id === classId);
        this.loadTrack(cls);
        this.showAudioPlayer();
        this.play();
    }

    loadTrack(cls) {
        this.currentAudio = cls;
        this.audioElement.src = cls.audio_file_url;
        this.currentTitle.textContent = cls.title;
        this.currentDescription.textContent = cls.description || '';
        this.audioElement.load();
    }

    showAudioPlayer() {
        this.audioPlayer.classList.remove('hidden');
    }

    closeAudioPlayer() {
        this.audioPlayer.classList.add('hidden');
        this.pause();
        this.audioElement.src = '';
        this.currentAudio = null;
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audioElement.play();
        this.isPlaying = true;
        this.playPauseBtn.textContent = '⏸';
    }

    pause() {
        this.audioElement.pause();
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶';
    }

    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            this.loadTrack(this.currentPlaylist[this.currentTrackIndex]);
            if (this.isPlaying) this.play();
        }
    }

    nextTrack() {
        if (this.currentTrackIndex < this.currentPlaylist.length - 1) {
            this.currentTrackIndex++;
            this.loadTrack(this.currentPlaylist[this.currentTrackIndex]);
            if (this.isPlaying) this.play();
        } else {
            // End of playlist
            this.pause();
        }
    }

    seek() {
        const seekTime = (this.progressSlider.value / 100) * this.audioElement.duration;
        this.audioElement.currentTime = seekTime;
    }

    updateProgress() {
        if (this.audioElement.duration) {
            const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            this.progressBar.style.width = progress + '%';
            this.progressSlider.value = progress;
            
            this.currentTime.textContent = this.formatTime(this.audioElement.currentTime);
        }
    }

    updateDuration() {
        this.duration.textContent = this.formatTime(this.audioElement.duration);
    }

    updateVolume() {
        this.audioElement.volume = this.volumeSlider.value / 100;
        this.muteBtn.textContent = this.audioElement.volume === 0 ? '🔇' : '🔊';
    }

    toggleMute() {
        if (this.audioElement.volume === 0) {
            this.audioElement.volume = this.volumeSlider.value / 100;
            this.muteBtn.textContent = '🔊';
        } else {
            this.audioElement.volume = 0;
            this.muteBtn.textContent = '🔇';
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Class Management Methods
    async deleteClass(classId) {
        if (!confirm('Are you sure you want to delete this class?')) return;
        
        try {
            const cls = this.classes.find(c => c.id === classId);
            if (cls && cls.audio_file_path) {
                // Delete file from storage
                await deleteAudioFile(cls.audio_file_path);
            }
            
            // Delete from database
            await deleteAudioClass(classId);
            
            // Refresh the classes list
            await this.loadClasses();
            this.renderAdminClasses();
            
            // If currently playing this class, stop playback
            if (this.currentAudio && this.currentAudio.id === classId) {
                this.closeAudioPlayer();
            }
            
            alert('Class deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Delete failed: ' + error.message);
        }
    }
}

// Initialize the application
const app = new AudioClassesApp();