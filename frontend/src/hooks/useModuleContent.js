import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const extractSections = (markdown) => {
  const sections = [];
  const lines = markdown.split('\n');
  const slugify = (text) => text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    const match = trimmedLine.match(/^(#{1,6})\s*(.+)$/);
    if (match) {
      const title = match[2].trim();
      // Rimuoviamo eventuali emoji dal titolo per lo slug (comune in k8s-fondamentali)
      const cleanTitle = title.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F200}-\u{1F2FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      
      sections.push({
        id: Math.random().toString(36).substr(2, 9),
        title,
        anchor: slugify(cleanTitle || title)
      });
    }
  });
  return sections;
};

export const useModuleContent = (activeCourse, activeModule) => {
  const [content, setContent] = useState('');
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeModule) {
      setContent('');
      setSections([]);
      setQuestions([]);
      setExercises([]);
      setLoading(false);
      return;
    }

    const courseId = activeCourse?.id || 'k8s-fondamentali';

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadContent = async () => {
      try {
        // Fetch Markdown dal backend
        const mdRes = await fetch(API_ENDPOINTS.MODULES(courseId, activeModule.id));
        if (!mdRes.ok) throw new Error('Modulo non trovato');
        const mdText = await mdRes.text();

        // Fetch Data (Quiz & Exercises) dal backend
        let data = { quiz: [], exercises: [] };
        try {
          const jsonRes = await fetch(API_ENDPOINTS.MODULES_DATA(courseId, activeModule.id));
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
          setSections(extractSections(mdText));
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
  }, [activeCourse, activeModule]);

  return { content, sections, questions, exercises, loading, error };
};
