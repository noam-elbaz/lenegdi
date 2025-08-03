import { useState, useEffect } from 'react';
import { useAudioClasses } from '../hooks/useAudioClasses';
import { useModal } from '../hooks/useModal';
import { PageLoader } from '../components/LoadingSpinner';
import { PageError } from '../components/ErrorMessage';
import Modal from '../components/Modal';

function Home({ onPlayTrack, currentTrack, isPlaying }) {
  const { classes, loading, error } = useAudioClasses();
  const { modal, error: showError } = useModal();
  const [filters, setFilters] = useState(new Set());
  const [availableTags, setAvailableTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Extract unique tags when classes change
    const tags = new Set();
    classes?.forEach(cls => {
      if (cls.tags && Array.isArray(cls.tags)) {
        cls.tags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags));
  }, [classes]);

  const toggleFilter = (tag) => {
    const newFilters = new Set(filters);
    if (newFilters.has(tag)) {
      newFilters.delete(tag);
    } else {
      newFilters.add(tag);
    }
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters(new Set());
  };

  const filteredClasses = classes.filter(cls => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        cls.title?.toLowerCase().includes(searchLower) ||
        cls.description?.toLowerCase().includes(searchLower) ||
        cls.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    // Tag filters
    if (filters.size === 0) return true;
    if (!cls.tags || !Array.isArray(cls.tags)) return false;
    return cls.tags.some(tag => filters.has(tag));
  });

  if (loading) {
    return <PageLoader text="Loading audio classes..." />;
  }

  if (error) {
    return (
      <PageError 
        title="Failed to Load Classes"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search audio classes..."
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  filters.has(tag)
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        {(filters.size > 0 || searchTerm) && (
          <div className="flex items-center gap-2">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear Search
              </button>
            )}
            {filters.size > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map(cls => (
          <div key={cls.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all ${
            cls.thumbnail_url ? 'flex' : 'flex flex-col'
          } ${
            currentTrack?.id === cls.id 
              ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md' 
              : 'border-gray-200'
          }`}>
            {cls.thumbnail_url && (
              <div className="w-1/2 aspect-square">
                <img 
                  src={cls.thumbnail_url} 
                  alt={cls.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`${cls.thumbnail_url ? 'w-1/2 p-4' : 'p-6'} flex-1 flex flex-col`}>
              <div className="flex items-start justify-between flex-1">
                <div className="flex-1 min-w-0">
                  <h3 className={`${cls.thumbnail_url ? 'text-base' : 'text-lg'} font-medium truncate flex items-center gap-2 ${
                    currentTrack?.id === cls.id ? 'text-indigo-700' : 'text-gray-900'
                  }`}>
                    {currentTrack?.id === cls.id && isPlaying && (
                      <span className="text-indigo-600 animate-pulse">🎵</span>
                    )}
                    {cls.title}
                  </h3>
                  <p className={`mt-1 ${cls.thumbnail_url ? 'text-xs' : 'text-sm'} text-gray-500 ${cls.thumbnail_url ? 'line-clamp-2' : ''}`}>
                    {cls.description || 'No description'}
                  </p>
                  {cls.duration && (
                    <div className={`mt-2 flex items-center ${cls.thumbnail_url ? 'text-xs' : 'text-sm'} text-gray-500`}>
                      <span>{Math.floor(cls.duration / 60)}:{String(cls.duration % 60).padStart(2, '0')}</span>
                    </div>
                  )}
                  </div>
                  {cls.tags && cls.tags.length > 0 && (
                    <div className={`mt-2 flex flex-wrap gap-1 ${cls.thumbnail_url ? 'max-h-8 overflow-hidden' : ''}`}>
                      {cls.tags.slice(0, cls.thumbnail_url ? 2 : cls.tags.length).map(tag => (
                        <span
                          key={tag}
                          className={`inline-flex items-center px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800 ${
                            cls.thumbnail_url ? 'text-xs' : 'text-xs'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {cls.thumbnail_url && cls.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{cls.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <button 
                  onClick={async () => {
                    const audioUrl = cls.audio_file_url || cls.audio_url;
                    if (!audioUrl) {
                      await showError('This audio class has no audio file.', 'No Audio File');
                      return;
                    }
                    onPlayTrack?.(cls, filteredClasses);
                  }}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                    cls.thumbnail_url ? 'text-sm' : 'text-base'
                  } ${
                    currentTrack?.id === cls.id && isPlaying
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {currentTrack?.id === cls.id && isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || filters.size > 0 
              ? 'No classes match your search or filters.' 
              : 'No audio classes available.'
            }
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
    </main>
  );
}

export default Home;