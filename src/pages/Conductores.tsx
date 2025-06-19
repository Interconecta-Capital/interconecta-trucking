
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { ConductoresTable } from '@/components/conductores/ConductoresTable';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';
import { ConductoresFilters } from '@/components/conductores/ConductoresFilters';
import { useConductores } from '@/hooks/useConductores';

export default function Conductores() {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [filters, setFilters] = useState({
    estado: '',
    searchTerm: ''
  });

  const { conductores, loading, fetchConductores } = useConductores();

  const filteredConductores = conductores.filter(conductor => {
    const matchesEstado = !filters.estado || conductor.estado === filters.estado;
    const matchesSearch = !filters.searchTerm || 
      conductor.nombre.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (conductor.rfc && conductor.rfc.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    return matchesEstado && matchesSearch;
  });

  const handleSuccess = () => {
    fetchConductores();
    setShowFormDialog(false);
  };

  const handleEdit = (conductor: any) => {
    console.log('Edit conductor:', conductor);
  };

  const handleDelete = (conductor: any) => {
    console.log('Delete conductor:', conductor);
  };

  const handleView = (conductor: any) => {
    console.log('View conductor:', conductor);
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
              <p className="text-gray-600">Gestión de conductores del sistema</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowFormDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Conductor
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <ConductoresFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>

        {/* Conductores Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Conductores ({filteredConductores.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConductoresTable
              conductores={filteredConductores}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <ConductorFormDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
