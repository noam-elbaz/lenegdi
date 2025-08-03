import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSpinner';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
  const { user, loading, error } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState('upload');

  const handlePlayTrack = (track, trackList = []) => {
    if (currentTrack?.id === track.id) {
      // Same track - toggle play/pause
      setIsPlaying(!isPlaying);
    } else {
      // Different track - switch tracks and start playing
      setCurrentTrack(track);
      setPlaylist(trackList);
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  if (loading) {
    return <PageLoader text="Loading application..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Authentication Error</div>
          <div className="text-sm text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header 
            user={user}
          />
          <Routes>
            <Route path="/" element={
              <Home 
                onPlayTrack={handlePlayTrack} 
                currentTrack={currentTrack}
                isPlaying={isPlaying}
              />
            } />
            <Route path="/login" element={
              <Admin 
                user={user} 
                activeTab="upload"
                setActiveTab={setAdminActiveTab}
              />
            } />
            <Route path="/upload" element={
              <Admin 
                user={user} 
                activeTab="upload"
                setActiveTab={setAdminActiveTab}
              />
            } />
            <Route path="/manage" element={
              <Admin 
                user={user} 
                activeTab="manage"
                setActiveTab={setAdminActiveTab}
              />
            } />
            <Route path="/analytics" element={
              <Admin 
                user={user} 
                activeTab="analytics"
                setActiveTab={setAdminActiveTab}
              />
            } />
          </Routes>
          <AudioPlayer 
            currentTrack={currentTrack}
            playlist={playlist}
            isPlaying={isPlaying}
            onTrackChange={setCurrentTrack}
            onPlay={handlePlay}
            onPause={handlePause}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
