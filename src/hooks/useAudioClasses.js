import { useState, useEffect, useCallback } from 'react';
import { getAudioClasses, createAudioClass, updateAudioClass, deleteAudioClass } from '../lib/supabase';

export function useAudioClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getAudioClasses();
        if (data && data.length > 0) {
          console.log('Loaded real Supabase data:', data);
          setClasses(data);
        } else {
          console.log('No data from Supabase, using mock data');
          throw new Error('No data available');
        }
      } catch (supabaseError) {
        console.warn('Using mock data:', supabaseError.message);
        
        // Use mock data with working audio URLs (matching database schema)
        const mockData = [
          {
            id: 1,
            title: "Torah Study - Introduction",
            description: "Basic principles of Torah interpretation and study methods",
            category: "Torah Study",
            tags: ["beginner", "torah", "study"],
            created_at: "2024-01-15T10:00:00Z",
            duration: 30,
            audio_file_url: "https://www.w3schools.com/html/horse.mp3"
          },
          {
            id: 2,
            title: "Morning Prayer Guide", 
            description: "Step-by-step guide to morning prayers",
            category: "Prayer",
            tags: ["prayer", "morning", "guide"],
            created_at: "2024-01-10T15:30:00Z",
            duration: 30,
            audio_file_url: "https://www.w3schools.com/html/horse.ogg"
          },
          {
            id: 3,
            title: "Shabbat Preparation",
            description: "How to prepare for Shabbat - practical guide",
            category: "Shabbat",
            tags: ["shabbat", "preparation", "practical"],
            created_at: "2024-01-08T09:15:00Z", 
            duration: 25,
            audio_file_url: "https://www.w3schools.com/html/horse.mp3"
          }
        ];
        
        console.log('Mock data loaded:', mockData);
        setClasses(mockData);
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const createClass = async (classData) => {
    try {
      const newClass = await createAudioClass(classData);
      setClasses(prev => [newClass, ...prev]);
      return newClass;
    } catch (err) {
      console.error('Error creating class:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateClass = async (id, updates) => {
    try {
      const updatedClass = await updateAudioClass(id, updates);
      setClasses(prev => prev.map(cls => 
        cls.id === id ? updatedClass : cls
      ));
      return updatedClass;
    } catch (err) {
      console.error('Error updating class:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteClass = async (id) => {
    try {
      await deleteAudioClass(id);
      setClasses(prev => prev.filter(cls => cls.id !== id));
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteMultipleClasses = async (ids) => {
    try {
      // Delete in parallel for better performance
      await Promise.all(ids.map(id => deleteAudioClass(id)));
      setClasses(prev => prev.filter(cls => !ids.includes(cls.id)));
    } catch (err) {
      console.error('Error deleting multiple classes:', err);
      setError(err.message);
      throw err;
    }
  };

  const refreshClasses = () => {
    loadClasses();
  };

  return {
    classes,
    loading,
    error,
    createClass,
    updateClass,
    deleteClass,
    deleteMultipleClasses,
    refreshClasses
  };
}