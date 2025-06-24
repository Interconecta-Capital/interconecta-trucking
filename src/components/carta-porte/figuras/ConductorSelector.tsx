
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, UserPlus } from 'lucide-react';
import { useConductores } from '@/hooks/useConductores';
import { ConductorFormModal } from '@/components/dashboard/ConductorFormModal';

interface ConductorSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  onConductorSelect?: (conductor: any) => void;
  figura?: any;
  onUpdate?: (figura: any) => void;
}

export const ConductorSelector = ({ value, onValueChange, onConductorSelect, figura, onUpdate }: ConductorSelectorProps) => {
  const { conductores, loading } = useConductores();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const conductoresDisponibles = conductores.filter(c => c.activo && c.estado === 'disponible');

  const handleConductorChange = (conductorId: string) => {
    const conductor = conductores.find(c => c.id === conductorId);
    if (conductor) {
      // Ensure direccion is properly formatted with proper type
      let direccionFormatted: {
        codigo_postal?: string;
        estado?: string;
        municipio?: string;
        colonia?: string;
        calle?: string;
        numero_exterior?: string;
        [key: string]: any;
      } = {};
      
      if (conductor.direccion) {
        if (typeof conductor.direccion === 'object' && conductor.direccion !== null) {
          direccionFormatted = conductor.direccion as any;
        } else if (typeof conductor.direccion === 'string') {
          // If it's a string, create a basic address object
          direccionFormatted = { calle: conductor.direccion };
        }
      }

      onValueChange(conductorId);
      onConductorSelect?.({
        ...conductor,
        direccion: direccionFormatted
      });

      // Update figura if provided
      if (figura && onUpdate) {
        onUpdate({
          ...figura,
          nombre_figura: conductor.nombre,
          rfc_figura: conductor.rfc || '',
          num_licencia: conductor.num_licencia || '',
          tipo_figura: '01', // Operador
          domicilio: {
            pais: 'México',
            codigo_postal: direccionFormatted.codigo_postal || '',
            estado: direccionFormatted.estado || '',
            municipio: direccionFormatted.municipio || '',
            colonia: direccionFormatted.colonia || '',
            calle: direccionFormatted.calle || '',
            numero_exterior: direccionFormatted.numero_exterior || ''
          }
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-blue-600" />
        <span className="font-medium">Conductor</span>
      </div>
      
      <div className="flex gap-2">
        <Select value={value} onValueChange={handleConductorChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar conductor" />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="" disabled>Cargando conductores...</SelectItem>
            ) : conductoresDisponibles.length === 0 ? (
              <SelectItem value="" disabled>No hay conductores disponibles</SelectItem>
            ) : (
              conductoresDisponibles.map((conductor) => (
                <SelectItem key={conductor.id} value={conductor.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{conductor.nombre}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {conductor.num_licencia || 'Sin licencia'}
                    </Badge>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCreateModal(true)}
          title="Crear nuevo conductor"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      <ConductorFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
};
