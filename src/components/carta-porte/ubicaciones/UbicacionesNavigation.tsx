
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface UbicacionesNavigationProps {
  showForm: boolean;
  isValid: boolean;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export function UbicacionesNavigation({
  showForm,
  isValid,
  onPrev,
  onNext
}: UbicacionesNavigationProps) {
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
        disabled={!isValid}
        className="flex items-center space-x-2"
      >
        <span>Continuar a Mercancías</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
