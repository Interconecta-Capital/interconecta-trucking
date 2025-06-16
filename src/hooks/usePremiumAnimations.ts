
import { useEffect, useRef, useCallback } from 'react';

export const usePremiumAnimations = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const initScrollReveal = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Unobserve after revealing to improve performance
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all scroll-reveal elements
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    scrollRevealElements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });
  }, []);

  const setupNavigationEffects = useCallback(() => {
    const nav = document.querySelector('.nav-premium');
    if (!nav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNav = () => {
      const scrollY = window.scrollY;
      
      // Add scrolled class for backdrop effect
      if (scrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      // Auto-hide navigation on scroll down (except at top)
      if (scrollY > lastScrollY && scrollY > 200) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const setupInteractiveElements = useCallback(() => {
    // Add click feedback for interactive elements
    const interactiveElements = document.querySelectorAll('.interactive');
    
    interactiveElements.forEach(element => {
      const handleClick = () => {
        // Visual feedback
        element.style.transform = 'scale(0.98)';
        setTimeout(() => {
          element.style.transform = '';
        }, 150);
      };

      element.addEventListener('click', handleClick);
      
      // Cleanup function would be returned from useEffect
      return () => {
        element.removeEventListener('click', handleClick);
      };
    });

    // Keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('using-keyboard');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const setupCounterAnimations = useCallback(() => {
    const animateCounter = (element: Element, target: number, suffix = '', duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      
      const updateCounter = () => {
        start += increment;
        if (start < target) {
          element.textContent = Math.floor(start) + suffix;
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target + suffix;
        }
      };
      
      updateCounter();
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const numbers = entry.target.querySelectorAll('.text-mono');
            numbers.forEach(num => {
              const text = num.textContent || '';
              if (text.includes('$2.5M')) {
                num.textContent = '$2.5M';
              } else if (text.includes('500+')) {
                animateCounter(num, 500, '+');
              } else if (text.includes('99.9%')) {
                animateCounter(num, 99.9, '%');
              } else if (text.includes('15 min')) {
                num.textContent = '15 min';
              }
            });
            statsObserver.unobserve(entry.target);
          }
        });
      }
    );

    const heroSection = document.querySelector('.hero-premium');
    if (heroSection) {
      statsObserver.observe(heroSection);
    }

    return () => {
      statsObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    // Initialize all animations and effects
    initScrollReveal();
    const cleanupNav = setupNavigationEffects();
    const cleanupInteractive = setupInteractiveElements();
    const cleanupCounters = setupCounterAnimations();

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      cleanupNav?.();
      cleanupInteractive?.();
      cleanupCounters?.();
    };
  }, [initScrollReveal, setupNavigationEffects, setupInteractiveElements, setupCounterAnimations]);

  return {
    initScrollReveal,
    setupNavigationEffects,
    setupInteractiveElements,
    setupCounterAnimations
  };
};
