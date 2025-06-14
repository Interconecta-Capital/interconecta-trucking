
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { AutotransporteFormCompleto } from './autotransporte/AutotransporteFormCompleto';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface AutotransporteSectionProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSection({ data, onChange, onNext, onPrev }: AutotransporteSectionProps) {
  // Validar que los datos mínimos estén completos
  const isDataComplete = () => {
    return (
      data.placa_vm &&
      data.anio_modelo_vm &&
      data.config_vehicular &&
      data.perm_sct &&
      data.num_permiso_sct &&
      data.asegura_resp_civil &&
      data.poliza_resp_civil
    );
  };

  return (
    <div className="space-y-6">
      <AutotransporteFormCompleto
        data={data}
        onChange={onChange}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isDataComplete()}
          className="flex items-center space-x-2"
        >
          <span>Continuar a Figuras</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
