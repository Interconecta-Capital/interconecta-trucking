
import React, { useEffect, useRef, useState } from 'react';

const PremiumTrustSection = () => {
  const [revealed, setRevealed] = useState(false);
  const [countersStarted, setCountersStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats = [
    { number: 98, suffix: '%', label: 'Reducción de errores' },
    { number: 3.2, suffix: 'mín', label: 'Tiempo promedio' },
    { number: 0, suffix: '', label: 'Multas SAT' },
    { number: 24, suffix: '/7', label: 'Automatización' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            setTimeout(() => setCountersStarted(true), 500);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-space-20 px-space-6 bg-gray-05 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-title mb-space-4 transition-all duration-1000 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Resultados que cambian el juego
        </h2>
        
        <p className={`text-body-lg text-gray-60 mb-space-12 transition-all duration-1000 delay-200 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Más de 2500 transportistas se conectan para automatizar completamente sus operaciones SAT.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`text-center transition-all duration-1000 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className="text-mono font-extrabold text-pure-black mb-space-2" style={{ fontSize: '48px' }}>
                <AnimatedCounter 
                  target={stat.number} 
                  suffix={stat.suffix}
                  started={countersStarted}
                />
              </div>
              <div className="text-caption text-gray-60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface AnimatedCounterProps {
  target: number;
  suffix: string;
  started: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, suffix, started }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!started) return;

    const duration = 2000;
    const step = target / (duration / 16);
    let currentValue = 0;

    const updateCounter = () => {
      currentValue += step;
      if (currentValue < target) {
        setCurrent(Math.floor(currentValue * 10) / 10);
        requestAnimationFrame(updateCounter);
      } else {
        setCurrent(target);
      }
    };

    updateCounter();
  }, [target, started]);

  if (target === 24 && suffix === '/7') {
    return <span>24/7</span>;
  }

  return <span>{current}{suffix}</span>;
};

export default PremiumTrustSection;
