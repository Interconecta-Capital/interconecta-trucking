
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConductores } from '@/hooks/useConductores';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';
import { User, Plus, Search } from 'lucide-react';
import { FiguraCompleta } from '@/types/cartaPorte';

interface ConductorSelectorProps {
  figura: FiguraCompleta;
  onUpdate: (figura: FiguraCompleta) => void;
}

export function ConductorSelector({ figura, onUpdate }: ConductorSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedConductorId, setSelectedConductorId] = useState<string>('');
  
  const { conductores, loading } = useConductores();

  const filteredConductores = conductores.filter(conductor => 
    conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.num_licencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConductorSelect = (conductorId: string) => {
    const conductor = conductores.find(c => c.id === conductorId);
    if (conductor) {
      setSelectedConductorId(conductorId);
      
      // Mapear dirección del conductor al formato de domicilio de la figura
      const domicilio = conductor.direccion ? {
        pais: 'México',
        codigo_postal: (conductor.direccion as any).codigoPostal || '',
        estado: (conductor.direccion as any).estado || '',
        municipio: (conductor.direccion as any).municipio || '',
        colonia: (conductor.direccion as any).colonia || '',
        calle: (conductor.direccion as any).calle || '',
        numero_exterior: (conductor.direccion as any).numExterior || ''
      } : figura.domicilio;

      onUpdate({
        ...figura,
        rfc_figura: conductor.rfc || '',
        nombre_figura: conductor.nombre || '',
        num_licencia: conductor.num_licencia || '',
        residencia_fiscal_figura: conductor.residencia_fiscal || 'MEX',
        num_reg_id_trib_figura: conductor.num_reg_id_trib || '',
        domicilio
      });
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-green-500" />
          Seleccionar Conductor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, RFC o licencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4">Cargando conductores...</div>
        ) : filteredConductores.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {searchTerm ? 'No se encontraron conductores' : 'No hay conductores registrados'}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredConductores.map((conductor) => (
              <div
                key={conductor.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedConductorId === conductor.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleConductorSelect(conductor.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">
                      {conductor.nombre}
                      {conductor.rfc && (
                        <span className="text-gray-500 ml-2">({conductor.rfc})</span>
                      )}
                    </div>
                    {conductor.num_licencia && (
                      <div className="text-xs text-gray-500">
                        Licencia: {conductor.num_licencia}
                      </div>
                    )}
                  </div>
                  <Badge variant={conductor.estado === 'disponible' ? 'default' : 'secondary'}>
                    {conductor.estado}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedConductorId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-800">
              ✓ Conductor seleccionado: {figura.nombre_figura}
            </div>
          </div>
        )}

        <ConductorFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />
      </CardContent>
    </Card>
  );
}
