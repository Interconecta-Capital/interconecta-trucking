
import { useState } from 'react';
import { Plus, Wrench, Filter, Search, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { useStableAuth } from '@/hooks/useStableAuth';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function Remolques() {
  const { user } = useStableAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleNewRemolque = () => {
    console.log('Crear nuevo remolque');
    // TODO: Implementar modal para crear remolque
  };

  const handleLinkToVehicle = () => {
    console.log('Vincular remolque a vehículo');
    // TODO: Implementar modal para vincular remolque
  };

  // Datos temporales hasta implementar el hook
  const remolques: any[] = [];
  const loading = false;
  const error = null;

  return (
    <ProtectedContent requiredFeature="vehiculos">
      <div className="container mx-auto py-8 space-y-8 max-w-7xl">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header estilo Apple */}
        <SectionHeader
          title="Remolques"
          description="Gestiona tu flota de remolques y vinculaciones"
          icon={Wrench}
          className="mb-8"
        >
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleLinkToVehicle}
              className="flex items-center gap-2 bg-white-force"
            >
              <Car className="h-4 w-4" />
              Vincular a Vehículo
            </Button>
            <ProtectedActions
              action="create"
              resource="vehiculos"
              onAction={handleNewRemolque}
            >
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Remolque
              </Button>
            </ProtectedActions>
          </div>
        </SectionHeader>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LimitUsageIndicator resourceType="vehiculos" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda estilo Apple */}
        <div className="flex flex-col sm:flex-row gap-4 bg-gray-05 p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
            <Input
              placeholder="Buscar por placa, subtipo o vehículo vinculado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-0 bg-white-force shadow-sm"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6 bg-white-force shadow-sm border-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Stats estilo Apple */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-light to-blue-interconecta/10 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-interconecta">Total Remolques</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-interconecta">{remolques.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700">Vinculados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">0</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-05 to-gray-10 border-gray-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-70">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-lg font-semibold ${loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}`}>
                {loading ? 'Cargando...' : error ? 'Error' : 'Listo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <Card>
          <CardContent className="p-8 text-center">
            <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Gestión de Remolques
            </h3>
            <p className="text-gray-500 mb-6">
              Aquí podrás gestionar tus remolques y vincularlos con vehículos y conductores.
            </p>
            <Button onClick={handleNewRemolque} className="mr-4">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Remolque
            </Button>
            <Button variant="outline" onClick={handleLinkToVehicle}>
              <Car className="h-4 w-4 mr-2" />
              Vincular a Vehículo
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedContent>
  );
}
