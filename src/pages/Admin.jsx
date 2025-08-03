import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAudioClasses } from '../hooks/useAudioClasses';
import { useFileUpload } from '../hooks/useFileUpload';
import { useModal } from '../hooks/useModal';
import { CardLoader } from '../components/LoadingSpinner';
import { InlineError } from '../components/ErrorMessage';
import Modal from '../components/Modal';

function Admin({ user, activeTab, setActiveTab }) {
  const { signOut, isAdmin } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // For testing purposes, allow any logged-in user to access admin
    // In production, you'd want proper role checking
    setIsAuthenticated(!!user);
    console.log('Admin auth check:', { user: !!user, isAdmin });
  }, [user, isAdmin]);

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Admin Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'manage' && <ManageTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { modal, success, error: showError, closeModal } = useModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      onLogin();
      // Redirect to upload page after successful login
      navigate('/upload');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Please login to access the admin panel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
        showCancel={modal.showCancel}
      />
    </div>
  );
}

function UploadTab() {
  const { createClass, classes } = useAudioClasses();
  const { uploadFile, validateAudioFile, formatFileSize, getAudioDuration } = useFileUpload();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail_url: '',
    tags: '',
    audio_file: null
  });
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [customTag, setCustomTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Get all existing tags from all classes
  const existingTags = [...new Set(
    classes.flatMap(cls => cls.tags || [])
  )].sort();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleTag = (tag) => {
    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(tag)) {
      newSelectedTags.delete(tag);
    } else {
      newSelectedTags.add(tag);
    }
    setSelectedTags(newSelectedTags);
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.has(customTag.trim())) {
      setSelectedTags(prev => new Set([...prev, customTag.trim()]));
      setCustomTag('');
    }
  };

  const removeTag = (tag) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      newSet.delete(tag);
      return newSet;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file using the hook
      const validationErrors = validateAudioFile(file);
      if (validationErrors.length > 0) {
        setMessage({ type: 'error', text: validationErrors[0] });
        return;
      }

      setFormData(prev => ({
        ...prev,
        audio_file: file
      }));
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.audio_file) {
      setMessage({ type: 'error', text: 'Please select an audio file.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {
      // Upload the file
      const { path: audioPath, publicUrl } = await uploadFile(
        formData.audio_file, 
        user.id, 
        setUploadProgress
      );

      // Get audio duration
      let duration = 0;
      try {
        duration = await getAudioDuration(formData.audio_file);
      } catch (err) {
        console.warn('Could not get audio duration:', err);
      }

      // Create the class record with all required fields
      await createClass({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        thumbnail_url: formData.thumbnail_url || null,
        tags: Array.from(selectedTags),
        audio_file_path: audioPath,
        audio_file_url: publicUrl,
        duration: Math.round(duration),
        file_size: formData.audio_file.size,
        mime_type: formData.audio_file.type,
        created_by: user.id
      });

      setMessage({ type: 'success', text: 'Audio class uploaded successfully!' });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        thumbnail_url: '',
        tags: '',
        audio_file: null
      });
      setSelectedTags(new Set());
      setCustomTag('');
      
      // Reset file input
      const fileInput = document.getElementById('audio_file');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload audio class. Please try again.' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Audio Class</h3>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="audio_file" className="block text-sm font-medium text-gray-700 mb-1">
            Audio File *
          </label>
          <input
            type="file"
            id="audio_file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">Supported formats: MP3, WAV, M4A (Max 50MB)</p>
          {formData.audio_file && (
            <p className="mt-1 text-sm text-green-600">
              Selected: {formData.audio_file.name} ({formatFileSize(formData.audio_file.size)})
            </p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            disabled={isUploading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm disabled:bg-gray-50"
            placeholder="Enter class title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            disabled={isUploading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm disabled:bg-gray-50"
            placeholder="Enter class description"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            disabled={isUploading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm disabled:bg-gray-50"
            placeholder="e.g. Torah Study, Prayer, Holiday"
          />
        </div>

        <div>
          <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-1">
            Thumbnail URL (Optional)
          </label>
          <input
            type="url"
            id="thumbnail_url"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleInputChange}
            disabled={isUploading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm disabled:bg-gray-50"
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1 text-sm text-gray-500">Square format recommended (1:1 aspect ratio)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          
          {/* Existing Tags */}
          {existingTags.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Select from existing tags:</p>
              <div className="flex flex-wrap gap-2">
                {existingTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    disabled={isUploading}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedTags.has(tag)
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {tag}
                    {selectedTags.has(tag) && (
                      <span className="ml-1">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Add Custom Tag */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Add a new tag:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                disabled={isUploading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 text-sm disabled:bg-gray-50"
                placeholder="Enter new tag"
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={isUploading || !customTag.trim()}
                className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Selected Tags Display */}
          {selectedTags.size > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Selected tags:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedTags).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={isUploading}
                      className="ml-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {isUploading && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Uploading...</span>
              <span className="text-sm text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading || !formData.title || !formData.audio_file}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload Class'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ManageTab() {
  const { classes, loading, updateClass, deleteMultipleClasses } = useAudioClasses();
  const { modal, confirm: showConfirm } = useModal();
  const [selectedClasses, setSelectedClasses] = useState(new Set());
  const [editingClass, setEditingClass] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSelectClass = (classId) => {
    const newSelected = new Set(selectedClasses);
    if (newSelected.has(classId)) {
      newSelected.delete(classId);
    } else {
      newSelected.add(classId);
    }
    setSelectedClasses(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedClasses.size === classes.length) {
      setSelectedClasses(new Set());
    } else {
      setSelectedClasses(new Set(classes.map(cls => cls.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedClasses.size === 0) return;
    
    const confirmed = await showConfirm(
      `Are you sure you want to delete ${selectedClasses.size} selected class(es)? This action cannot be undone.`,
      'Delete Classes'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await deleteMultipleClasses(Array.from(selectedClasses));
      setSelectedClasses(new Set());
      setMessage({ type: 'success', text: `${selectedClasses.size} class(es) deleted successfully.` });
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Failed to delete classes.' });
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass({ ...classItem, tags: classItem.tags.join(', ') });
  };

  const handleSaveEdit = async () => {
    try {
      await updateClass(editingClass.id, {
        title: editingClass.title,
        description: editingClass.description,
        category: editingClass.category,
        thumbnail_url: editingClass.thumbnail_url || null,
        tags: editingClass.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      
      setEditingClass(null);
      setMessage({ type: 'success', text: 'Class updated successfully.' });
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Failed to update class.' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Audio Classes</h3>
        <CardLoader text="Loading classes..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Manage Audio Classes</h3>
        {selectedClasses.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Delete Selected ({selectedClasses.size})
          </button>
        )}
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      {classes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">No audio classes found.</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedClasses.size === classes.length}
                onChange={handleSelectAll}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Select All ({classes.length} classes)
              </label>
            </div>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {classes.map((classItem) => (
              <li key={classItem.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedClasses.has(classItem.id)}
                      onChange={() => handleSelectClass(classItem.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {classItem.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {classItem.category || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {classItem.description || 'No description'}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Created: {formatDate(classItem.created_at)}</span>
                        <span className="mx-2">•</span>
                        <span>Duration: {formatDuration(classItem.duration)}</span>
                        {classItem.tags && classItem.tags.length > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Tags: {classItem.tags.join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit Modal */}
      {editingClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Class</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingClass.title}
                  onChange={(e) => setEditingClass(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingClass.description}
                  onChange={(e) => setEditingClass(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingClass.category}
                  onChange={(e) => setEditingClass(prev => ({ ...prev, category: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={editingClass.thumbnail_url || ''}
                  onChange={(e) => setEditingClass(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={editingClass.tags}
                  onChange={(e) => setEditingClass(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Separate with commas"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        buttons={modal.buttons}
        showCancel={modal.showCancel}
      />
    </div>
  );
}

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual analytics queries
      // const { data: totalClasses } = await supabase
      //   .from('audio_classes')
      //   .select('id', { count: 'exact' });
      
      // const { data: recentUploads } = await supabase
      //   .from('audio_classes')
      //   .select('id')
      //   .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock analytics data
      setAnalytics({
        totalClasses: 24,
        totalDuration: 43200, // in seconds
        recentUploads: timeframe === '7d' ? 3 : timeframe === '30d' ? 8 : 15,
        popularCategories: [
          { name: 'Torah Study', count: 8, percentage: 33 },
          { name: 'Prayer', count: 6, percentage: 25 },
          { name: 'Holiday', count: 5, percentage: 21 },
          { name: 'Ethics', count: 3, percentage: 13 },
          { name: 'History', count: 2, percentage: 8 }
        ],
        recentActivity: [
          { action: 'Upload', title: 'Shabbat Preparation', date: '2024-01-20' },
          { action: 'Edit', title: 'Prayer Fundamentals', date: '2024-01-19' },
          { action: 'Upload', title: 'Torah Commentary', date: '2024-01-18' },
          { action: 'Delete', title: 'Test Recording', date: '2024-01-17' },
          { action: 'Upload', title: 'Holiday Customs', date: '2024-01-16' }
        ],
        storageUsed: 2.3, // in GB
        storageLimit: 10.0 // in GB
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics & Statistics</h3>
        <CardLoader text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Analytics & Statistics</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📚</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Classes</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalClasses}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⏱️</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Duration</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatDuration(analytics.totalDuration)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📤</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Uploads</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.recentUploads}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">💾</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Storage Used</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.storageUsed}GB / {analytics.storageLimit}GB
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Categories */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Popular Categories</h4>
            <div className="space-y-3">
              {analytics.popularCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium text-gray-900 w-20">{category.name}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{category.count}</span>
                    <span className="text-sm text-gray-400">({category.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
            <div className="flow-root">
              <ul className="-mb-8">
                {analytics.recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== analytics.recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.action === 'Upload' ? 'bg-green-500' :
                            activity.action === 'Edit' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}>
                            <span className="text-white text-xs">
                              {activity.action === 'Upload' ? '↑' :
                               activity.action === 'Edit' ? '✏️' : '✕'}
                            </span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">{activity.action}</span> {activity.title}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(activity.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Storage Usage</h4>
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm text-gray-600">Used: {analytics.storageUsed}GB</span>
              <span className="text-sm text-gray-600">Available: {(analytics.storageLimit - analytics.storageUsed).toFixed(1)}GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  (analytics.storageUsed / analytics.storageLimit) > 0.8 ? 'bg-red-600' :
                  (analytics.storageUsed / analytics.storageLimit) > 0.6 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${(analytics.storageUsed / analytics.storageLimit) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {((analytics.storageUsed / analytics.storageLimit) * 100).toFixed(1)}% of {analytics.storageLimit}GB used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;