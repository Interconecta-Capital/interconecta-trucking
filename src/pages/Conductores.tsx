
import { useState } from 'react';
import { Plus, User, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConductoresTable } from '@/components/conductores/ConductoresTable';
import { ConductoresFilters } from '@/components/conductores/ConductoresFilters';
import { ConductorFormDialog } from '@/components/conductores/ConductorFormDialog';
import { useConductores } from '@/hooks/useConductores';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function Conductores() {
  const { conductores, loading } = useConductores();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleNewConductor = () => {
    setShowCreateDialog(true);
  };

  const filteredConductores = conductores.filter(conductor =>
    conductor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conductor.num_licencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedContent requiredFeature="conductores">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Conductores</h1>
          </div>
          <ProtectedActions
            action="create"
            resource="conductores"
            onAction={handleNewConductor}
            buttonText="Nuevo Conductor"
          />
        </div>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="conductores" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, RFC o licencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filtros adicionales */}
        {showFilters && (
          <ConductoresFilters />
        )}

        {/* Tabla */}
        <ConductoresTable 
          conductores={filteredConductores}
          loading={loading}
        />

        {/* Dialog de creación */}
        <ConductorFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </ProtectedContent>
  );
}
