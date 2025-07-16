import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, User, Package, AlertTriangle, CheckCircle, Link2, Settings, Clock } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useRemolques } from '@/hooks/useRemolques';
import { useDisponibilidad } from '@/hooks/useDisponibilidad';
import { ValidadorDisponibilidad } from '../ValidadorDisponibilidad';
import { ConflictoDisponibilidad } from '@/types/viaje';
import { toast } from 'sonner';

interface ViajeWizardActivosProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

interface VehiculoRemolque {
  vehiculo_id: string;
  tipo_carroceria: string;
  capacidad_carga: number;
  remolques?: {
    id: string;
    tipo: string;
    capacidad: number;
  }[];
}

export function ViajeWizardActivos({ data, updateData }: ViajeWizardActivosProps) {
  const { vehiculos, loading: loadingVehiculos } = useVehiculos();
  const { conductores, loading: loadingConductores } = useConductores();
  const { remolques, loading: loadingRemolques } = useRemolques();
  
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(data.vehiculo);
  const [selectedConductor, setSelectedConductor] = useState<any>(data.conductor);
  const [selectedRemolque, setSelectedRemolque] = useState<any>(data.remolque);
  const [vehiculoRemolques, setVehiculoRemolques] = useState<VehiculoRemolque[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [capacidadRequerida, setCapacidadRequerida] = useState(0);
  const [conflictosDisponibilidad, setConflictosDisponibilidad] = useState<ConflictoDisponibilidad[]>([]);
  const [recursosDisponibles, setRecursosDisponibles] = useState(true);
  const [showDisponibilidad, setShowDisponibilidad] = useState(false);

  // Calcular capacidad requerida basada en mercancías
  useEffect(() => {
    // Esta información vendría del contexto de mercancías
    // Por ahora usamos un valor estimado
    setCapacidadRequerida(5000); // kg estimados
  }, [data]);

  // Validar compatibilidad vehículo-conductor
  useEffect(() => {
    validateAssignments();
  }, [selectedVehiculo, selectedConductor, selectedRemolque, capacidadRequerida]);

  // Mostrar validador de disponibilidad cuando tengamos fechas y recursos
  useEffect(() => {
    const tieneRecursos = selectedVehiculo || selectedConductor || selectedRemolque;
    const tieneFechas = Boolean(data.fechaInicio && data.fechaFin);
    setShowDisponibilidad(Boolean(tieneRecursos && tieneFechas));
  }, [selectedVehiculo, selectedConductor, selectedRemolque, data.fechaInicio, data.fechaFin]);

  const validateAssignments = () => {
    const errors: string[] = [];

    if (selectedVehiculo) {
      // Validar capacidad
      if (selectedVehiculo.capacidad_carga < capacidadRequerida) {
        errors.push(`Vehículo insuficiente: ${selectedVehiculo.capacidad_carga}kg disponible, ${capacidadRequerida}kg requerido`);
      }

      // Validar documentación del vehículo
      if (!selectedVehiculo.vigencia_tarjeta_circulacion || new Date(selectedVehiculo.vigencia_tarjeta_circulacion) < new Date()) {
        errors.push('Tarjeta de circulación vencida o inexistente');
      }

      if (!selectedVehiculo.vigencia_seguro || new Date(selectedVehiculo.vigencia_seguro) < new Date()) {
        errors.push('Seguro vehicular vencido o inexistente');
      }
    }

    if (selectedConductor) {
      // Validar licencia del conductor
      if (!selectedConductor.vigencia_licencia || new Date(selectedConductor.vigencia_licencia) < new Date()) {
        errors.push('Licencia de conductor vencida o inexistente');
      }

      // Validar disponibilidad
      if (selectedConductor.estado !== 'disponible') {
        errors.push(`Conductor no disponible: ${selectedConductor.estado}`);
      }

      // Validar tipo de licencia vs tipo de vehículo
      if (selectedVehiculo && selectedConductor.tipo_licencia) {
        const licenciaValida = validateLicenciaVehiculo(selectedConductor.tipo_licencia, selectedVehiculo.tipo_carroceria);
        if (!licenciaValida) {
          errors.push('Tipo de licencia no compatible con el vehículo');
        }
      }
    }

    setValidationErrors(errors);
  };

  const validateLicenciaVehiculo = (tipoLicencia: string, tipoCarroceria: string): boolean => {
    const compatibilidad: { [key: string]: string[] } = {
      'A': ['Pickup', 'Van'],
      'B': ['Pickup', 'Van', 'Camión Unitario'],
      'C': ['Camión Unitario', 'Tractocamión'],
      'E': ['Tractocamión', 'Articulado']
    };

    return compatibilidad[tipoLicencia]?.includes(tipoCarroceria) || false;
  };

  const handleVehiculoSelect = (vehiculoId: string) => {
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    if (vehiculo) {
      setSelectedVehiculo(vehiculo);
      updateData({ vehiculo });
      
      // Cargar remolques asociados
      loadVehiculoRemolques(vehiculoId);
    }
  };

  const handleConductorSelect = (conductorId: string) => {
    const conductor = conductores.find(c => c.id === conductorId);
    if (conductor) {
      setSelectedConductor(conductor);
      updateData({ conductor });
    }
  };

  const handleRemolqueSelect = (remolqueId: string) => {
    const remolque = remolques.find(r => r.id === remolqueId);
    if (remolque) {
      setSelectedRemolque(remolque);
      updateData({ remolque });
    }
  };

  // Callback para recibir resultados de validación de disponibilidad
  const handleValidacionDisponibilidad = (disponible: boolean, conflictos: ConflictoDisponibilidad[]) => {
    setRecursosDisponibles(disponible);
    setConflictosDisponibilidad(conflictos);
    
    if (!disponible) {
      // Marcar visualmente los recursos con conflictos
      const mensajeConflictos = conflictos.map(c => c.mensaje || c.descripcion).join(', ');
      console.log('⚠️ Conflictos de disponibilidad:', mensajeConflictos);
    }
  };

  const loadVehiculoRemolques = async (vehiculoId: string) => {
    try {
      // Usar remolques reales de la base de datos
      if (remolques.length > 0) {
        const mockRemolques: VehiculoRemolque[] = [
          {
            vehiculo_id: vehiculoId,
            tipo_carroceria: selectedVehiculo?.tipo_carroceria || 'Tractocamión',
            capacidad_carga: selectedVehiculo?.capacidad_carga || 15000,
            remolques: remolques.map(r => ({
              id: r.id,
              tipo: r.tipo_remolque || r.subtipo_rem || 'Caja Seca',
              capacidad: 20000 // Capacidad por defecto
            }))
          }
        ];
        setVehiculoRemolques(mockRemolques);
      }
    } catch (error) {
      console.error('Error loading remolques:', error);
    }
  };

  const getCapacidadTotal = () => {
    if (!selectedVehiculo) return 0;
    
    let capacidadTotal = selectedVehiculo.capacidad_carga || 0;
    
    // Agregar capacidad de remolques si los hay
    const remolquesVehiculo = vehiculoRemolques.find(vr => vr.vehiculo_id === selectedVehiculo.id);
    if (remolquesVehiculo?.remolques) {
      capacidadTotal += remolquesVehiculo.remolques.reduce((sum, r) => sum + r.capacidad, 0);
    }
    
    return capacidadTotal;
  };

  const renderVehiculoCard = (vehiculo: any) => {
    const isSelected = selectedVehiculo?.id === vehiculo.id;
    const capacidadSuficiente = (vehiculo.capacidad_carga || 0) >= capacidadRequerida;
    const estaDisponible = vehiculo.estado === 'disponible';
    const tieneConflictos = isSelected && !recursosDisponibles && conflictosDisponibilidad.some(c => 
      c.mensaje?.includes('vehículo') || c.descripcion?.includes('vehículo')
    );
    
    return (
      <Card 
        key={vehiculo.id}
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
        } ${!capacidadSuficiente ? 'border-red-200' : ''} ${
          tieneConflictos ? 'border-warning/50 bg-warning/5' : ''
        } ${!estaDisponible ? 'opacity-50' : ''}`}
        onClick={() => estaDisponible ? handleVehiculoSelect(vehiculo.id) : null}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <span className="font-medium">{vehiculo.marca} {vehiculo.modelo}</span>
            </div>
            {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
          </div>
          
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Placas:</span> {vehiculo.placa}</p>
            <p><span className="font-medium">Tipo:</span> {vehiculo.tipo_carroceria}</p>
            <p><span className="font-medium">Capacidad:</span> {vehiculo.capacidad_carga?.toLocaleString()} kg</p>
            
            {!capacidadSuficiente && (
              <Badge variant="destructive" className="text-xs">
                Capacidad insuficiente
              </Badge>
            )}
            
            {vehiculo.estado !== 'disponible' && (
              <Badge variant="destructive" className="text-xs">
                {vehiculo.estado}
              </Badge>
            )}
            
            {isSelected && tieneConflictos && (
              <Badge variant="outline" className="text-xs border-warning text-warning">
                <Clock className="w-3 h-3 mr-1" />
                Conflicto de fechas
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConductorCard = (conductor: any) => {
    const isSelected = selectedConductor?.id === conductor.id;
    const licenciaVigente = conductor.vigencia_licencia && new Date(conductor.vigencia_licencia) > new Date();
    const estaDisponible = conductor.estado === 'disponible';
    const tieneConflictos = isSelected && !recursosDisponibles && conflictosDisponibilidad.some(c => 
      c.mensaje?.includes('conductor') || c.descripcion?.includes('conductor')
    );
    
    return (
      <Card 
        key={conductor.id}
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
        } ${!licenciaVigente ? 'border-red-200' : ''} ${
          tieneConflictos ? 'border-warning/50 bg-warning/5' : ''
        } ${!estaDisponible ? 'opacity-50' : ''}`}
        onClick={() => estaDisponible ? handleConductorSelect(conductor.id) : null}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{conductor.nombre}</span>
            </div>
            {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
          </div>
          
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Licencia:</span> {conductor.tipo_licencia}</p>
            <p><span className="font-medium">Vigencia:</span> {
              conductor.vigencia_licencia 
                ? new Date(conductor.vigencia_licencia).toLocaleDateString()
                : 'No especificada'
            }</p>
            
            {!licenciaVigente && (
              <Badge variant="destructive" className="text-xs">
                Licencia vencida
              </Badge>
            )}
            
            {conductor.estado !== 'disponible' && (
              <Badge variant="destructive" className="text-xs">
                {conductor.estado}
              </Badge>
            )}
            
            {isSelected && tieneConflictos && (
              <Badge variant="outline" className="text-xs border-warning text-warning">
                <Clock className="w-3 h-3 mr-1" />
                Conflicto de fechas
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumen de requerimientos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Package className="h-5 w-5" />
            Requerimientos del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Capacidad requerida:</span>
              <p className="text-lg font-bold text-blue-700">{capacidadRequerida.toLocaleString()} kg</p>
            </div>
            <div>
              <span className="font-medium">Tipo de carga:</span>
              <p>General (no peligrosa)</p>
            </div>
            <div>
              <span className="font-medium">Distancia estimada:</span>
              <p>{data.distanciaRecorrida || 'Por calcular'} km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selección de vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Seleccionar Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingVehiculos ? (
            <div className="text-center py-4">Cargando vehículos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehiculos.filter(v => v.activo).map(renderVehiculoCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuración de remolques */}
      {selectedVehiculo && vehiculoRemolques.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Configuración de Remolques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Vehículo Principal</p>
                  <p className="text-sm text-gray-600">
                    {selectedVehiculo.marca} {selectedVehiculo.modelo} - {selectedVehiculo.capacidad_carga?.toLocaleString()} kg
                  </p>
                </div>
                <Badge variant="outline">{selectedVehiculo.tipo_carroceria}</Badge>
              </div>
              
              {vehiculoRemolques[0]?.remolques?.map((remolque, index) => (
                <div key={remolque.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Remolque {index + 1}</p>
                    <p className="text-sm text-gray-600">
                      {remolque.tipo} - {remolque.capacidad.toLocaleString()} kg
                    </p>
                  </div>
                  <Badge variant="secondary">{remolque.tipo}</Badge>
                </div>
              ))}
              
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="font-medium text-green-800">
                  Capacidad Total: {getCapacidadTotal().toLocaleString()} kg
                </p>
                <p className="text-sm text-green-600">
                  Requerido: {capacidadRequerida.toLocaleString()} kg 
                  ({getCapacidadTotal() >= capacidadRequerida ? '✓ Suficiente' : '✗ Insuficiente'})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selección de conductor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seleccionar Conductor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingConductores ? (
            <div className="text-center py-4">Cargando conductores...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conductores.filter(c => c.activo).map(renderConductorCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selección de remolque (opcional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Seleccionar Remolque (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRemolques ? (
            <div className="text-center py-4">Cargando remolques...</div>
          ) : (
            <div className="space-y-3">
              <Select
                value={selectedRemolque?.id || ""}
                onValueChange={(value) => {
                  if (value === "sin_remolque") {
                    setSelectedRemolque(null);
                    updateData({ remolque: null });
                  } else {
                    handleRemolqueSelect(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar remolque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_remolque">Sin remolque</SelectItem>
                  {remolques.filter(r => r.activo !== false).map((remolque) => (
                    <SelectItem key={remolque.id} value={remolque.id}>
                      {remolque.placa} - {remolque.tipo_remolque || remolque.subtipo_rem || 'Tipo no especificado'}
                      {remolque.estado !== 'disponible' && ` (${remolque.estado})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedRemolque && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Remolque seleccionado</p>
                      <p className="text-sm text-gray-600">
                        {selectedRemolque.placa} - {selectedRemolque.tipo_remolque || selectedRemolque.subtipo_rem}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {selectedRemolque.estado || 'disponible'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validador de Disponibilidad */}
      {showDisponibilidad && (
        <ValidadorDisponibilidad
          conductorId={selectedConductor?.id}
          vehiculoId={selectedVehiculo?.id}
          remolqueId={selectedRemolque?.id}
          fechaInicio={data.fechaInicio || ''}
          fechaFin={data.fechaFin || ''}
          onValidacionCompleta={handleValidacionDisponibilidad}
        />
      )}

      {/* Validaciones */}
      {(validationErrors.length > 0 || !recursosDisponibles) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Validaciones Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {error}
                </li>
              ))}
              {!recursosDisponibles && conflictosDisponibilidad.map((conflicto, index) => (
                <li key={`disponibilidad-${index}`} className="flex items-start gap-2 text-sm text-red-700">
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {conflicto.mensaje || conflicto.descripcion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Resumen de selección */}
      {selectedVehiculo && selectedConductor && validationErrors.length === 0 && recursosDisponibles && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Activos Asignados Correctamente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Vehículo:</p>
                <p>{selectedVehiculo.marca} {selectedVehiculo.modelo}</p>
                <p>Placas: {selectedVehiculo.placa}</p>
                <p>Capacidad: {getCapacidadTotal().toLocaleString()} kg</p>
              </div>
              <div>
                <p className="font-medium">Conductor:</p>
                <p>{selectedConductor.nombre}</p>
                <p>Licencia: {selectedConductor.tipo_licencia}</p>
                <p>Vigencia: {new Date(selectedConductor.vigencia_licencia).toLocaleDateString()}</p>
              </div>
              {selectedRemolque && (
                <div>
                  <p className="font-medium">Remolque:</p>
                  <p>Placas: {selectedRemolque.placa}</p>
                  <p>Tipo: {selectedRemolque.tipo_remolque || selectedRemolque.subtipo_rem}</p>
                  <p>Estado: {selectedRemolque.estado || 'disponible'}</p>
                </div>
              )}
            </div>
            {showDisponibilidad && (
              <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
                ✅ Todos los recursos están disponibles para las fechas seleccionadas
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
