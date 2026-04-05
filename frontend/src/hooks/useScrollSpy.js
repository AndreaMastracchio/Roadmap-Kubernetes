import { useState, useEffect } from 'react';

export const useScrollSpy = (content, questions, exercises) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    let observer;
    
    // Piccolo timeout per assicurarsi che il DOM sia stato aggiornato da ReactMarkdown
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          // Filtriamo solo gli elementi che stanno entrando nella "zona attiva"
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          
          if (visibleEntries.length > 0) {
            // Se più elementi sono visibili, prendiamo quello più in alto nella zona attiva
            // Questo gestisce meglio lo scorrimento veloce
            const sorted = visibleEntries.sort((a, b) => 
              a.boundingClientRect.top - b.boundingClientRect.top
            );
            
            if (sorted[0].target.id) {
              setActiveSection(sorted[0].target.id);
            }
          }
        },
        {
          // Zona attiva: tra 100px dal top (sotto l'AppBar) e il 40% dell'altezza schermo
          // Una zona più ampia rende lo scroll spy più fluido e meno "nervoso"
          rootMargin: '-100px 0px -60% 0px',
          threshold: 0,
        }
      );

      const elements = document.querySelectorAll(
        '.markdown-content h1, .markdown-content h2, .markdown-content h3, #exercises-section, #quiz-section'
      );
      
      elements.forEach((el) => {
        if (el.id) {
          observer.observe(el);
        }
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [content, questions, exercises]);

  return { activeSection, setActiveSection };
};
