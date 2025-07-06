
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Truck, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { useRemolques } from '@/hooks/useRemolques';
import { RemolquesTable } from '@/components/remolques/RemolquesTable';
import { RemolqueFormDialog } from '@/components/remolques/RemolqueFormDialog';
import { VinculacionDialog } from '@/components/remolques/VinculacionDialog';
import { UnifiedPageNavigation } from '@/components/common/UnifiedPageNavigation';

export default function RemolquesOptimized() {
  const { remolques, loading } = useRemolques();
  const [showForm, setShowForm] = useState(false);
  const [showVinculacion, setShowVinculacion] = useState(false);
  const [selectedRemolque, setSelectedRemolque] = useState(null);

  const refreshRemolques = () => {
    // Función de refresh - en este caso podríamos hacer refetch
    window.location.reload();
  };

  const remolquesActivos = remolques.filter(r => r.estado === 'activo').length;
  const remolquesVinculados = remolques.filter(r => r.autotransporte_id).length;
  const remolquesMantenimiento = remolques.filter(r => r.estado === 'mantenimiento').length;

  const handleVincular = (remolque: any) => {
    setSelectedRemolque(remolque);
    setShowVinculacion(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <UnifiedPageNavigation 
          title="Remolques" 
          description="Administra remolques, semirremolques y equipos auxiliares"
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando remolques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UnifiedPageNavigation 
        title="Remolques" 
        description="Administra remolques, semirremolques y equipos auxiliares"
      >
        <div className="flex gap-2">
          <Button onClick={() => setShowVinculacion(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Vinculaciones
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Remolque
          </Button>
        </div>
      </UnifiedPageNavigation>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Remolques</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remolques.length}</div>
            <div className="text-xs text-gray-600">En inventario</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{remolquesActivos}</div>
            <div className="text-xs text-gray-600">Operativos</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vinculados</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{remolquesVinculados}</div>
            <div className="text-xs text-gray-600">Asignados a vehículos</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{remolquesMantenimiento}</div>
            <div className="text-xs text-gray-600">En servicio</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de remolques */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Inventario de Remolques</CardTitle>
            <Badge variant="secondary">{remolques.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <RemolquesTable
            remolques={remolques}
            onVincular={handleVincular}
            onRefresh={refreshRemolques}
          />
        </CardContent>
      </Card>

      {/* Diálogos */}
      <RemolqueFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={refreshRemolques}
      />

      <VinculacionDialog
        open={showVinculacion}
        onOpenChange={setShowVinculacion}
        remolque={selectedRemolque}
        onSuccess={refreshRemolques}
      />
    </div>
  );
}
