import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="fab-container">
      <button className="fab-button" onClick={onClick} aria-label="Programar Viaje">
        <Plus className="fab-icon" />
      </button>
    </div>
  );
};
