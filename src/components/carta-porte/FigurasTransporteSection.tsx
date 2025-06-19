
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FiguraFormCompleta } from './figuras/FiguraFormCompleta';
import { FiguraCompleta } from '@/types/cartaPorte';

interface FigurasTransporteSectionProps {
  data: FiguraCompleta[];
  onChange: (data: FiguraCompleta[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function FigurasTransporteSection({ data, onChange, onPrev, onNext }: FigurasTransporteSectionProps) {
  // Validar que hay al menos un operador
  const isDataComplete = () => {
    return data.length > 0 && 
           data.some(figura => figura.tipo_figura === '01') &&
           data.every(figura => 
             figura.rfc_figura && 
             figura.nombre_figura && 
             figura.tipo_figura
           );
  };

  const handleAddFigura = () => {
    const nuevaFigura: FiguraCompleta = {
      id: `figura-${Date.now()}`,
      tipo_figura: data.length === 0 ? '01' : '02', // Primer figura siempre operador
      rfc_figura: '',
      nombre_figura: '',
      domicilio: {
        pais: 'México',
        codigo_postal: '',
        estado: '',
        municipio: '',
        colonia: '',
        calle: '',
        numero_exterior: ''
      }
    };
    onChange([...data, nuevaFigura]);
  };

  const handleUpdateFigura = (index: number, figura: FiguraCompleta) => {
    const newData = [...data];
    newData[index] = figura;
    onChange(newData);
  };

  const handleRemoveFigura = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {data.map((figura, index) => (
          <FiguraFormCompleta
            key={figura.id || index}
            figura={figura}
            onUpdate={(updatedFigura) => handleUpdateFigura(index, updatedFigura)}
            onRemove={() => handleRemoveFigura(index)}
            index={index}
          />
        ))}

        {data.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No hay figuras de transporte agregadas. Agrega al menos un operador para continuar.
            </p>
            <Button onClick={handleAddFigura}>
              Agregar Operador
            </Button>
          </div>
        )}

        {data.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleAddFigura}
            className="w-full"
          >
            Agregar Otra Figura de Transporte
          </Button>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isDataComplete()}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
        >
          <span>Finalizar Carta Porte</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
