'use client';

import { useEffect } from 'react';

export default function ScrollbarObserver() {
  useEffect(() => {
    const heroSection = document.getElementById('halcon-scroll-container');
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Check if it's out of view and above the viewport
          if (!entry.isIntersecting && entry.boundingClientRect.y < 0) {
            document.body.classList.add('show-scrollbar');
          } else {
            document.body.classList.remove('show-scrollbar');
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(heroSection);

    return () => {
      observer.disconnect();
      document.body.classList.remove('show-scrollbar');
    };
  }, []);

  return null;
}
