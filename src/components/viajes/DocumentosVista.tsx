
import { useState } from 'react';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Filter,
  Calendar,
  Package
} from 'lucide-react';
import { useViajesCompletos } from '@/hooks/useViajesCompletos';
import { useIsMobile } from '@/hooks/use-mobile';

export const DocumentosVista = () => {
  const isMobile = useIsMobile();
  const { viajes, isLoading } = useViajesCompletos();
  const [searchTerm, setSearchTerm] = useState('');

  // Crear lista de documentos basada en los viajes
  const documentos = viajes.map(viaje => {
    const docs = [];
    
    // XML de Carta Porte
    docs.push({
      id: `${viaje.id}-xml`,
      viajeId: viaje.id,
      cartaPorteId: viaje.carta_porte_id,
      tipo: 'XML',
      nombre: `CP_${viaje.carta_porte_id}.xml`,
      fechaGeneracion: viaje.created_at,
      estado: viaje.estado,
      tamano: '2.3 KB',
      cliente: viaje.cliente?.nombre || 'Sin cliente'
    });

    // PDF de Carta Porte
    docs.push({
      id: `${viaje.id}-pdf`,
      viajeId: viaje.id,
      cartaPorteId: viaje.carta_porte_id,
      tipo: 'PDF',
      nombre: `CP_${viaje.carta_porte_id}.pdf`,
      fechaGeneracion: viaje.created_at,
      estado: viaje.estado,
      tamano: '85.2 KB',
      cliente: viaje.cliente?.nombre || 'Sin cliente'
    });

    // Factura (solo para viajes completados)
    if (viaje.estado === 'completado') {
      docs.push({
        id: `${viaje.id}-factura`,
        viajeId: viaje.id,
        cartaPorteId: viaje.carta_porte_id,
        tipo: 'Factura',
        nombre: `FAC_${viaje.carta_porte_id}.pdf`,
        fechaGeneracion: viaje.fecha_fin_real || viaje.created_at,
        estado: viaje.estado,
        tamano: '127.8 KB',
        cliente: viaje.cliente?.nombre || 'Sin cliente'
      });
    }

    return docs;
  }).flat();

  // Filtrar documentos por búsqueda
  const documentosFiltrados = documentos.filter(doc => 
    doc.cartaPorteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoBadge = (tipo: string) => {
    const configs = {
      'XML': { className: 'bg-blue-100 text-blue-800', icon: FileText },
      'PDF': { className: 'bg-red-100 text-red-800', icon: FileText },
      'Factura': { className: 'bg-green-100 text-green-800', icon: FileText }
    };
    
    const config = configs[tipo as keyof typeof configs] || 
                  { className: 'bg-gray-100 text-gray-800', icon: FileText };
    
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {tipo}
      </Badge>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      programado: { label: 'Programado', className: 'bg-blue-100 text-blue-800' },
      en_transito: { label: 'En Tránsito', className: 'bg-green-100 text-green-800' },
      completado: { label: 'Completado', className: 'bg-green-100 text-green-800' },
      cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' }
    };
    
    const config = configs[estado as keyof typeof configs] || 
                  { label: estado, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDescargar = (documento: any) => {
    // Implementar descarga real del documento
    console.log('Descargando documento:', documento);
    // Por ahora solo mostramos un toast
    // toast.success(`Descargando ${documento.nombre}`);
  };

  const handleVer = (documento: any) => {
    // Implementar vista previa del documento
    console.log('Viendo documento:', documento);
    // Por ahora solo mostramos un toast
    // toast.info(`Abriendo vista previa de ${documento.nombre}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-interconecta mx-auto"></div>
          <p className="mt-2 text-gray-60">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtros y búsqueda */}
      <div className={`flex gap-4 bg-gray-05 p-4 rounded-2xl ${isMobile ? 'flex-col' : 'flex-row'}`}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
          <Input
            placeholder="Buscar por carta porte, cliente, o tipo de documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-12 border-0 bg-pure-white shadow-sm ${isMobile ? 'h-12 text-base' : 'h-12'}`}
          />
        </div>
        <Button 
          variant="outline"
          className={`bg-pure-white shadow-sm border-0 ${isMobile ? 'h-12 w-full justify-center' : 'h-12 px-6'}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Resumen de documentos */}
      <ResponsiveGrid cols={{ default: 2, md: 4 }} gap={{ default: 4, md: 6 }}>
        <ResponsiveCard>
          <ResponsiveCardContent className="p-4">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-gray-90">
                {documentos.filter(d => d.tipo === 'XML').length}
              </p>
              <p className="text-sm text-gray-60">Archivos XML</p>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardContent className="p-4">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-gray-90">
                {documentos.filter(d => d.tipo === 'PDF').length}
              </p>
              <p className="text-sm text-gray-60">Archivos PDF</p>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardContent className="p-4">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-gray-90">
                {documentos.filter(d => d.tipo === 'Factura').length}
              </p>
              <p className="text-sm text-gray-60">Facturas</p>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveCardContent className="p-4">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-gray-90">
                {viajes.length}
              </p>
              <p className="text-sm text-gray-60">Viajes Totales</p>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Lista de documentos */}
      {documentosFiltrados.length === 0 ? (
        <ResponsiveCard className="border-0 shadow-sm bg-gradient-to-br from-gray-05 to-gray-10">
          <ResponsiveCardContent className={isMobile ? "p-8" : "p-16"}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-gray-50" />
              </div>
              <h3 className={`font-semibold text-gray-90 mb-3 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                No hay documentos
              </h3>
              <p className="text-gray-60 max-w-md mx-auto">
                {searchTerm ? 'No se encontraron documentos con ese criterio de búsqueda' : 'Aún no tienes documentos generados'}
              </p>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      ) : (
        <div className="space-y-4">
          {documentosFiltrados.map((documento) => (
            <ResponsiveCard key={documento.id} className="group hover:shadow-lg transition-all duration-200">
              <ResponsiveCardContent className="p-4">
                <div className={`flex items-center justify-between gap-4 ${isMobile ? 'flex-col space-y-3' : 'flex-row'}`}>
                  
                  {/* Información del documento */}
                  <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
                    <div className={`flex items-center gap-3 mb-2 ${isMobile ? 'flex-col items-start' : 'flex-row'}`}>
                      <div className="flex items-center gap-2">
                        {getTipoBadge(documento.tipo)}
                        {getEstadoBadge(documento.estado)}
                      </div>
                      
                      <div className="text-sm text-gray-60">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(documento.fechaGeneracion)}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-90 mb-1">
                      {documento.cartaPorteId}
                    </h3>
                    
                    <div className={`grid gap-2 text-sm text-gray-60 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                      <span>Cliente: {documento.cliente}</span>
                      <span>Archivo: {documento.nombre}</span>
                      <span>Tamaño: {documento.tamano}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className={`flex gap-2 ${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVer(documento)}
                      className={isMobile ? 'flex-1' : ''}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    
                    <Button 
                      onClick={() => handleDescargar(documento)}
                      size="sm"
                      className={isMobile ? 'flex-1' : ''}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </ResponsiveCardContent>
            </ResponsiveCard>
          ))}
        </div>
      )}
    </div>
  );
};
