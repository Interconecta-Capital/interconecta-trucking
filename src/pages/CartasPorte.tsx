
import { useState } from 'react';
import { Plus, FileText, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { CartasPorteTable } from '@/components/cartas-porte/CartasPorteTable';
import { CartasPorteFilters } from '@/components/cartas-porte/CartasPorteFilters';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';

export default function CartasPorte() {
  const navigate = useNavigate();
  const { cartasPorte, loading, eliminarCartaPorte } = useCartasPorte();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos');

  const handleNewCartaPorte = () => {
    navigate('/cartas-porte/nueva');
  };

  const handleDeleteCartaPorte = async (id: string) => {
    try {
      await eliminarCartaPorte(id);
    } catch (error) {
      console.error('Error eliminando carta porte:', error);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('todos');
    setSearchTerm('');
  };

  // Apply filters
  const filteredCartas = cartasPorte.filter(carta => {
    const matchesSearch = 
      carta.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carta.rfc_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carta.rfc_receptor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carta.nombre_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carta.nombre_receptor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || carta.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Separate drafts and completed for better organization
  const borradores = filteredCartas.filter(carta => carta.status === 'borrador');
  const completadas = filteredCartas.filter(carta => carta.status !== 'borrador');

  return (
    <ProtectedContent requiredFeature="cartas_porte">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Cartas de Porte</h1>
          </div>
          <ProtectedActions
            action="create"
            resource="cartas_porte"
            onAction={handleNewCartaPorte}
            buttonText="Nueva Carta Porte"
          />
        </div>

        {/* Indicador de límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitUsageIndicator resourceType="cartas_porte" className="md:col-span-2" />
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por folio, RFC, nombre de emisor o receptor..."
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
          <CartasPorteFilters 
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Summary */}
        {!loading && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {filteredCartas.length}</span>
            {borradores.length > 0 && (
              <span className="text-orange-600">Borradores: {borradores.length}</span>
            )}
            {completadas.length > 0 && (
              <span className="text-green-600">Completadas: {completadas.length}</span>
            )}
          </div>
        )}

        {/* Tabla */}
        <CartasPorteTable 
          cartasPorte={filteredCartas}
          loading={loading}
          onDelete={handleDeleteCartaPorte}
        />
      </div>
    </ProtectedContent>
  );
}
