
import { useEffect, useRef } from 'react';

interface InterconectaLandingClass {
  init(): void;
  setupScrollAnimations(): void;
  setupCounterAnimations(): void;
  setupSmoothScrolling(): void;
  setupInteractiveElements(): void;
}

class InterconectaLanding implements InterconectaLandingClass {
  init() {
    this.setupScrollAnimations();
    this.setupCounterAnimations();
    this.setupSmoothScrolling();
    this.setupInteractiveElements();
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });
  }

  setupCounterAnimations() {
    const animateCounter = (element: HTMLElement, target: number, suffix = '', duration = 2000) => {
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

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const numbers = entry.target.querySelectorAll('.trust-number');
          numbers.forEach(num => {
            const text = (num as HTMLElement).textContent || '';
            if (text.includes('98')) {
              animateCounter(num as HTMLElement, 98, '%');
            } else if (text.includes('3.2')) {
              animateCounter(num as HTMLElement, 3.2, 'min');
            } else if (text.includes('0')) {
              animateCounter(num as HTMLElement, 0);
            } else if (text.includes('24')) {
              (num as HTMLElement).textContent = '24/7';
            }
          });
          statsObserver.unobserve(entry.target);
        }
      });
    });

    const trustSection = document.querySelector('.trust-section');
    if (trustSection) {
      statsObserver.observe(trustSection);
    }
  }

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  setupInteractiveElements() {
    // Add click tracking for analytics
    document.querySelectorAll('.interactive').forEach(element => {
      element.addEventListener('click', (e) => {
        // Analytics tracking would go here
        console.log('Interaction:', (element as HTMLElement).textContent?.trim());
        
        // Add visual feedback
        (element as HTMLElement).style.transform = 'scale(0.98)';
        setTimeout(() => {
          (element as HTMLElement).style.transform = '';
        }, 150);
      });
    });

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard');
    });
  }
}

export const usePremiumAnimations = () => {
  const landingRef = useRef<InterconectaLanding | null>(null);

  useEffect(() => {
    if (!landingRef.current) {
      landingRef.current = new InterconectaLanding();
    }

    const initializeAnimations = () => {
      if (landingRef.current) {
        landingRef.current.init();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeAnimations);
    } else {
      initializeAnimations();
    }

    // Preload critical resources
    const prefetchLinks = ['/auth/login', '/auth/trial', '/dashboard'];
    prefetchLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    return () => {
      document.removeEventListener('DOMContentLoaded', initializeAnimations);
    };
  }, []);

  return { landingRef };
};
