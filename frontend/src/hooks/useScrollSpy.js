import { useState, useEffect } from 'react';

export const useScrollSpy = (content, questions, exercises) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    const elements = document.querySelectorAll(
      '.markdown-content h1, .markdown-content h2, .markdown-content h3, #exercises-section, #quiz-section'
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content, questions, exercises]);

  return { activeSection, setActiveSection };
};
