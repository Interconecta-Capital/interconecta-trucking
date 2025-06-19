
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface UbicacionesSectionNavigationProps {
  canContinue: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function UbicacionesSectionNavigation({ 
  canContinue, 
  onPrev, 
  onNext 
}: UbicacionesSectionNavigationProps) {
  return (
    <div className="flex justify-between pt-6">
      <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Anterior
      </Button>
      <Button 
        onClick={onNext} 
        disabled={!canContinue}
        className="flex items-center gap-2"
      >
        Continuar a Mercancías
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
