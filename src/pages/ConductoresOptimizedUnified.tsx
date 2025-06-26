import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Search, Filter, AlertTriangle, UserCheck, RefreshCw } from 'lucide-react';
import { ConductoresTable } from '@/components/conductores/ConductoresTable';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';
import { ConductorViewDialog } from '@/components/conductores/ConductorViewDialog';
import { ProtectedActionsUnified } from '@/components/ProtectedActionsUnified';
import { UnifiedPlanNotifications } from '@/components/common/UnifiedPlanNotifications';
import { UnifiedUsageIndicator } from '@/components/common/UnifiedUsageIndicator';
import { useConductoresOptimized } from '@/hooks/useConductoresOptimized';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import { Conductor } from '@/types/cartaPorte';
import { toast } from 'sonner';
import { useFAB } from '@/contexts/FABContext';

export default function ConductoresOptimizedUnified() {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
  const [filters, setFilters] = useState({
    estado: 'all',
    searchTerm: '',
    tipoLicencia: 'all'
  });
  const { setFABConfig } = useFAB();

  const { 
    conductores, 
    loading, 
    error,
    fetchConductores, 
    deleteConductor,
    isAuthenticated 
  } = useConductoresOptimized();

  const permissions = useUnifiedPermissions();

  // Show loading state while auth is initializing
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredConductores = conductores.filter(conductor => {
    const matchesEstado = filters.estado === 'all' || conductor.estado === filters.estado;
    const matchesSearch = !filters.searchTerm || 
      conductor.nombre.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (conductor.rfc && conductor.rfc.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (conductor.num_licencia && conductor.num_licencia.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    const matchesTipoLicencia = filters.tipoLicencia === 'all' || conductor.tipo_licencia === filters.tipoLicencia;
    
    return matchesEstado && matchesSearch && matchesTipoLicencia;
  });

  // Estadísticas optimizadas
  const totalConductores = conductores.length;
  const conductoresActivos = conductores.filter(c => c.estado === 'disponible').length;
  const licenciasProximasVencer = conductores.filter(c => {
    if (!c.vigencia_licencia) return false;
    const today = new Date();
    const expiryDate = new Date(c.vigencia_licencia);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }).length;

  const handleNewConductor = () => {
    setSelectedConductor(null);
    setShowFormDialog(true);
  };

  useEffect(() => {
    setFABConfig({
      icon: <Users className="fab-icon" />,
      text: 'Nuevo',
      onClick: handleNewConductor,
      isVisible: true
    })
    return () => setFABConfig({ isVisible: false })
  }, [])

  const handleSuccess = () => {
    fetchConductores();
    setShowFormDialog(false);
    setSelectedConductor(null);
  };

  const handleEdit = (conductor: Conductor) => {
    setSelectedConductor(conductor);
    setShowFormDialog(true);
  };

  const handleDelete = async (conductor: Conductor) => {
    if (window.confirm(`¿Estás seguro de eliminar al conductor ${conductor.nombre}?`)) {
      try {
        await deleteConductor(conductor.id);
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  const handleView = (conductor: Conductor) => {
    setSelectedConductor(conductor);
    setShowViewDialog(true);
  };

  const clearFilters = () => {
    setFilters({
      estado: 'all',
      searchTerm: '',
      tipoLicencia: 'all'
    });
  };

  const handleRefresh = () => {
    fetchConductores();
    toast.success('Lista actualizada');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Notificaciones unificadas del plan */}
        <UnifiedPlanNotifications />

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Conductores</h1>
              <p className="text-gray-600">
                Gestión optimizada de conductores • {permissions.accessReason}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <div className="desktop-new-button">
              <ProtectedActionsUnified
                action="create"
                resource="conductores"
                onAction={handleNewConductor}
                buttonText="Nuevo Conductor"
                variant="default"
              />
            </div>
          </div>
        </div>

        {/* Indicador de uso unificado */}
        <UnifiedUsageIndicator resourceType="conductores" />

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>Error: {error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="ml-auto"
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conductores</p>
                  <p className="text-2xl font-bold text-gray-900">{totalConductores}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{conductoresActivos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Licencias por Vencer</p>
                  <p className="text-2xl font-bold text-gray-900">{licenciasProximasVencer}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nombre, RFC o licencia..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={filters.estado} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="en_viaje">En Viaje</SelectItem>
                    <SelectItem value="descanso">Descanso</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipoLicencia">Tipo de Licencia</Label>
                <Select 
                  value={filters.tipoLicencia} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, tipoLicencia: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="A">Tipo A</SelectItem>
                    <SelectItem value="B">Tipo B</SelectItem>
                    <SelectItem value="C">Tipo C</SelectItem>
                    <SelectItem value="D">Tipo D</SelectItem>
                    <SelectItem value="E">Tipo E</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2 text-gray-600">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Cargando conductores...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de Conductores */}
        {!loading && (
          <ConductoresTable
            conductores={filteredConductores}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}

        {/* Diálogos */}
        <ConductorFormDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
          conductor={selectedConductor}
          onSuccess={handleSuccess}
        />

        <ConductorViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          conductor={selectedConductor}
          onEdit={(conductor) => {
            setShowViewDialog(false);
            handleEdit(conductor);
          }}
        />
      </div>
    </div>
  );
}
