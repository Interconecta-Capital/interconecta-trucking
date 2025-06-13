
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FiguraForm } from './FiguraForm';
import { AIAssistantButton } from '../mercancias/AIAssistantButton';
import { FiguraTransporte } from '@/hooks/useFigurasTransporte';

interface FigurasTransporteFormProps {
  data: FiguraTransporte[];
  onChange: (data: FiguraTransporte[]) => void;
}

export function FigurasTransporteForm({ data, onChange }: FigurasTransporteFormProps) {
  const addFigura = () => {
    const newFigura: FiguraTransporte = {
      tipo_figura: '01',
      rfc_figura: '',
      nombre_figura: '',
      num_licencia: '',
      domicilio: {
        pais: 'México',
        codigo_postal: '',
        estado: '',
        municipio: '',
        colonia: '',
        calle: '',
        numExterior: ''
      }
    };
    onChange([...data, newFigura]);
  };

  const removeFigura = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateFigura = (index: number, figura: FiguraTransporte) => {
    const newData = [...data];
    newData[index] = figura;
    onChange(newData);
  };

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      // Create new figura with AI suggestion
      const newFigura: FiguraTransporte = {
        tipo_figura: suggestion.data.tipo_figura || '01',
        rfc_figura: suggestion.data.rfc_figura || '',
        nombre_figura: suggestion.data.nombre_figura || '',
        num_licencia: suggestion.data.num_licencia || '',
        domicilio: suggestion.data.domicilio || {
          pais: 'México',
          codigo_postal: '',
          estado: '',
          municipio: '',
          colonia: '',
          calle: '',
          numExterior: ''
        }
      };
      onChange([...data, newFigura]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Figuras de Transporte</h3>
          <p className="text-sm text-muted-foreground">
            Agrega las personas involucradas en el transporte (operador, propietario, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          <AIAssistantButton 
            context="figuras"
            onSuggestionApply={handleAISuggestion}
          />
          <Button type="button" onClick={addFigura} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Agregar Figura</span>
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay figuras de transporte agregadas</p>
          <p className="text-sm">Se requiere al menos un operador</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((figura, index) => (
            <FiguraForm
              key={index}
              figura={figura}
              onUpdate={(updatedFigura) => updateFigura(index, updatedFigura)}
              onRemove={() => removeFigura(index)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
