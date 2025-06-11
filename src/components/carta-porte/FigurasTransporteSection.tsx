
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { FigurasTransporteForm } from './figuras/FigurasTransporteForm';
import { FiguraTransporte } from '@/hooks/useFigurasTransporte';

interface FigurasTransporteSectionProps {
  data: FiguraTransporte[];
  onChange: (data: FiguraTransporte[]) => void;
  onPrev: () => void;
  onFinish: () => void;
}

export function FigurasTransporteSection({ data, onChange, onPrev, onFinish }: FigurasTransporteSectionProps) {
  // Validar que hay al menos un operador
  const isDataComplete = () => {
    return data.length > 0 && data.some(figura => figura.tipo_figura === '01');
  };

  return (
    <div className="space-y-6">
      <FigurasTransporteForm
        data={data}
        onChange={onChange}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        <Button 
          onClick={onFinish} 
          disabled={!isDataComplete()}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Generar Carta Porte</span>
        </Button>
      </div>
    </div>
  );
}
