
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UbicacionFrecuente } from '@/hooks/useUbicaciones';

interface UbicacionesFrecuentesCardProps {
  ubicacionesFrecuentes: UbicacionFrecuente[];
  onCargarUbicacion: (frecuente: UbicacionFrecuente) => void;
}

export function UbicacionesFrecuentesCard({ 
  ubicacionesFrecuentes, 
  onCargarUbicacion 
}: UbicacionesFrecuentesCardProps) {
  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <h4 className="font-medium mb-3">Ubicaciones Frecuentes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ubicacionesFrecuentes.map((frecuente) => (
            <Button
              key={frecuente.id}
              type="button"
              variant="ghost"
              className="text-left justify-start h-auto p-3"
              onClick={() => onCargarUbicacion(frecuente)}
            >
              <div>
                <div className="font-medium">{frecuente.nombreUbicacion}</div>
                <div className="text-sm text-muted-foreground">{frecuente.rfcAsociado}</div>
                <div className="text-xs text-muted-foreground">
                  {frecuente.domicilio.calle}, {frecuente.domicilio.colonia}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
