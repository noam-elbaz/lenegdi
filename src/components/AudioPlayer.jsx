import { useState, useRef, useEffect } from 'react';

function AudioPlayer({ currentTrack, playlist = [], isPlaying, onTrackChange, onPlay, onPause }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentTrack) {
      console.log('Audio player received track:', currentTrack);
      setIsVisible(true);
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      onPause?.();
      handleNext();
    };
    const handleError = (e) => {
      console.error('Audio error:', e.target.error);
      onPause?.();
    };
    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded, attempting to play if needed');
      setDuration(audio.duration || 0);
      // If we should be playing when metadata loads, start playback
      if (isPlaying) {
        audio.play()
          .then(() => console.log('Audio play succeeded after metadata load'))
          .catch(console.error);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Set the audio source and reset state when track changes
    if (currentTrack) {
      const audioUrl = currentTrack.audio_file_url || currentTrack.audio_url;
      console.log('Main useEffect running:', { 
        audioUrl, 
        currentAudioSrc: audio.src, 
        isPlaying, 
        audioPaused: audio.paused,
        srcMatch: audio.src === audioUrl
      });
      
      if (audio.src !== audioUrl) {
        console.log('Different source detected, setting new source');
        audio.src = audioUrl;
        setCurrentTime(0);
        setDuration(0);
        audio.load(); // Explicitly load the new source
        
        // After setting source, check if we should play
        if (isPlaying) {
          console.log('Should be playing, but waiting for metadata...');
          // Don't try to play immediately - let loadedmetadata handle it
        }
      } else if (isPlaying && audio.paused) {
        // Same source, just play/pause
        console.log('Same source, attempting to play');
        audio.play()
          .then(() => console.log('Audio play succeeded'))
          .catch(console.error);
      } else if (!isPlaying && !audio.paused) {
        console.log('Pausing audio');
        audio.pause();
      }
    } else {
      console.log('No current track');
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, isPlaying, onPause]);

  const togglePlay = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onTrackChange?.(playlist[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      onTrackChange?.(playlist[currentIndex + 1]);
    }
  };

  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    onPause?.();
    setIsVisible(false);
    onTrackChange?.(null);
  };

  return (
    <>
      {/* Audio element always rendered for proper ref handling */}
      <audio
        ref={audioRef}
        preload="metadata"
      />
      
      {/* Only show player UI when visible and has track */}
      {isVisible && currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="text-sm min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">{currentTrack.title}</div>
              <div className="text-gray-500 truncate">{currentTrack.category || 'Audio Class'}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevious}
              disabled={currentIndex <= 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏮
            </button>
            <button 
              onClick={togglePlay}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button 
              onClick={handleNext}
              disabled={currentIndex >= playlist.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏭
            </button>
          </div>
          
          <div className="flex items-center space-x-4 flex-1 justify-center">
            <span className="text-sm text-gray-500 w-12 text-right">{formatTime(currentTime)}</span>
            <div 
              className="w-64 bg-gray-200 rounded-full h-2 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-150"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 w-12">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button 
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  );
}

export default AudioPlayer;