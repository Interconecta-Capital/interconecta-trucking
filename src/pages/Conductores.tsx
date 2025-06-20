
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Search, Filter, AlertTriangle, UserCheck } from 'lucide-react';
import { ConductoresTable } from '@/components/conductores/ConductoresTable';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';
import { ConductorViewDialog } from '@/components/conductores/ConductorViewDialog';
import { useConductores } from '@/hooks/useConductores';
import { Conductor } from '@/types/cartaPorte';
import { toast } from 'sonner';

export default function Conductores() {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
  const [filters, setFilters] = useState({
    estado: 'all',
    searchTerm: '',
    tipoLicencia: 'all'
  });

  const { conductores, loading, fetchConductores, deleteConductor } = useConductores();

  const filteredConductores = conductores.filter(conductor => {
    const matchesEstado = filters.estado === 'all' || conductor.estado === filters.estado;
    const matchesSearch = !filters.searchTerm || 
      conductor.nombre.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (conductor.rfc && conductor.rfc.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (conductor.num_licencia && conductor.num_licencia.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    const matchesTipoLicencia = filters.tipoLicencia === 'all' || conductor.tipo_licencia === filters.tipoLicencia;
    
    return matchesEstado && matchesSearch && matchesTipoLicencia;
  });

  // Estadísticas
  const totalConductores = conductores.length;
  const conductoresActivos = conductores.filter(c => c.estado === 'disponible').length;
  const licenciasProximasVencer = conductores.filter(c => {
    if (!c.vigencia_licencia) return false;
    const today = new Date();
    const expiryDate = new Date(c.vigencia_licencia);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }).length;

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
        toast.success('Conductor eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar conductor');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Conductores</h1>
              <p className="text-gray-600">Gestión completa de conductores del sistema</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              setSelectedConductor(null);
              setShowFormDialog(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Conductor
          </Button>
        </div>

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

        {/* Tabla de Conductores */}
        <ConductoresTable
          conductores={filteredConductores}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

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
