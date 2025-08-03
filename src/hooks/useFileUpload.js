import { useState } from 'react';
import { uploadAudioFile, deleteAudioFile } from '../lib/supabase';

export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (file, userId, onProgress) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (!file.type.startsWith('audio/')) {
        throw new Error('Please select a valid audio file');
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size must be less than 50MB');
      }

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          if (onProgress) onProgress(newProgress);
          return newProgress;
        });
      }, 200);

      // Upload the file
      const result = await uploadAudioFile(file, userId);

      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (onProgress) onProgress(100);

      return result;
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteFile = async (filePath) => {
    try {
      setError(null);
      await deleteAudioFile(filePath);
    } catch (err) {
      console.error('Delete file error:', err);
      setError(err.message);
      throw err;
    }
  };

  const validateAudioFile = (file) => {
    const errors = [];

    if (!file) {
      errors.push('No file selected');
      return errors;
    }

    if (!file.type.startsWith('audio/')) {
      errors.push('Please select a valid audio file');
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    const allowedTypes = [
      'audio/mpeg',      // MP3
      'audio/wav',       // WAV
      'audio/mp4',       // M4A
      'audio/x-m4a',     // M4A alternative
      'audio/aac',       // AAC
      'audio/ogg',       // OGG
      'audio/webm'       // WebM
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push('Unsupported audio format. Please use MP3, WAV, M4A, AAC, OGG, or WebM');
    }

    return errors;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAudioDuration = (file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => {
        reject(new Error('Could not load audio file'));
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  return {
    uploadFile,
    deleteFile,
    validateAudioFile,
    formatFileSize,
    getAudioDuration,
    uploadProgress,
    isUploading,
    error
  };
}