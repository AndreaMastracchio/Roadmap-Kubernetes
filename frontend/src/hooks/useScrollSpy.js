import { useState, useEffect } from 'react';

export const useScrollSpy = (content, questions, exercises) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    let observer;
    
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(
        '.markdown-content h1, .markdown-content h2, .markdown-content h3, #exercises-section, #quiz-section'
      );

      const callback = (entries) => {
        // Troviamo l'elemento che sta più in alto ma è ancora visibile nella viewport (sotto l'header)
        const intersecting = entries.filter(e => e.isIntersecting);
        
        if (intersecting.length > 0) {
          // Ordiniamo per posizione nel viewport (top)
          const sorted = intersecting.sort((a, b) => 
            a.boundingClientRect.top - b.boundingClientRect.top
          );
          
          if (sorted[0].target.id) {
            setActiveSection(sorted[0].target.id);
          }
        }
      };

      observer = new IntersectionObserver(callback, {
        // Monitoriamo una zona che parte dall'header (100px) e copre buona parte della metà superiore
        rootMargin: '-100px 0px -40% 0px',
        threshold: [0, 0.1, 0.5, 1]
      });

      elements.forEach((el) => {
        if (el.id) observer.observe(el);
      });
    }, 500); // Ritardo leggermente maggiore per assicurarsi che Markdown sia renderizzato

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [content, questions, exercises]);

  return { activeSection, setActiveSection };
};
