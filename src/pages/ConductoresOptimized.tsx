
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { useConductoresOptimized } from '@/hooks/useConductoresOptimized';
import { ConductoresTable } from '@/components/conductores/ConductoresTable';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';
import { ConductorViewDialog } from '@/components/conductores/ConductorViewDialog';
import { UnifiedPageNavigation } from '@/components/common/UnifiedPageNavigation';

export default function ConductoresOptimized() {
  const {
    conductores,
    loading,
    fetchConductores
  } = useConductoresOptimized();

  const [showForm, setShowForm] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Filtrar conductores localmente
  const filteredConductores = conductores.filter(conductor => {
    const matchesSearch = !searchTerm || 
      conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || conductor.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const conductoresActivos = conductores.filter(c => c.estado === 'disponible').length;
  const conductoresSuspendidos = conductores.filter(c => c.estado === 'suspendido').length;
  const promedioCalificacion = conductores.length > 0 
    ? conductores.reduce((sum, c) => sum + 5.0, 0) / conductores.length
    : 5;

  const handleViewConductor = (conductor: any) => {
    setSelectedConductor(conductor);
    setShowViewDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <UnifiedPageNavigation 
          title="Conductores" 
          description="Gestiona tu equipo de conductores y operadores"
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando conductores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UnifiedPageNavigation 
        title="Conductores" 
        description="Gestiona tu equipo de conductores y operadores"
      >
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Conductor
        </Button>
      </UnifiedPageNavigation>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conductores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conductores.length}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Registrados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conductoresActivos}</div>
            <div className="text-xs text-gray-600">Disponibles</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conductoresSuspendidos}</div>
            <div className="text-xs text-gray-600">Inactivos</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promedioCalificacion.toFixed(1)}</div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-3 w-3 ${star <= promedioCalificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y tabla */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Conductores</CardTitle>
            <Badge variant="secondary">{filteredConductores.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Buscar por nombre, RFC o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="ocupado">Ocupado</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
            
            <ConductoresTable
              conductores={filteredConductores}
              onRefresh={fetchConductores}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <ConductorFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={fetchConductores}
      />

      <ConductorViewDialog
        conductor={selectedConductor}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />
    </div>
  );
}
