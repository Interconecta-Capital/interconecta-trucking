
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, ArrowRight, ArrowLeft } from 'lucide-react';

interface AutotransporteSectionProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSection({ data, onChange, onNext, onPrev }: AutotransporteSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Detalles del Autotransporte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sección de autotransporte en desarrollo</p>
            <p className="text-sm">Esta sección incluirá la gestión de vehículos, seguros y remolques</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        <Button onClick={onNext} className="flex items-center space-x-2">
          <span>Continuar a Figuras</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
