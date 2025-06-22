import { useState } from 'react';
import { Plus, FileText, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartasPorteTable } from '@/components/cartas-porte/CartasPorteTable';
import { CartasPorteFilters } from '@/components/cartas-porte/CartasPorteFilters';
import { useCartaPorteLifecycle } from '@/hooks/cartaPorte/useCartaPorteLifecycle';
import { useNavigate } from 'react-router-dom';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { useEffect } from 'react';

export default function CartasPorte() {
  const { cartasPorte, isLoading, listarCartasPorte } = useCartaPorteLifecycle();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listarCartasPorte();
  }, [listarCartasPorte]);

  const handleNewCartaPorte = () => {
    navigate('/carta-porte/nuevo');
  };

  const filteredCartasPorte = cartasPorte.filter(carta =>
    carta.id_ccp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.nombre_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.rfc_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carta.rfc_receptor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convertir CartaPorteCompleta a CartaPorte para la tabla
  const cartasPorteParaTabla = filteredCartasPorte.map(carta => ({
    id: carta.id,
    usuario_id: carta.usuario_id || '',
    folio: carta.folio,
    tipo_cfdi: carta.tipo_cfdi,
    rfc_emisor: carta.rfc_emisor,
    nombre_emisor: carta.nombre_emisor,
    rfc_receptor: carta.rfc_receptor,
    nombre_receptor: carta.nombre_receptor,
    entrada_salida_merc: carta.entrada_salida_merc,
    pais_origen_destino: carta.pais_origen_destino,
    via_entrada_salida: carta.via_entrada_salida,
    ubicacion_polo_origen: carta.ubicacion_polo_origen,
    ubicacion_polo_destino: carta.ubicacion_polo_destino,
    transporte_internacional: carta.transporte_internacional,
    registro_istmo: carta.registro_istmo,
    status: carta.status,
    xml_generado: carta.xml_generado,
    uuid_fiscal: carta.uuid_fiscal,
    fecha_timbrado: carta.fecha_timbrado,
    tenant_id: carta.tenant_id,
    datos_formulario: carta.datos_formulario,
    id_ccp: carta.id_ccp,
    version_carta_porte: '3.1',
    created_at: carta.created_at,
    updated_at: carta.updated_at
  }));

  return (
    <ProtectedContent requiredFeature="cartas_porte">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold">Cartas Porte</h1>
          </div>
          <ProtectedActions
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
              placeholder="Buscar por IdCCP, nombre, emisor o receptor..."
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
          <CartasPorteFilters />
        )}

        {/* Tabla */}
        <CartasPorteTable 
          cartasPorte={cartasPorteParaTabla}
          loading={isLoading}
        />
      </div>
    </ProtectedContent>
  );
}
