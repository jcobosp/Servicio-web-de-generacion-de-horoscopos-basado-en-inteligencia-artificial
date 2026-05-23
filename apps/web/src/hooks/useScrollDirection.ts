import { useEffect, useState } from 'react';

export type ScrollState = {
  direction: 'up' | 'down';
  scrolled: boolean;
};

export function useScrollDirection(threshold = 80): ScrollState {
  const [state, setState] = useState<ScrollState>({
    direction: 'up',
    scrolled: false,
  });

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const direction = y > lastY && y > threshold ? 'down' : 'up';
        setState({ direction, scrolled: y > threshold });
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return state;
}
