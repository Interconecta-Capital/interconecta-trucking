
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Truck, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { VehiculosTable } from '@/components/vehiculos/VehiculosTable';
import { VehiculosFilters } from '@/components/vehiculos/VehiculosFilters';
import { VehiculoFormDialog } from '@/components/vehiculos/VehiculoFormDialog';
import { VehiculoViewDialog } from '@/components/vehiculos/VehiculoViewDialog';
import { UnifiedPageNavigation } from '@/components/common/UnifiedPageNavigation';

export default function StableVehiculos() {
  const {
    vehiculos,
    filteredVehiculos,
    isLoading,
    searchTerm,
    setSearchTerm,
    tipoFilter,
    setTipoFilter,
    estadoFilter,
    setEstadoFilter,
    refreshVehiculos
  } = useStableVehiculos();

  const [showForm, setShowForm] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const vehiculosActivos = vehiculos.filter(v => v.estado === 'activo').length;
  const vehiculosMantenimiento = vehiculos.filter(v => v.estado === 'mantenimiento').length;
  const vehiculosInactivos = vehiculos.filter(v => v.estado === 'inactivo').length;

  const handleViewVehiculo = (vehiculo: any) => {
    setSelectedVehiculo(vehiculo);
    setShowViewDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <UnifiedPageNavigation 
          title="Vehículos" 
          description="Administra tu flota de vehículos y equipos"
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando vehículos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UnifiedPageNavigation 
        title="Vehículos" 
        description="Administra tu flota de vehículos y equipos"
      >
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Vehículo
        </Button>
      </UnifiedPageNavigation>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehiculos.length}</div>
            <div className="text-xs text-gray-600">En flota</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{vehiculosActivos}</div>
            <div className="text-xs text-gray-600">Operando</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{vehiculosMantenimiento}</div>
            <div className="text-xs text-gray-600">En servicio</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{vehiculosInactivos}</div>
            <div className="text-xs text-gray-600">Fuera de servicio</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y tabla */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Flota de Vehículos</CardTitle>
            <Badge variant="secondary">{filteredVehiculos.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <VehiculosFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              tipoFilter={tipoFilter}
              onTipoChange={setTipoFilter}
              estadoFilter={estadoFilter}
              onEstadoChange={setEstadoFilter}
            />
            
            <VehiculosTable
              vehiculos={filteredVehiculos}
              onViewVehiculo={handleViewVehiculo}
              onRefresh={refreshVehiculos}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <VehiculoFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={refreshVehiculos}
      />

      <VehiculoViewDialog
        vehiculo={selectedVehiculo}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />
    </div>
  );
}
