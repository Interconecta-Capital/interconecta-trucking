
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Building, TrendingUp, AlertCircle } from 'lucide-react';
import { useStableSocios } from '@/hooks/useStableSocios';
import { SociosTable } from '@/components/socios/SociosTable';
import { SociosFilters } from '@/components/socios/SociosFilters';
import { SocioFormDialog } from '@/components/socios/SocioFormDialog';
import { SocioViewDialog } from '@/components/socios/SocioViewDialog';
import { UnifiedPageNavigation } from '@/components/common/UnifiedPageNavigation';

export default function StableSocios() {
  const {
    socios,
    filteredSocios,
    isLoading,
    searchTerm,
    setSearchTerm,
    tipoFilter,
    setTipoFilter,
    estadoFilter,
    setEstadoFilter,
    refreshSocios
  } = useStableSocios();

  const [showForm, setShowForm] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const sociosActivos = socios.filter(s => s.estado === 'activo').length;
  const sociosClientes = socios.filter(s => s.tipo_socio === 'cliente').length;
  const sociosProveedores = socios.filter(s => s.tipo_socio === 'proveedor').length;

  const handleViewSocio = (socio: any) => {
    setSelectedSocio(socio);
    setShowViewDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <UnifiedPageNavigation 
          title="Socios Comerciales" 
          description="Administra clientes, proveedores y socios de negocio"
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando socios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UnifiedPageNavigation 
        title="Socios Comerciales" 
        description="Administra clientes, proveedores y socios de negocio"
      >
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Socio
        </Button>
      </UnifiedPageNavigation>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Socios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socios.length}</div>
            <div className="text-xs text-gray-600">Registrados</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sociosActivos}</div>
            <div className="text-xs text-gray-600">En operación</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{sociosClientes}</div>
            <div className="text-xs text-gray-600">Empresas cliente</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{sociosProveedores}</div>
            <div className="text-xs text-gray-600">Empresas proveedor</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y tabla */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Red de Socios</CardTitle>
            <Badge variant="secondary">{filteredSocios.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SociosFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              tipoFilter={tipoFilter}
              onTipoChange={setTipoFilter}
              estadoFilter={estadoFilter}
              onEstadoChange={setEstadoFilter}
            />
            
            <SociosTable
              socios={filteredSocios}
              onViewSocio={handleViewSocio}
              onRefresh={refreshSocios}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <SocioFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={refreshSocios}
      />

      <SocioViewDialog
        socio={selectedSocio}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />
    </div>
  );
}
