import { useState, useEffect } from 'react';

export const useScrollSpy = (content, questions) => {
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

    const headings = document.querySelectorAll(
      '.markdown-content h1, .markdown-content h2, .markdown-content h3, #quiz-section'
    );
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [content, questions]);

  return { activeSection, setActiveSection };
};
