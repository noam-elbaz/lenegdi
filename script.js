// Simple Client-Side Router
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = '/';
        
        // Listen for browser navigation
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname + window.location.search);
        });
        
        // Handle initial load
        this.handleRoute(window.location.pathname + window.location.search);
    }
    
    addRoute(path, handler) {
        this.routes[path] = handler;
    }
    
    navigate(path) {
        if (path !== this.currentRoute) {
            history.pushState({}, '', path);
            this.handleRoute(path);
        }
    }
    
    handleRoute(path) {
        this.currentRoute = path;
        
        // Parse path and query params
        const [pathname, search] = path.split('?');
        const params = new URLSearchParams(search || '');
        
        // Find matching route
        let matchedRoute = null;
        let routeParams = {};
        
        // Check exact matches first
        if (this.routes[pathname]) {
            matchedRoute = this.routes[pathname];
        } else {
            // Check for parameterized routes
            for (const route in this.routes) {
                if (route.includes(':')) {
                    const routeParts = route.split('/');
                    const pathParts = pathname.split('/');
                    
                    if (routeParts.length === pathParts.length) {
                        let isMatch = true;
                        const params = {};
                        
                        for (let i = 0; i < routeParts.length; i++) {
                            if (routeParts[i].startsWith(':')) {
                                params[routeParts[i].slice(1)] = pathParts[i];
                            } else if (routeParts[i] !== pathParts[i]) {
                                isMatch = false;
                                break;
                            }
                        }
                        
                        if (isMatch) {
                            matchedRoute = this.routes[route];
                            routeParams = params;
                            break;
                        }
                    }
                }
            }
        }
        
        // Default to home route if no match
        if (!matchedRoute && this.routes['/']) {
            matchedRoute = this.routes['/'];
        }
        
        // Execute route handler
        if (matchedRoute) {
            matchedRoute({ 
                path: pathname, 
                params: routeParams, 
                query: Object.fromEntries(params) 
            });
        }
    }
}

class AudioClassesApp {
    constructor() {
        this.classes = [];
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.currentAudio = null;
        this.currentUser = null;
        this.currentAdminTab = 'upload';
        this.adminClasses = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedClasses = new Set();
        
        this.initializeElements();
        this.initializeRouter();
        this.bindEvents();
        this.checkAuthState();
        this.loadClasses();
    }

    initializeRouter() {
        this.router = new Router();
        
        // Define routes
        this.router.addRoute('/', (route) => {
            this.handleHomeRoute(route);
        });
        
        this.router.addRoute('/admin', (route) => {
            this.handleAdminRoute(route);
        });
    }
    
    handleHomeRoute(route) {
        // Close admin panel if open
        this.closeAdminModal();
        
        // Update any UI state for home
        this.updateUIForRoute('home');
    }
    
    handleAdminRoute(route) {
        // Check if user is authenticated
        if (!this.currentUser) {
            this.openLoginModal();
            return;
        }
        
        // Default to upload tab, or use query parameter
        const tab = route.query.tab || 'upload';
        this.openAdminModal();
        this.switchTab(tab);
        this.updateUIForRoute('admin', tab);
    }
    
    updateUIForRoute(section, subsection = null) {
        // Update any visual indicators or state based on current route
        // This can be used to highlight navigation items, etc.
        console.log(`Current route: ${section}${subsection ? '/' + subsection : ''}`);
    }
    
    // Navigation helper methods
    navigateHome() {
        this.router.navigate('/');
    }
    
    navigateToAdmin(tab = 'upload') {
        if (this.currentUser) {
            const url = tab === 'upload' ? '/admin' : `/admin?tab=${tab}`;
            this.router.navigate(url);
        } else {
            this.openLoginModal();
        }
    }

    // Custom Dialog System
    showDialog(options) {
        return new Promise((resolve) => {
            const {
                title = '',
                message = '',
                type = 'info', // 'success', 'error', 'warning', 'info'
                buttons = [{ text: 'OK', type: 'primary' }],
                showCancel = false
            } = options;

            const dialog = document.getElementById('customDialog');
            const dialogTitle = document.getElementById('dialogTitle');
            const dialogMessage = document.getElementById('dialogMessage');
            const dialogIcon = document.getElementById('dialogIcon');
            const dialogIconContainer = dialogIcon.parentElement;
            const dialogActions = document.getElementById('dialogActions');

            // Set title and message
            dialogTitle.textContent = title;
            dialogMessage.textContent = message;

            // Set icon and styling based on type
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            dialogIcon.textContent = icons[type] || icons.info;
            
            // Reset icon container classes
            dialogIconContainer.className = 'dialog-icon-container ' + type;
            dialogIcon.className = 'dialog-icon ' + type;

            // Clear existing buttons
            dialogActions.innerHTML = '';

            // Add buttons
            buttons.forEach((button, index) => {
                const btn = document.createElement('button');
                btn.className = `dialog-btn ${button.type || 'secondary'}`;
                btn.textContent = button.text;
                btn.addEventListener('click', () => {
                    this.hideDialog();
                    resolve(button.value !== undefined ? button.value : index);
                });
                dialogActions.appendChild(btn);
            });

            // Add cancel button if requested
            if (showCancel) {
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'dialog-btn secondary';
                cancelBtn.textContent = 'Cancel';
                cancelBtn.addEventListener('click', () => {
                    this.hideDialog();
                    resolve(false);
                });
                dialogActions.appendChild(cancelBtn);
            }

            // Show dialog with animation
            dialog.classList.remove('hidden');
            setTimeout(() => {
                dialog.classList.add('show');
            }, 10);

            // Close on backdrop click
            const backdrop = dialog.querySelector('.dialog-backdrop');
            backdrop.addEventListener('click', () => {
                this.hideDialog();
                resolve(false);
            });
        });
    }

    hideDialog() {
        const dialog = document.getElementById('customDialog');
        dialog.classList.remove('show');
        setTimeout(() => {
            dialog.classList.add('hidden');
        }, 300);
    }

    // Custom Alert (replaces native alert)
    customAlert(message, title = 'Notice') {
        return this.showDialog({
            title,
            message,
            type: 'info',
            buttons: [{ text: 'OK', type: 'primary' }]
        });
    }

    // Custom Success Alert
    customSuccess(message, title = 'Success') {
        return this.showDialog({
            title,
            message,
            type: 'success',
            buttons: [{ text: 'OK', type: 'success' }]
        });
    }

    // Custom Error Alert
    customError(message, title = 'Error') {
        return this.showDialog({
            title,
            message,
            type: 'error',
            buttons: [{ text: 'OK', type: 'danger' }]
        });
    }

    // Custom Confirm (replaces native confirm)
    customConfirm(message, title = 'Confirm') {
        return this.showDialog({
            title,
            message,
            type: 'warning',
            buttons: [
                { text: 'Cancel', type: 'secondary', value: false },
                { text: 'Confirm', type: 'danger', value: true }
            ]
        });
    }

    initializeElements() {
        // Modal elements
        this.adminModal = document.getElementById('adminModal');
        this.loginModal = document.getElementById('loginModal');
        this.editModal = document.getElementById('editModal');
        this.adminBtn = document.getElementById('adminBtn');
        this.closeModal = document.querySelector('.admin-close');
        this.closeLogin = document.querySelector('.close-login');
        this.uploadForm = document.getElementById('uploadForm');
        this.loginForm = document.getElementById('loginForm');
        this.editForm = document.getElementById('editForm');
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
        
        // Admin tab elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Upload elements
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.audioFileInput = document.getElementById('audioFile');
        this.filePreview = document.getElementById('filePreview');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.removeFileBtn = document.getElementById('removeFile');
        this.resetFormBtn = document.getElementById('resetForm');
        this.classTagsInput = document.getElementById('classTags');
        this.tagsPreview = document.getElementById('tagsPreview');
        
        // Manage elements
        this.classesTable = document.getElementById('classesTable');
        this.classesTableBody = document.getElementById('classesTableBody');
        this.adminSearch = document.getElementById('adminSearch');
        this.adminFilter = document.getElementById('adminFilter');
        this.selectAllCheckbox = document.getElementById('selectAllCheckbox');
        this.selectAllBtn = document.getElementById('selectAll');
        this.deleteSelectedBtn = document.getElementById('deleteSelected');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.pageInfo = document.getElementById('pageInfo');
        
        // Analytics elements
        this.totalClassesEl = document.getElementById('totalClasses');
        this.totalDurationEl = document.getElementById('totalDuration');
        this.totalSizeEl = document.getElementById('totalSize');
        this.avgDurationEl = document.getElementById('avgDuration');
        this.categoryChart = document.getElementById('categoryChart');
        this.recentUploads = document.getElementById('recentUploads');
        
        // Edit modal elements
        this.closeEditModal = document.getElementById('closeEditModal');
        this.editClassId = document.getElementById('editClassId');
        this.editTitle = document.getElementById('editTitle');
        this.editDescription = document.getElementById('editDescription');
        this.editTags = document.getElementById('editTags');
        this.editTagsPreview = document.getElementById('editTagsPreview');
        this.cancelEdit = document.getElementById('cancelEdit');
        
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
        
        // Admin tab events
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Upload form events
        this.fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        this.audioFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.removeFileBtn.addEventListener('click', () => this.removeSelectedFile());
        this.resetFormBtn.addEventListener('click', () => this.resetUploadForm());
        this.classTagsInput.addEventListener('input', () => this.updateTagsPreview());
        this.classTagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTagFromInput();
            }
        });
        
        // Manage tab events
        this.adminSearch.addEventListener('input', () => this.filterAdminClasses());
        this.adminFilter.addEventListener('change', () => this.filterAdminClasses());
        this.selectAllCheckbox.addEventListener('change', () => this.toggleSelectAll());
        this.selectAllBtn.addEventListener('click', () => this.selectAllClasses());
        this.deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedClasses());
        this.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());
        
        // Edit modal events
        if (this.closeEditModal) {
            this.closeEditModal.addEventListener('click', () => this.closeEditModalHandler());
        }
        if (this.editForm) {
            this.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
        }
        if (this.cancelEdit) {
            this.cancelEdit.addEventListener('click', () => this.closeEditModalHandler());
        }
        if (this.editTags) {
            this.editTags.addEventListener('input', () => this.updateEditTagsPreview());
        }
        
        
        // Modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.adminModal) {
                this.closeAdminModal();
            }
            if (e.target === this.loginModal) {
                this.closeLoginModal();
            }
            if (e.target === this.editModal) {
                this.closeEditModal();
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
            this.router.navigate('/admin');
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
            this.customSuccess('Login successful!');
            // Navigate to admin after successful login
            this.router.navigate('/admin');
        } catch (error) {
            this.customError('Login failed: ' + error.message);
        }
    }

    async handleLogout() {
        try {
            await signOut();
            this.updateUIForAnonymousUser();
            this.closeAdminModal();
            this.customSuccess('Logged out successfully!');
            // Navigate back to home after logout
            this.router.navigate('/');
        } catch (error) {
            this.customError('Logout failed: ' + error.message);
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
        this.switchTab('upload');
        this.loadAdminData();
    }

    closeAdminModal() {
        this.adminModal.classList.remove('show');
        // Navigate back to home when closing admin panel
        if (window.location.pathname !== '/') {
            this.router.navigate('/');
        }
    }

    async handleUpload(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.customError('Please login first');
            return;
        }
        
        const fileInput = document.getElementById('audioFile');
        const titleInput = document.getElementById('classTitle');
        const descriptionInput = document.getElementById('classDescription');
        const tagsInput = document.getElementById('classTags');
        
        if (!fileInput.files[0]) {
            this.customError('Please select an audio file');
            return;
        }
        
        const file = fileInput.files[0];
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        // Show upload progress
        const submitBtn = document.getElementById('submitUpload');
        if (!submitBtn) {
            this.customError('Upload button not found');
            return;
        }
        
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        
        if (!btnText) {
            this.customError('Button text element not found');
            return;
        }
        
        const originalText = btnText.textContent;
        btnText.textContent = 'Uploading...';
        if (btnSpinner) {
            btnSpinner.classList.remove('hidden');
        }
        submitBtn.disabled = true;
        
        try {
            // Show upload progress
            this.showUploadProgress();
            
            // Upload file to Supabase Storage with progress tracking
            const uploadResult = await this.uploadFileWithProgress(file, this.currentUser.id);
            
            // Get audio duration
            const duration = await this.getAudioDuration(file);
            
            // Create database record
            const categoryValue = document.getElementById('classCategory').value;
            const levelValue = document.getElementById('classLevel').value;
            
            const classData = {
                title,
                description,
                tags,
                category: categoryValue || null,
                level: levelValue || null,
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
            await this.loadAdminData();
            
            // Reset form
            this.resetUploadForm();
            this.hideUploadProgress();
            
            this.customSuccess('Class uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            this.customError('Upload failed: ' + error.message);
            this.hideUploadProgress();
        } finally {
            if (btnText) {
                btnText.textContent = originalText;
            }
            if (btnSpinner) {
                btnSpinner.classList.add('hidden');
            }
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
                <button class="play-btn" onclick="app.handlePlayButtonClick('${cls.id}')">▶ Play</button>
            </div>
        `).join('');
        
        // Restore playing indicators after re-render
        if (this.currentAudio && this.currentAudio.id) {
            this.updatePlayingIndicators(this.currentAudio.id);
        }
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

    async loadAdminData() {
        if (!this.currentUser) return;
        
        try {
            // Get all classes for admin view
            const { data, error } = await supabase
                .from('audio_classes')
                .select('*')
                .eq('created_by', this.currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.adminClasses = data || [];
            this.renderManageTab();
            this.renderAnalytics();
        } catch (error) {
            console.error('Failed to load admin data:', error);
        }
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

    // Handle play button clicks with smart play/pause logic
    handlePlayButtonClick(classId) {
        // If this is the currently playing track
        if (this.currentAudio && this.currentAudio.id === classId) {
            // Toggle play/pause
            this.togglePlayPause();
        } else {
            // Play new track
            this.playClass(classId);
        }
    }

    // Audio Player Methods
    playClass(classId) {
        const cls = this.classes.find(c => c.id === classId);
        if (!cls) return;
        
        this.currentPlaylist = this.classes;
        this.currentTrackIndex = this.classes.findIndex(c => c.id === classId);
        this.loadTrack(cls);
        this.showAudioPlayer();
        this.updatePlayingIndicators(classId);
        this.play();
    }

    loadTrack(cls) {
        this.currentAudio = cls;
        this.audioElement.src = cls.audio_file_url;
        this.currentTitle.textContent = cls.title;
        this.currentDescription.textContent = cls.description || '';
        this.audioElement.load();
        
        // Update playing indicators when loading a new track
        if (cls && cls.id) {
            this.updatePlayingIndicators(cls.id);
        }
    }

    showAudioPlayer() {
        this.audioPlayer.classList.remove('hidden');
    }

    closeAudioPlayer() {
        this.audioPlayer.classList.add('hidden');
        this.pause();
        this.audioElement.src = '';
        this.currentAudio = null;
        this.clearPlayingIndicators();
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
        
        // Remove paused state from visual indicators
        document.querySelectorAll('.playing.paused').forEach(element => {
            element.classList.remove('paused');
        });
        
        // Update play button text for currently playing track
        if (this.currentAudio && this.currentAudio.id) {
            const playingCard = document.querySelector(`[data-id="${this.currentAudio.id}"]`);
            if (playingCard) {
                const playBtn = playingCard.querySelector('.play-btn');
                if (playBtn) {
                    playBtn.textContent = '🎵 Now Playing';
                }
            }
        }
    }

    pause() {
        this.audioElement.pause();
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶';
        
        // Add paused state to visual indicators
        document.querySelectorAll('.playing').forEach(element => {
            element.classList.add('paused');
        });
        
        // Update play button text for paused track
        if (this.currentAudio && this.currentAudio.id) {
            const playingCard = document.querySelector(`[data-id="${this.currentAudio.id}"]`);
            if (playingCard) {
                const playBtn = playingCard.querySelector('.play-btn');
                if (playBtn) {
                    playBtn.textContent = '▶ Resume';
                }
            }
        }
    }

    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            const newTrack = this.currentPlaylist[this.currentTrackIndex];
            this.loadTrack(newTrack);
            if (this.isPlaying) this.play();
        }
    }

    nextTrack() {
        if (this.currentTrackIndex < this.currentPlaylist.length - 1) {
            this.currentTrackIndex++;
            const newTrack = this.currentPlaylist[this.currentTrackIndex];
            this.loadTrack(newTrack);
            if (this.isPlaying) this.play();
        } else {
            // End of playlist
            this.pause();
            this.clearPlayingIndicators();
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
        const confirmed = await this.customConfirm('Are you sure you want to delete this class?', 'Delete Class');
        if (!confirmed) return;
        
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
            await this.loadAdminData();
            
            // If currently playing this class, stop playback
            if (this.currentAudio && this.currentAudio.id === classId) {
                this.closeAudioPlayer();
            }
            
            this.customSuccess('Class deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            this.customError('Delete failed: ' + error.message);
        }
    }

    // Admin Panel Tab Management
    switchTab(tabName) {
        this.currentAdminTab = tabName;
        
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
        
        // Update URL with query parameter for non-upload tabs
        if (tabName !== 'upload') {
            const currentUrl = window.location.pathname + window.location.search;
            const expectedUrl = `/admin?tab=${tabName}`;
            if (currentUrl !== expectedUrl) {
                this.router.navigate(expectedUrl);
            }
        } else {
            // For upload tab, just use /admin without query params
            const currentUrl = window.location.pathname + window.location.search;
            if (currentUrl !== '/admin') {
                this.router.navigate('/admin');
            }
        }
        
        // Load tab-specific data
        if (tabName === 'manage') {
            this.renderManageTab();
        } else if (tabName === 'analytics') {
            this.renderAnalytics();
        }
    }

    // File Upload Enhancement
    handleDragOver(e) {
        e.preventDefault();
        this.fileUploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.audioFileInput.files = files;
            this.handleFileSelect({ target: { files } });
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.showFilePreview(file);
        }
    }

    async showFilePreview(file) {
        const preview = this.filePreview;
        const fileName = preview.querySelector('.file-name');
        const fileSize = preview.querySelector('.file-size');
        const fileDuration = preview.querySelector('.file-duration');
        
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        try {
            const duration = await this.getAudioDuration(file);
            fileDuration.textContent = this.formatTime(duration);
        } catch {
            fileDuration.textContent = 'Unknown';
        }
        
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        if (uploadPlaceholder) {
            uploadPlaceholder.classList.add('hidden');
        }
        preview.classList.remove('hidden');
    }

    removeSelectedFile() {
        this.audioFileInput.value = '';
        this.filePreview.classList.add('hidden');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        if (uploadPlaceholder) {
            uploadPlaceholder.classList.remove('hidden');
        }
    }

    resetUploadForm() {
        this.uploadForm.reset();
        this.removeSelectedFile();
        this.updateTagsPreview();
    }

    updateTagsPreview() {
        const tags = this.classTagsInput.value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        this.tagsPreview.innerHTML = tags.map(tag => `
            <span class="tag-preview">
                ${tag}
                <button type="button" class="tag-remove" onclick="app.removeTag('${tag}')">&times;</button>
            </span>
        `).join('');
    }

    removeTag(tagToRemove) {
        const tags = this.classTagsInput.value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag && tag !== tagToRemove);
        
        this.classTagsInput.value = tags.join(', ');
        this.updateTagsPreview();
    }

    addTagFromInput() {
        const currentTags = this.classTagsInput.value.split(',').map(tag => tag.trim());
        const lastTag = currentTags[currentTags.length - 1];
        
        if (lastTag && !currentTags.slice(0, -1).includes(lastTag)) {
            this.updateTagsPreview();
        }
    }

    showUploadProgress() {
        this.uploadProgress.classList.remove('hidden');
        this.updateUploadProgress(0);
    }

    hideUploadProgress() {
        this.uploadProgress.classList.add('hidden');
        this.updateUploadProgress(0);
    }

    updateUploadProgress(percentage) {
        const progressFill = this.uploadProgress.querySelector('.progress-fill');
        const progressText = this.uploadProgress.querySelector('.progress-text');
        
        progressFill.style.width = percentage + '%';
        progressText.textContent = Math.round(percentage) + '%';
    }

    async uploadFileWithProgress(file, userId) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // For now, simulate progress since Supabase client doesn't have built-in progress tracking
        // In a real implementation, you might use a custom upload with XMLHttpRequest
        const simulateProgress = () => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 90) {
                    clearInterval(interval);
                    this.updateUploadProgress(90);
                } else {
                    this.updateUploadProgress(progress);
                }
            }, 100);
            return interval;
        };

        const progressInterval = simulateProgress();

        try {
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file);

            clearInterval(progressInterval);
            this.updateUploadProgress(100);

            if (error) {
                console.error('Upload error:', error);
                throw error;
            }

            return {
                path: data.path,
                publicUrl: getPublicAudioUrl(data.path)
            };
        } catch (error) {
            clearInterval(progressInterval);
            throw error;
        }
    }

    // File Management
    renderManageTab() {
        if (!this.adminClasses) return;
        
        const filteredClasses = this.getFilteredAdminClasses();
        const paginatedClasses = this.getPaginatedClasses(filteredClasses);
        
        this.classesTableBody.innerHTML = paginatedClasses.map(cls => `
            <tr data-class-id="${cls.id}">
                <td><input type="checkbox" class="class-checkbox" value="${cls.id}"></td>
                <td>
                    <div class="class-title">${cls.title}</div>
                    <div class="class-description">${cls.description || 'No description'}</div>
                </td>
                <td>
                    <div class="class-category">${cls.category || 'Uncategorized'}</div>
                    <div class="class-tags-display">
                        ${cls.tags && cls.tags.length > 0 ? 
                            cls.tags.map(tag => `<span class="admin-tag">${tag}</span>`).join('') : 
                            '<span class="no-tags">No tags</span>'
                        }
                    </div>
                </td>
                <td>${this.formatTime(cls.duration || 0)}</td>
                <td>${this.formatFileSize(cls.file_size || 0)}</td>
                <td>${new Date(cls.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn secondary" onclick="app.editClass('${cls.id}')">Edit</button>
                        <button class="btn danger" onclick="app.deleteClass('${cls.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        this.updatePagination(filteredClasses.length);
        this.bindTableEvents();
        
        // Restore playing indicators after table re-render
        if (this.currentAudio && this.currentAudio.id) {
            this.updatePlayingIndicators(this.currentAudio.id);
        }
    }

    bindTableEvents() {
        // Bind checkbox events
        document.querySelectorAll('.class-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelectedClasses());
        });
    }

    getFilteredAdminClasses() {
        let filtered = [...this.adminClasses];
        
        const searchQuery = this.adminSearch.value.toLowerCase().trim();
        const categoryFilter = this.adminFilter.value;
        
        if (searchQuery) {
            filtered = filtered.filter(cls => 
                cls.title.toLowerCase().includes(searchQuery) ||
                (cls.description && cls.description.toLowerCase().includes(searchQuery))
            );
        }
        
        if (categoryFilter) {
            filtered = filtered.filter(cls => cls.category === categoryFilter);
        }
        
        return filtered;
    }

    getPaginatedClasses(classes) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return classes.slice(start, end);
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        this.pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= totalPages;
    }

    filterAdminClasses() {
        this.currentPage = 1;
        this.renderManageTab();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderManageTab();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.getFilteredAdminClasses().length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderManageTab();
        }
    }

    updateSelectedClasses() {
        const checkboxes = document.querySelectorAll('.class-checkbox');
        this.selectedClasses.clear();
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                this.selectedClasses.add(checkbox.value);
            }
        });
        
        this.deleteSelectedBtn.disabled = this.selectedClasses.size === 0;
        this.selectAllCheckbox.checked = checkboxes.length > 0 && 
            Array.from(checkboxes).every(cb => cb.checked);
    }

    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.class-checkbox');
        const selectAll = this.selectAllCheckbox.checked;
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
        
        this.updateSelectedClasses();
    }

    selectAllClasses() {
        this.selectAllCheckbox.checked = true;
        this.toggleSelectAll();
    }

    async deleteSelectedClasses() {
        if (this.selectedClasses.size === 0) return;
        
        const confirmMsg = `Are you sure you want to delete ${this.selectedClasses.size} selected class(es)?`;
        const confirmed = await this.customConfirm(confirmMsg, 'Delete Selected Classes');
        if (!confirmed) return;
        
        try {
            for (const classId of this.selectedClasses) {
                await this.deleteClass(classId, false);
            }
            
            this.selectedClasses.clear();
            await this.loadClasses();
            await this.loadAdminData();
            this.customSuccess('Selected classes deleted successfully!');
        } catch (error) {
            console.error('Bulk delete error:', error);
            this.customError('Failed to delete some classes: ' + error.message);
        }
    }

    // Edit functionality
    editClass(classId) {
        const cls = this.adminClasses.find(c => c.id === classId);
        if (!cls) return;
        
        this.editClassId.value = cls.id;
        this.editTitle.value = cls.title;
        this.editDescription.value = cls.description || '';
        this.editTags.value = cls.tags ? cls.tags.join(', ') : '';
        
        this.updateEditTagsPreview();
        this.editModal.classList.add('show');
    }

    updateEditTagsPreview() {
        const tags = this.editTags.value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        this.editTagsPreview.innerHTML = tags.map(tag => `
            <span class="tag-preview">
                ${tag}
                <button type="button" class="tag-remove" onclick="app.removeEditTag('${tag}')">&times;</button>
            </span>
        `).join('');
    }

    removeEditTag(tagToRemove) {
        const tags = this.editTags.value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag && tag !== tagToRemove);
        
        this.editTags.value = tags.join(', ');
        this.updateEditTagsPreview();
    }

    async handleEditSubmit(e) {
        e.preventDefault();
        
        const classId = this.editClassId.value;
        const title = this.editTitle.value.trim();
        const description = this.editDescription.value.trim();
        const tags = this.editTags.value.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        try {
            await updateAudioClass(classId, {
                title,
                description,
                tags,
                updated_at: new Date().toISOString()
            });
            
            this.closeEditModalHandler();
            await this.loadClasses();
            await this.loadAdminData();
            this.customSuccess('Class updated successfully!');
        } catch (error) {
            console.error('Edit error:', error);
            this.customError('Update failed: ' + error.message);
        }
    }

    closeEditModalHandler() {
        if (this.editModal) {
            this.editModal.classList.remove('show');
        }
        if (this.editForm) {
            this.editForm.reset();
        }
    }

    // Analytics
    renderAnalytics() {
        if (!this.adminClasses) return;
        
        const stats = this.calculateStats();
        
        this.totalClassesEl.textContent = stats.totalClasses;
        this.totalDurationEl.textContent = this.formatDuration(stats.totalDuration);
        this.totalSizeEl.textContent = this.formatFileSize(stats.totalSize);
        this.avgDurationEl.textContent = this.formatTime(stats.avgDuration);
        
        this.renderCategoryChart(stats.categories);
        this.renderRecentUploads();
    }

    calculateStats() {
        const classes = this.adminClasses;
        
        const totalClasses = classes.length;
        const totalDuration = classes.reduce((sum, cls) => sum + (cls.duration || 0), 0);
        const totalSize = classes.reduce((sum, cls) => sum + (cls.file_size || 0), 0);
        const avgDuration = totalClasses > 0 ? totalDuration / totalClasses : 0;
        
        const categories = {};
        classes.forEach(cls => {
            const category = cls.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + 1;
        });
        
        return {
            totalClasses,
            totalDuration,
            totalSize,
            avgDuration,
            categories
        };
    }

    renderCategoryChart(categories) {
        const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
        
        this.categoryChart.innerHTML = Object.entries(categories)
            .map(([category, count]) => {
                const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                return `
                    <div class="category-item">
                        <div class="category-bar">
                            <div class="category-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="category-label">${category}: ${count} (${percentage}%)</div>
                    </div>
                `;
            }).join('');
    }

    renderRecentUploads() {
        const recent = this.adminClasses
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
        
        this.recentUploads.innerHTML = recent.map(cls => `
            <div class="recent-upload-item">
                <div class="upload-title">${cls.title}</div>
                <div class="upload-date">${new Date(cls.created_at).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    // Utility functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }


    // Visual indicators for currently playing audio
    updatePlayingIndicators(currentClassId) {
        // Clear all existing playing indicators
        this.clearPlayingIndicators();
        
        // Add playing class to the currently playing card in main grid
        const playingCard = document.querySelector(`[data-id="${currentClassId}"]`);
        if (playingCard) {
            playingCard.classList.add('playing');
            
            // Update play button text and style
            const playBtn = playingCard.querySelector('.play-btn');
            if (playBtn) {
                playBtn.textContent = '🎵 Now Playing';
                playBtn.classList.add('now-playing');
            }
        }
        
        // Add playing class to the currently playing row in admin table (if visible)
        const playingRow = document.querySelector(`tr[data-class-id="${currentClassId}"]`);
        if (playingRow) {
            playingRow.classList.add('playing');
        }
    }
    
    clearPlayingIndicators() {
        // Remove playing class from all cards and reset play buttons
        document.querySelectorAll('.class-card.playing').forEach(card => {
            card.classList.remove('playing');
            
            // Reset play button text and style
            const playBtn = card.querySelector('.play-btn');
            if (playBtn) {
                playBtn.textContent = '▶ Play';
                playBtn.classList.remove('now-playing');
            }
        });
        
        // Reset all now-playing buttons that might not have the playing class
        document.querySelectorAll('.play-btn.now-playing').forEach(btn => {
            btn.textContent = '▶ Play';
            btn.classList.remove('now-playing');
        });
        
        // Remove playing class from all table rows
        document.querySelectorAll('tr.playing').forEach(row => {
            row.classList.remove('playing');
        });
    }

    // Override deleteClass to handle both single and bulk delete
    async deleteClass(classId, showConfirm = true) {
        if (showConfirm) {
            const confirmed = await this.customConfirm('Are you sure you want to delete this class?', 'Delete Class');
            if (!confirmed) return;
        }
        
        try {
            const cls = this.classes.find(c => c.id === classId) || 
                       this.adminClasses.find(c => c.id === classId);
            
            if (cls && cls.audio_file_path) {
                // Delete file from storage
                await deleteAudioFile(cls.audio_file_path);
            }
            
            // Delete from database
            await deleteAudioClass(classId);
            
            // Refresh data only for single delete
            if (showConfirm) {
                await this.loadClasses();
                await this.loadAdminData();
                
                // If currently playing this class, stop playback
                if (this.currentAudio && this.currentAudio.id === classId) {
                    this.closeAudioPlayer();
                }
                
                this.customSuccess('Class deleted successfully!');
            }
        } catch (error) {
            console.error('Delete error:', error);
            if (showConfirm) {
                this.customError('Delete failed: ' + error.message);
            } else {
                throw error; // Re-throw for bulk delete handling
            }
        }
    }
}

// Initialize the application
const app = new AudioClassesApp();