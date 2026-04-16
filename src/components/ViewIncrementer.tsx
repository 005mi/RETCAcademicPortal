'use client';

import { useEffect, useRef } from 'react';

export default function ViewIncrementer({ paperId, disabled = false }: { paperId: string, disabled?: boolean }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (disabled || hasFired.current) return;
    hasFired.current = true;

    const key = `viewed_${paperId}`;
    const lastViewed = localStorage.getItem(key);
    const now = Date.now();
    
    // Increment if not viewed before or if last view was more than 24 hours ago
    if (!lastViewed || (now - parseInt(lastViewed)) > 24 * 60 * 60 * 1000) {
      // Set localStorage immediately to prevent race condition from concurrent calls
      localStorage.setItem(key, now.toString());
      
      fetch(`/api/papers/${paperId}/view`, { method: 'POST' })
        .catch(err => {
          console.error('Failed to increment view:', err);
          // Rollback localStorage if the request fails
          localStorage.removeItem(key);
        });
    }
  }, [paperId, disabled]);

  return null; // This component doesn't render anything
}
