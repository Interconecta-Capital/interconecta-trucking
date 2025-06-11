
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

interface MercanciasSectionProps {
  data: any[];
  ubicaciones: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MercanciasSection({ data, ubicaciones, onChange, onNext, onPrev }: MercanciasSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Gestión de Mercancías</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Importar Excel/CSV</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Agregar Mercancía</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sección de mercancías en desarrollo</p>
            <p className="text-sm">Esta sección incluirá la gestión completa de mercancías con carga masiva</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        <Button onClick={onNext} className="flex items-center space-x-2">
          <span>Continuar a Transporte</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
