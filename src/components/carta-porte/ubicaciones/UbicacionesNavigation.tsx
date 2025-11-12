
import React from 'react';
import { Button } from '@/components/ui/button';

interface UbicacionesNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  canContinue: boolean;
}

export function UbicacionesNavigation({ onPrev, onNext, canContinue }: UbicacionesNavigationProps) {
  return (
    <div className="flex justify-end pt-6">
      <Button
        type="button"
        onClick={onNext}
        disabled={!canContinue}
        className="bg-green-600 hover:bg-green-700"
      >
        Continuar a Mercancías
      </Button>
    </div>
  );
}
