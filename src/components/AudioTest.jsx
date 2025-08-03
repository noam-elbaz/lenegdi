import { useState, useRef } from 'react';

function AudioTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const testAudioUrl = "https://www.w3schools.com/html/horse.mp3";

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('Test audio - toggle play clicked');
    
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        console.log('Audio paused');
      } else {
        console.log('Attempting to play audio...');
        await audio.play();
        setIsPlaying(true);
        console.log('Audio playing');
      }
    } catch (error) {
      console.error('Playback failed:', error);
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      console.log('Audio metadata loaded. Duration:', audio.duration);
    }
  };

  const handleError = (e) => {
    console.error('Audio error:', e.target.error);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🧪 Audio Player Test</h3>
      
      <audio
        ref={audioRef}
        src={testAudioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        preload="metadata"
      />

      <div className="space-y-3">
        <div>
          <strong>Test Audio URL:</strong> 
          <a href={testAudioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">
            {testAudioUrl}
          </a>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          
          <span className="text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          <div>Status: {isPlaying ? 'Playing' : 'Stopped'}</div>
          <div>Current Time: {currentTime.toFixed(2)}s</div>
          <div>Duration: {duration.toFixed(2)}s</div>
        </div>
      </div>
    </div>
  );
}

export default AudioTest;