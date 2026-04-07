import { useState, useEffect, useRef } from 'react';

export const useScrollSpy = (content, questions, exercises) => {
  const [activeSection, setActiveSection] = useState('');
  const scrollTimer = useRef(null);

  useEffect(() => {
    let observer;
    
    const updateActiveSection = () => {
      const elements = Array.from(document.querySelectorAll(
        '.markdown-content h1, .markdown-content h2, .markdown-content h3, #exercises-section, #quiz-section'
      ));
      
      if (elements.length === 0) return;

      const offset = 150; // Soglia superiore (header + padding)
      let current = '';

      // Troviamo l'ultimo elemento che è SOPRA o ATTRAVERSO la soglia offset
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (!el.id) continue;
        
        const rect = el.getBoundingClientRect();
        if (rect.top <= offset) {
          current = el.id;
        } else {
          // Se questo elemento è sotto la soglia, quello precedente era quello attivo
          break;
        }
      }
      
      if (current && current !== activeSection) {
        setActiveSection(current);
      }
    };

    // Usiamo IntersectionObserver per monitorare i cambiamenti di visibilità
    // ma ricalcoliamo la sezione attiva in modo assoluto nel callback
    const setupObserver = () => {
      const elements = document.querySelectorAll(
        '.markdown-content h1, .markdown-content h2, .markdown-content h3, #exercises-section, #quiz-section'
      );

      if (elements.length === 0) return;

      const callback = () => {
        updateActiveSection();
      };

      observer = new IntersectionObserver(callback, {
        // Monitoriamo una zona ampia per triggerare aggiornamenti
        rootMargin: '-80px 0px -20% 0px',
        threshold: [0, 1]
      });

      elements.forEach((el) => {
        if (el.id) observer.observe(el);
      });

      // Eseguiamo un controllo iniziale immediato
      updateActiveSection();
    };

    // Diamo tempo al DOM di stabilizzarsi dopo il render del markdown
    const timer = setTimeout(setupObserver, 800);

    // Anche un listener dello scroll come paracadute (ottimizzato)
    const onScroll = () => {
      if (scrollTimer.current) return;
      scrollTimer.current = requestAnimationFrame(() => {
        updateActiveSection();
        scrollTimer.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (scrollTimer.current) cancelAnimationFrame(scrollTimer.current);
    };
  }, [content, questions, exercises]); // Rimosso activeSection dalle dipendenze per evitare loop

  return { activeSection, setActiveSection };
};
