
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Search, Users } from 'lucide-react';
import { useConductores } from '@/hooks/useConductores';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';

interface FiguraTransporteSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
}

export function FigurasTransporteSection({ data, onChange }: FiguraTransporteSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConductorSelector, setShowConductorSelector] = useState(false);
  
  const { conductores, loading } = useConductores();

  const filteredConductores = conductores.filter(conductor => 
    conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.num_licencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConductorSelect = (conductorId: string) => {
    const conductor = conductores.find(c => c.id === conductorId);
    if (conductor) {
      const nuevaFigura = {
        id: crypto.randomUUID(),
        tipo_figura: 'Operador',
        rfc_figura: conductor.rfc || '',
        nombre_figura: conductor.nombre || '',
        num_licencia: conductor.num_licencia || '',
        tipo_licencia: conductor.tipo_licencia || '',
        vigencia_licencia: conductor.vigencia_licencia || '',
        operador_sct: conductor.operador_sct || false,
        curp: conductor.curp || '',
        residencia_fiscal_figura: conductor.residencia_fiscal || 'MEX',
        domicilio: conductor.direccion || {}
      };
      
      onChange([...data, nuevaFigura]);
      setShowConductorSelector(false);
    }
  };

  const addFigura = () => {
    const nuevaFigura = {
      id: crypto.randomUUID(),
      tipo_figura: 'Operador',
      rfc_figura: '',
      nombre_figura: '',
      num_licencia: '',
      residencia_fiscal_figura: 'MEX',
      domicilio: {
        pais: 'MEX',
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

  const updateFigura = (index: number, field: string, value: any) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    onChange(updatedData);
  };

  const updateDomicilio = (index: number, field: string, value: string) => {
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      domicilio: {
        ...updatedData[index].domicilio,
        [field]: value
      }
    };
    onChange(updatedData);
  };

  const removeFigura = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Configure las figuras del transporte (operadores, propietarios, etc.).
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowConductorSelector(!showConductorSelector)}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Buscar Conductor
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Conductor
          </Button>
          <Button onClick={addFigura} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Agregar Figura Manual
          </Button>
        </div>
      </div>

      {/* Selector de Conductores */}
      {showConductorSelector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Seleccionar Conductor Registrado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      )}

      {data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No hay figuras configuradas</p>
            <p className="text-sm text-gray-400 mt-1">
              Agregue al menos una figura de transporte
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((figura, index) => (
            <Card key={figura.id || index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {figura.tipo_figura || 'Figura'} {index + 1}
                    {figura.nombre_figura && (
                      <span className="text-base font-normal text-gray-600 ml-2">
                        - {figura.nombre_figura}
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFigura(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tipo_figura_${index}`}>Tipo de Figura *</Label>
                    <Select
                      value={figura.tipo_figura || ''}
                      onValueChange={(value) => updateFigura(index, 'tipo_figura', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operador">Operador</SelectItem>
                        <SelectItem value="Propietario">Propietario</SelectItem>
                        <SelectItem value="Arrendador">Arrendador</SelectItem>
                        <SelectItem value="Notificado">Notificado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rfc_figura_${index}`}>RFC *</Label>
                    <Input
                      id={`rfc_figura_${index}`}
                      value={figura.rfc_figura || ''}
                      onChange={(e) => updateFigura(index, 'rfc_figura', e.target.value)}
                      placeholder="RFC de la figura"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`nombre_figura_${index}`}>Nombre Completo *</Label>
                    <Input
                      id={`nombre_figura_${index}`}
                      value={figura.nombre_figura || ''}
                      onChange={(e) => updateFigura(index, 'nombre_figura', e.target.value)}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`curp_${index}`}>CURP</Label>
                    <Input
                      id={`curp_${index}`}
                      value={figura.curp || ''}
                      onChange={(e) => updateFigura(index, 'curp', e.target.value)}
                      placeholder="CURP"
                    />
                  </div>
                </div>

                {figura.tipo_figura === 'Operador' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`num_licencia_${index}`}>Número de Licencia</Label>
                      <Input
                        id={`num_licencia_${index}`}
                        value={figura.num_licencia || ''}
                        onChange={(e) => updateFigura(index, 'num_licencia', e.target.value)}
                        placeholder="Número de licencia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tipo_licencia_${index}`}>Tipo de Licencia</Label>
                      <Select
                        value={figura.tipo_licencia || ''}
                        onValueChange={(value) => updateFigura(index, 'tipo_licencia', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - Motocicletas</SelectItem>
                          <SelectItem value="B">B - Automóviles</SelectItem>
                          <SelectItem value="C">C - Camiones</SelectItem>
                          <SelectItem value="D">D - Autobuses</SelectItem>
                          <SelectItem value="E">E - Tractocamiones</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`vigencia_licencia_${index}`}>Vigencia de Licencia</Label>
                      <Input
                        id={`vigencia_licencia_${index}`}
                        type="date"
                        value={figura.vigencia_licencia || ''}
                        onChange={(e) => updateFigura(index, 'vigencia_licencia', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`operador_sct_${index}`}
                    checked={!!figura.operador_sct}
                    onCheckedChange={(checked) => updateFigura(index, 'operador_sct', checked)}
                  />
                  <Label htmlFor={`operador_sct_${index}`}>
                    Operador SCT
                  </Label>
                </div>

                {/* Domicilio */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Domicilio</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`codigo_postal_${index}`}>Código Postal</Label>
                      <Input
                        id={`codigo_postal_${index}`}
                        value={figura.domicilio?.codigo_postal || ''}
                        onChange={(e) => updateDomicilio(index, 'codigo_postal', e.target.value)}
                        placeholder="Código postal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`estado_${index}`}>Estado</Label>
                      <Input
                        id={`estado_${index}`}
                        value={figura.domicilio?.estado || ''}
                        onChange={(e) => updateDomicilio(index, 'estado', e.target.value)}
                        placeholder="Estado"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`municipio_${index}`}>Municipio</Label>
                      <Input
                        id={`municipio_${index}`}
                        value={figura.domicilio?.municipio || ''}
                        onChange={(e) => updateDomicilio(index, 'municipio', e.target.value)}
                        placeholder="Municipio"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`colonia_${index}`}>Colonia</Label>
                      <Input
                        id={`colonia_${index}`}
                        value={figura.domicilio?.colonia || ''}
                        onChange={(e) => updateDomicilio(index, 'colonia', e.target.value)}
                        placeholder="Colonia"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`calle_${index}`}>Calle</Label>
                      <Input
                        id={`calle_${index}`}
                        value={figura.domicilio?.calle || ''}
                        onChange={(e) => updateDomicilio(index, 'calle', e.target.value)}
                        placeholder="Calle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`numero_exterior_${index}`}>Número Exterior</Label>
                      <Input
                        id={`numero_exterior_${index}`}
                        value={figura.domicilio?.numero_exterior || ''}
                        onChange={(e) => updateDomicilio(index, 'numero_exterior', e.target.value)}
                        placeholder="Número exterior"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`numero_interior_${index}`}>Número Interior</Label>
                      <Input
                        id={`numero_interior_${index}`}
                        value={figura.domicilio?.numero_interior || ''}
                        onChange={(e) => updateDomicilio(index, 'numero_interior', e.target.value)}
                        placeholder="Número interior"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConductorFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
