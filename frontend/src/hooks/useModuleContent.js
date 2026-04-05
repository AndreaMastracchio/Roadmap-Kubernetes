import { useState, useEffect } from 'react';

export const useModuleContent = (activeModule) => {
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadContent = async () => {
      try {
        // Fetch Markdown
        const mdRes = await fetch(`/modules/${activeModule.file}`);
        if (!mdRes.ok) throw new Error('Modulo non trovato');
        const mdText = await mdRes.text();

        // Fetch Quiz (optional)
        const jsonFile = activeModule.file.replace('.md', '.json');
        let quizData = [];
        try {
          const jsonRes = await fetch(`/modules/${jsonFile}`);
          if (jsonRes.ok) {
            quizData = await jsonRes.json();
          }
        } catch (e) {
          // No quiz is fine
        }

        if (isMounted) {
          setContent(mdText);
          setQuestions(quizData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setContent('# Errore\nImpossibile caricare il modulo.');
          setQuestions([]);
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [activeModule]);

  return { content, questions, loading, error };
};
