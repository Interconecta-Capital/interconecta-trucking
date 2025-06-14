
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { MercanciaFormCompleta } from './mercancias/MercanciaFormCompleta';
import { MercanciaCompleta } from '@/types/cartaPorte';

interface MercanciasSectionProps {
  data: MercanciaCompleta[];
  onChange: (data: MercanciaCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MercanciasSection({ data, onChange, onNext, onPrev }: MercanciasSectionProps) {
  // Validar que hay al menos una mercancía con datos mínimos
  const isDataComplete = () => {
    return data.length > 0 && data.every(mercancia => 
      mercancia.descripcion && 
      mercancia.cantidad > 0 && 
      mercancia.bienes_transp &&
      mercancia.clave_unidad
    );
  };

  const handleAddMercancia = () => {
    const nuevaMercancia: MercanciaCompleta = {
      id: `mercancia-${Date.now()}`,
      descripcion: '',
      bienes_transp: '',
      clave_unidad: '',
      cantidad: 0,
      peso_kg: 0,
      valor_mercancia: 0,
      material_peligroso: false,
      moneda: 'MXN'
    };
    onChange([...data, nuevaMercancia]);
  };

  const handleUpdateMercancia = (index: number, mercancia: MercanciaCompleta) => {
    const newData = [...data];
    newData[index] = mercancia;
    onChange(newData);
  };

  const handleRemoveMercancia = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {data.map((mercancia, index) => (
          <MercanciaFormCompleta
            key={mercancia.id || index}
            mercancia={mercancia}
            onUpdate={(updatedMercancia) => handleUpdateMercancia(index, updatedMercancia)}
            onRemove={() => handleRemoveMercancia(index)}
            index={index}
          />
        ))}

        {data.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No hay mercancías agregadas. Agrega al menos una mercancía para continuar.
            </p>
            <Button onClick={handleAddMercancia}>
              Agregar Primera Mercancía
            </Button>
          </div>
        )}

        {data.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleAddMercancia}
            className="w-full"
          >
            Agregar Otra Mercancía
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
          className="flex items-center space-x-2"
        >
          <span>Continuar a Autotransporte</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
