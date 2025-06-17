
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
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

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
      const navElement = nav as HTMLElement;
      
      if (scrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      if (scrollY > lastScrollY && scrollY > 200) {
        navElement.style.transform = 'translateY(-100%)';
      } else {
        navElement.style.transform = 'translateY(0)';
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
    const interactiveElements = document.querySelectorAll('.interactive');
    
    interactiveElements.forEach(element => {
      const handleClick = () => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.transform = 'scale(0.98)';
        setTimeout(() => {
          htmlElement.style.transform = '';
        }, 150);
      };

      element.addEventListener('click', handleClick);
    });

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
        const htmlElement = element as HTMLElement;
        if (start < target) {
          htmlElement.textContent = Math.floor(start) + suffix;
          requestAnimationFrame(updateCounter);
        } else {
          htmlElement.textContent = target + suffix;
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
                const htmlElement = num as HTMLElement;
                htmlElement.textContent = '$2.5M';
              } else if (text.includes('500+')) {
                animateCounter(num, 500, '+');
              } else if (text.includes('99.9%')) {
                animateCounter(num, 99.9, '%');
              } else if (text.includes('15 min')) {
                const htmlElement = num as HTMLElement;
                htmlElement.textContent = '15 min';
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
    initScrollReveal();
    const cleanupNav = setupNavigationEffects();
    const cleanupInteractive = setupInteractiveElements();
    const cleanupCounters = setupCounterAnimations();

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
