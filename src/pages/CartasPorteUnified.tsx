
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Filter, Search, Edit, Trash2, Download, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useCartaPorteLifecycle } from '@/hooks/cartaPorte/useCartaPorteLifecycle';
import { BorradorCartaPorte, CartaPorteCompleta } from '@/types/cartaPorteLifecycle';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { toast } from 'sonner';
import { UUIDService } from '@/services/uuid/UUIDService';

type DocumentStatus = 'draft' | 'active' | 'timbrado' | 'cancelado';

interface UnifiedDocument {
  id: string;
  tipo: 'borrador' | 'carta_porte';
  nombre: string;
  idCCP?: string;
  status: DocumentStatus;
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  ultimaModificacion: string;
  autoGuardado?: boolean;
  progreso?: number;
}

export default function CartasPorteUnified() {
  const navigate = useNavigate();
  const {
    borradores,
    cartasPorte,
    isLoading,
    listarBorradores,
    listarCartasPorte,
    crearBorrador,
    eliminarBorrador,
    convertirBorradorACartaPorte
  } = useCartaPorteLifecycle();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentStatus>('draft');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    listarBorradores();
    listarCartasPorte();
  }, [listarBorradores, listarCartasPorte]);

  // Unified document list combining borradores and cartas porte
  const unifiedDocuments: UnifiedDocument[] = [
    // Borradores (always draft status)
    ...borradores.map(borrador => ({
      id: borrador.id,
      tipo: 'borrador' as const,
      nombre: borrador.nombre_borrador,
      status: 'draft' as DocumentStatus,
      rfcEmisor: borrador.datos_formulario?.rfcEmisor || borrador.datos_formulario?.configuracion?.emisor?.rfc,
      nombreEmisor: borrador.datos_formulario?.nombreEmisor || borrador.datos_formulario?.configuracion?.emisor?.nombre,
      rfcReceptor: borrador.datos_formulario?.rfcReceptor || borrador.datos_formulario?.configuracion?.receptor?.rfc,
      nombreReceptor: borrador.datos_formulario?.nombreReceptor || borrador.datos_formulario?.configuracion?.receptor?.nombre,
      ultimaModificacion: borrador.ultima_edicion,
      autoGuardado: borrador.auto_saved,
      progreso: calculateProgress(borrador.datos_formulario)
    })),
    // Cartas Porte (can have different statuses)
    ...cartasPorte.map(carta => ({
      id: carta.id,
      tipo: 'carta_porte' as const,
      nombre: carta.nombre_documento || `Carta Porte ${carta.id_ccp?.substring(0, 8)}`,
      idCCP: carta.id_ccp,
      status: (carta.status as DocumentStatus) || 'active',
      rfcEmisor: carta.rfc_emisor,
      nombreEmisor: carta.nombre_emisor,
      rfcReceptor: carta.rfc_receptor,
      nombreReceptor: carta.nombre_receptor,
      ultimaModificacion: carta.updated_at,
      progreso: calculateProgress(carta.datos_formulario)
    }))
  ];

  function calculateProgress(datosFormulario: any): number {
    if (!datosFormulario) return 0;
    
    let completedSections = 0;
    const totalSections = 5;
    
    // Configuración
    if (datosFormulario.rfcEmisor && datosFormulario.rfcReceptor) completedSections++;
    
    // Ubicaciones
    if (datosFormulario.ubicaciones?.length >= 2) completedSections++;
    
    // Mercancías
    if (datosFormulario.mercancias?.length > 0) completedSections++;
    
    // Autotransporte
    if (datosFormulario.autotransporte?.placa_vm) completedSections++;
    
    // Figuras
    if (datosFormulario.figuras?.length > 0) completedSections++;
    
    return Math.round((completedSections / totalSections) * 100);
  }

  const filteredDocuments = unifiedDocuments.filter(doc => {
    const matchesStatus = doc.status === activeTab;
    const matchesSearch = !searchTerm || 
      doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.idCCP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.rfcEmisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.rfcReceptor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleNewDocument = async () => {
    try {
      const nuevoBorrador = await crearBorrador({
        nombre_borrador: `Borrador ${new Date().toLocaleDateString()}`,
        datos_formulario: {},
        version_formulario: '3.1'
      });
      navigate(`/carta-porte/editor/${nuevoBorrador.id}`);
    } catch (error) {
      console.error('Error creando borrador:', error);
      toast.error('Error al crear nuevo documento');
    }
  };

  const handleEditDocument = (doc: UnifiedDocument) => {
    navigate(`/carta-porte/editor/${doc.id}`);
  };

  const handleDuplicateDocument = async (doc: UnifiedDocument) => {
    try {
      const originalData = doc.tipo === 'borrador' 
        ? borradores.find(b => b.id === doc.id)?.datos_formulario
        : cartasPorte.find(c => c.id === doc.id)?.datos_formulario;

      const nuevoBorrador = await crearBorrador({
        nombre_borrador: `${doc.nombre} (Copia)`,
        datos_formulario: originalData || {},
        version_formulario: '3.1'
      });
      
      toast.success('Documento duplicado exitosamente');
      navigate(`/carta-porte/editor/${nuevoBorrador.id}`);
    } catch (error) {
      console.error('Error duplicando documento:', error);
      toast.error('Error al duplicar documento');
    }
  };

  const handleDeleteDocument = async (doc: UnifiedDocument) => {
    if (!confirm(`¿Estás seguro de eliminar "${doc.nombre}"?`)) return;
    
    try {
      if (doc.tipo === 'borrador') {
        await eliminarBorrador(doc.id);
        toast.success('Borrador eliminado');
      } else {
        // TODO: Implement carta porte deletion
        toast.info('Funcionalidad pendiente para cartas porte');
      }
    } catch (error) {
      console.error('Error eliminando documento:', error);
      toast.error('Error al eliminar documento');
    }
  };

  const handleConvertToActive = async (doc: UnifiedDocument) => {
    if (doc.tipo !== 'borrador') return;
    
    try {
      const cartaPorte = await convertirBorradorACartaPorte({
        borradorId: doc.id,
        nombre_documento: doc.nombre,
        validarDatos: true
      });
      
      toast.success(`Carta Porte activada con IdCCP: ${cartaPorte.id_ccp}`);
      setActiveTab('active');
    } catch (error) {
      console.error('Error convirtiendo borrador:', error);
      toast.error('Error al activar documento');
    }
  };

  const getStatusBadge = (status: DocumentStatus, autoGuardado?: boolean) => {
    const statusConfig = {
      draft: { label: 'Borrador', variant: 'secondary' as const },
      active: { label: 'Activa', variant: 'default' as const },
      timbrado: { label: 'Timbrada', variant: 'outline' as const },
      cancelado: { label: 'Cancelada', variant: 'destructive' as const }
    };

    return (
      <div className="flex items-center gap-2">
        <Badge variant={statusConfig[status].variant}>
          {statusConfig[status].label}
        </Badge>
        {autoGuardado && (
          <Badge variant="outline" className="text-xs">
            Auto-guardado
          </Badge>
        )}
      </div>
    );
  };

  const getTabCounts = () => {
    return {
      draft: unifiedDocuments.filter(d => d.status === 'draft').length,
      active: unifiedDocuments.filter(d => d.status === 'active').length,
      timbrado: unifiedDocuments.filter(d => d.status === 'timbrado').length,
      cancelado: unifiedDocuments.filter(d => d.status === 'cancelado').length
    };
  };

  const tabCounts = getTabCounts();

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
            action="create"
            resource="cartas_porte"
            onAction={handleNewDocument}
            buttonText="Nueva Carta Porte"
          />
        </div>

        {/* Indicador de límites */}
        <LimitUsageIndicator resourceType="cartas_porte" />

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, IdCCP, emisor o receptor..."
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

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentStatus)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="draft" className="flex items-center gap-2">
              Borradores
              <Badge variant="secondary" className="text-xs">
                {tabCounts.draft}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              Activas
              <Badge variant="secondary" className="text-xs">
                {tabCounts.active}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="timbrado" className="flex items-center gap-2">
              Timbradas
              <Badge variant="secondary" className="text-xs">
                {tabCounts.timbrado}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelado" className="flex items-center gap-2">
              Canceladas
              <Badge variant="secondary" className="text-xs">
                {tabCounts.cancelado}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Content for each tab */}
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Cargando documentos...</p>
                </div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">
                      {searchTerm ? 'No se encontraron documentos' : `No hay ${activeTab === 'draft' ? 'borradores' : 'documentos'}`}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? 'Intenta con otros términos de búsqueda'
                        : activeTab === 'draft' 
                          ? 'Crea tu primer borrador para comenzar'
                          : 'Los documentos aparecerán aquí cuando cambien de estado'
                      }
                    </p>
                  </div>
                  {!searchTerm && activeTab === 'draft' && (
                    <Button onClick={handleNewDocument} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Crear Primer Borrador
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{doc.nombre}</CardTitle>
                          {doc.idCCP && (
                            <p className="text-sm text-muted-foreground mt-1">
                              IdCCP: {UUIDService.formatIdCCPForDisplay(doc.idCCP)}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(doc.status, doc.autoGuardado)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Información básica */}
                      <div className="space-y-2 text-sm">
                        {doc.nombreEmisor && (
                          <div>
                            <span className="font-medium">Emisor:</span> {doc.nombreEmisor}
                            {doc.rfcEmisor && <span className="text-muted-foreground"> ({doc.rfcEmisor})</span>}
                          </div>
                        )}
                        {doc.nombreReceptor && (
                          <div>
                            <span className="font-medium">Receptor:</span> {doc.nombreReceptor}
                            {doc.rfcReceptor && <span className="text-muted-foreground"> ({doc.rfcReceptor})</span>}
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          Modificado: {new Date(doc.ultimaModificacion).toLocaleString()}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {doc.progreso !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progreso</span>
                            <span>{doc.progreso}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all" 
                              style={{ width: `${doc.progreso}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditDocument(doc)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateDocument(doc)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>

                        {doc.tipo === 'borrador' && doc.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertToActive(doc)}
                            title="Activar documento"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDocument(doc)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedContent>
  );
}
