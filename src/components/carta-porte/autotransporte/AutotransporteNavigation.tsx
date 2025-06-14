
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface AutotransporteNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  isComplete: boolean;
}

export function AutotransporteNavigation({ onNext, onPrev, isComplete }: AutotransporteNavigationProps) {
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Anterior</span>
      </Button>
      
      <Button 
        onClick={onNext} 
        disabled={!isComplete}
        className="flex items-center space-x-2"
      >
        <span>Continuar a Figuras</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
