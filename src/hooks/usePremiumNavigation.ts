
import { useState, useEffect } from 'react';

export const usePremiumNavigation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateNavigation = () => {
      const currentScrollY = window.scrollY;
      
      // Update scroll position
      setScrollY(currentScrollY);
      
      // Auto-hide navigation on scroll down (only after 200px)
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      setLastScrollY(currentScrollY);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateNavigation);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return { scrollY, isHidden };
};
