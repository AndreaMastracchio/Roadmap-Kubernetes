import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export const useModuleContent = (activeModule) => {
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeModule) {
      setContent('');
      setQuestions([]);
      setExercises([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadContent = async () => {
      try {
        // Fetch Markdown dal backend
        const mdRes = await fetch(API_ENDPOINTS.MODULES(activeModule.id));
        if (!mdRes.ok) throw new Error('Modulo non trovato');
        const mdText = await mdRes.text();

        // Fetch Data (Quiz & Exercises) dal backend
        let data = { quiz: [], exercises: [] };
        try {
          const jsonRes = await fetch(API_ENDPOINTS.MODULES_DATA(activeModule.id));
          if (jsonRes.ok) {
            const rawData = await jsonRes.json();
            if (Array.isArray(rawData)) {
              data.quiz = rawData.filter(item => !item.type || item.type !== 'coding');
              data.exercises = rawData.filter(item => item.type === 'coding');
            } else {
              data.quiz = rawData.quiz || [];
              data.exercises = rawData.exercises || [];
            }
          }
        } catch (e) {
          // No data is fine
        }

        if (isMounted) {
          setContent(mdText);
          setQuestions(data.quiz);
          setExercises(data.exercises);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setContent('# Errore\nImpossibile caricare il modulo.');
          setQuestions([]);
          setExercises([]);
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [activeModule]);

  return { content, questions, exercises, loading, error };
};
