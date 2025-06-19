
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface MercanciasNavigationProps {
  showForm: boolean;
  isDataComplete: () => boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function MercanciasNavigation({ 
  showForm, 
  isDataComplete, 
  onPrev, 
  onNext 
}: MercanciasNavigationProps) {
  if (showForm) {
    return null;
  }

  return (
    <div className="flex justify-between">
      <Button 
        type="button"
        variant="outline" 
        onClick={onPrev} 
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Anterior</span>
      </Button>
      
      <Button 
        type="button"
        onClick={onNext} 
        disabled={!isDataComplete()}
        className="flex items-center space-x-2"
      >
        <span>Continuar a Autotransporte</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
