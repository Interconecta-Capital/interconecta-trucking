
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, UserPlus, Filter } from 'lucide-react';
import { useConductores } from '@/hooks/useConductores';
import { ConductoresTable } from '@/components/conductores/ConductoresTable';
import { ConductorModal } from '@/components/conductores/ConductorModal';
import { ConductorDeleteDialog } from '@/components/conductores/ConductorDeleteDialog';
import { ConductorViewModal } from '@/components/conductores/ConductorViewModal';
import { ProtectedActions } from '@/components/ProtectedActions';
import { PermissionsDebug } from '@/components/debug/PermissionsDebug';
import { toast } from 'sonner';
import type { Conductor } from '@/types/cartaPorte';

export default function ConductoresOptimized() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
  
  const { 
    conductores = [], 
    isLoading, 
    createConductor, 
    updateConductor, 
    deleteConductor,
    isCreating,
    isUpdating,
    isDeleting
  } = useConductores();

  const filteredConductores = conductores.filter((conductor) =>
    conductor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.telefono?.includes(searchTerm) ||
    conductor.num_licencia?.includes(searchTerm)
  );

  const handleCreate = () => {
    setSelectedConductor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (conductor: Conductor) => {
    setSelectedConductor(conductor);
    setIsModalOpen(true);
  };

  const handleView = (conductor: Conductor) => {
    setSelectedConductor(conductor);
    setIsViewModalOpen(true);
  };

  const handleDelete = (conductor: Conductor) => {
    setSelectedConductor(conductor);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (data: Partial<Conductor>) => {
    try {
      if (selectedConductor) {
        await updateConductor({ ...selectedConductor, ...data });
        toast.success('Conductor actualizado exitosamente');
      } else {
        await createConductor(data as Omit<Conductor, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Conductor creado exitosamente');
      }
      setIsModalOpen(false);
      setSelectedConductor(null);
    } catch (error) {
      toast.error('Error al guardar el conductor');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedConductor) return;
    
    try {
      await deleteConductor(selectedConductor.id);
      toast.success('Conductor eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedConductor(null);
    } catch (error) {
      toast.error('Error al eliminar el conductor');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conductores</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la información de los conductores de tu flota
          </p>
        </div>

        <ProtectedActions
          action="create"
          resource="conductores"
          onAction={handleCreate}
          buttonText="Nuevo Conductor"
        />
      </div>

      {/* Debug Component - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && <PermissionsDebug />}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Lista de Conductores ({filteredConductores.length})
            </CardTitle>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar conductores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
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

      <ConductorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedConductor(null);
        }}
        onSave={handleSave}
        conductor={selectedConductor}
        isLoading={isCreating || isUpdating}
      />

      <ConductorDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedConductor(null);
        }}
        onConfirm={handleConfirmDelete}
        conductor={selectedConductor}
        isLoading={isDeleting}
      />

      <ConductorViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedConductor(null);
        }}
        conductor={selectedConductor}
        onEdit={handleEdit}
      />
    </div>
  );
}
