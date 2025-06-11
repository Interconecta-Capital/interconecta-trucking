
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowLeft, CheckCircle } from 'lucide-react';

interface FigurasTransporteSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onPrev: () => void;
  onFinish: () => void;
}

export function FigurasTransporteSection({ data, onChange, onPrev, onFinish }: FigurasTransporteSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Figuras del Transporte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sección de figuras de transporte en desarrollo</p>
            <p className="text-sm">Esta sección incluirá operadores, propietarios y otras figuras</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        <Button onClick={onFinish} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4" />
          <span>Generar Carta Porte</span>
        </Button>
      </div>
    </div>
  );
}
