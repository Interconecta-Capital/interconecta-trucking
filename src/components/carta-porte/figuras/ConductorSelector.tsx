
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';
import { useConductores } from '@/hooks/useConductores';
import { FiguraCompleta } from '@/types/cartaPorte';

interface ConductorSelectorProps {
  figura: FiguraCompleta;
  onUpdate: (figura: FiguraCompleta) => void;
}

export function ConductorSelector({ figura, onUpdate }: ConductorSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const { conductores, loading } = useConductores();

  const filteredConductores = conductores.filter(conductor => 
    conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.num_licencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConductorSelect = (conductorId: string) => {
    const conductor = conductores.find(c => c.id === conductorId);
    if (conductor) {
      onUpdate({
        ...figura,
        rfc_figura: conductor.rfc || '',
        nombre_figura: conductor.nombre || '',
        num_licencia: conductor.num_licencia || '',
        curp: conductor.curp || '',
        residencia_fiscal_figura: conductor.residencia_fiscal || 'MEX',
        domicilio: conductor.direccion || {}
      });
      setShowSelector(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Seleccionar Conductor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Buscar Conductor Registrado
        </Button>

        {showSelector && (
          <div className="space-y-4 border-t pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, RFC o licencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                    className="p-3 border rounded-lg cursor-pointer transition-colors hover:border-gray-300"
                    onClick={() => handleConductorSelect(conductor.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">
                          {conductor.nombre}
                          {conductor.rfc && (
                            <span className="text-gray-500 ml-2">
                              RFC: {conductor.rfc}
                            </span>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
