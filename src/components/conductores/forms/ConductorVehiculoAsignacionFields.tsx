
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useRemolques } from '@/hooks/useRemolques';
import { useStableAuth } from '@/hooks/useStableAuth';
import { Car, Truck, AlertCircle } from 'lucide-react';

interface ConductorVehiculoAsignacionFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function ConductorVehiculoAsignacionFields({ formData, onFieldChange }: ConductorVehiculoAsignacionFieldsProps) {
  const { user } = useStableAuth();
  const { vehiculos, loading: vehiculosLoading } = useStableVehiculos(user?.id);
  const { remolques, loading: remolquesLoading } = useRemolques();

  const vehiculosDisponibles = vehiculos.filter(v => v.estado === 'disponible' || v.id === formData.vehiculo_asignado_id);
  const vehiculoSeleccionado = vehiculos.find(v => v.id === formData.vehiculo_asignado_id);
  
  // Find trailer assigned to selected vehicle (check for compatible assignment)
  const remolqueDelVehiculo = vehiculoSeleccionado?.id 
    ? remolques.find(r => r.autotransporte_id === vehiculoSeleccionado.id)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Asignación de Vehículo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehiculo_asignado_id">Vehículo Asignado</Label>
          <Select 
            value={formData.vehiculo_asignado_id || ''} 
            onValueChange={(value) => onFieldChange('vehiculo_asignado_id', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar vehículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin_asignar">Sin asignar</SelectItem>
              {vehiculosLoading ? (
                <SelectItem value="loading" disabled>Cargando vehículos...</SelectItem>
              ) : (
                vehiculosDisponibles.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id}>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>{vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}</span>
                      {vehiculo.estado !== 'disponible' && (
                        <span className="text-orange-600 text-xs">({vehiculo.estado})</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          {vehiculosDisponibles.length === 0 && !vehiculosLoading && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>No hay vehículos disponibles</span>
            </div>
          )}
        </div>

        {vehiculoSeleccionado && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-3">
            <h4 className="font-medium text-blue-900">Información del Vehículo Asignado</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Placa:</span>
                <p className="text-blue-900">{vehiculoSeleccionado.placa}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Marca/Modelo:</span>
                <p className="text-blue-900">{vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Año:</span>
                <p className="text-blue-900">{vehiculoSeleccionado.anio || 'No especificado'}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Estado:</span>
                <p className="text-blue-900 capitalize">{vehiculoSeleccionado.estado}</p>
              </div>
            </div>

            {remolqueDelVehiculo && (
              <div className="mt-3 p-3 bg-white rounded border">
                <h5 className="font-medium text-blue-900 flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4" />
                  Remolque Asignado al Vehículo
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Placa:</span>
                    <p className="text-blue-900">{remolqueDelVehiculo.placa}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Tipo:</span>
                    <p className="text-blue-900">{remolqueDelVehiculo.subtipo_rem || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            )}

            {!remolqueDelVehiculo && (
              <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-800 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Este vehículo no tiene remolque asignado</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>• Los conductores pueden compartir vehículos</p>
          <p>• La asignación de remolque se gestiona desde el vehículo</p>
          <p>• En viajes se puede decidir si usar el remolque asignado</p>
        </div>
      </CardContent>
    </Card>
  );
}
