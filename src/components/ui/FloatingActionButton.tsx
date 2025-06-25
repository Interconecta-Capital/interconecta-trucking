import React, { useEffect, useState } from 'react';
import { Route } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setCompact(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fab-container">
      <button
        className={`fab-button ${compact ? 'compact' : ''}`}
        onClick={onClick}
        aria-label="Programar Viaje"
      >
        <Route className="fab-icon" />
        {!compact && <span className="fab-label">Nuevo</span>}
      </button>
    </div>
  );
};
