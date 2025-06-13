
import { useState } from 'react';
import { Plus, Users, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SociosTable } from '@/components/socios/SociosTable';
import { SociosFilters } from '@/components/socios/SociosFilters';
import { SocioFormDialog } from '@/components/socios/SocioFormDialog';
import { useSocios } from '@/hooks/useSocios';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function Socios() {
  const { socios, loading } = useSocios();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleNewSocio = () => {
    setShowCreateDialog(true);
  };

  const filteredSocios = socios.filter(socio =>
    socio.nombre_razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    socio.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedContent requiredFeature="socios">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Socios Comerciales</h1>
          </div>
          <ProtectedActions
            action="create"
            resource="socios"
            onAction={handleNewSocio}
            buttonText="Nuevo Socio"
          />
        </div>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="socios" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, RFC o email..."
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
          <SociosFilters />
        )}

        {/* Tabla */}
        <SociosTable 
          socios={filteredSocios}
          loading={loading}
        />

        {/* Dialog de creación */}
        <SocioFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </ProtectedContent>
  );
}
