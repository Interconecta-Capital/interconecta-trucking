
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Search, Filter, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DocumentoViaje {
  id: string;
  tipo_documento: string;
  fecha_generacion: string;
  carta_porte_id: string;
  version_documento: string;
  metadatos: any;
  viaje_id?: string;
  viaje_origen?: string;
  viaje_destino?: string;
  carta_porte_folio?: string;
}

export function DocumentosVista() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState<DocumentoViaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');

  useEffect(() => {
    if (user?.id) {
      cargarDocumentos();
    }
  }, [user?.id]);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      
      // Obtener documentos de cartas porte
      const { data: documentosCP, error: errorCP } = await supabase
        .from('carta_porte_documentos')
        .select(`
          *,
          cartas_porte!inner(
            id,
            folio,
            usuario_id,
            nombre_documento
          )
        `)
        .eq('cartas_porte.usuario_id', user?.id)
        .eq('activo', true)
        .order('fecha_generacion', { ascending: false });

      if (errorCP) throw errorCP;

      // Transformar datos para el componente
      const documentosTransformados = documentosCP?.map(doc => {
        // Safely access metadatos properties
        let metadatos = {};
        if (doc.metadatos && typeof doc.metadatos === 'object') {
          metadatos = doc.metadatos as Record<string, any>;
        } else if (doc.metadatos && typeof doc.metadatos === 'string') {
          try {
            metadatos = JSON.parse(doc.metadatos);
          } catch {
            metadatos = {};
          }
        }

        return {
          id: doc.id,
          tipo_documento: doc.tipo_documento,
          fecha_generacion: doc.fecha_generacion,
          carta_porte_id: doc.carta_porte_id,
          version_documento: doc.version_documento,
          metadatos: metadatos,
          carta_porte_folio: doc.cartas_porte?.folio || 'Sin folio',
          viaje_origen: (metadatos as any)?.origen || 'No especificado',
          viaje_destino: (metadatos as any)?.destino || 'No especificado'
        };
      }) || [];

      setDocumentos(documentosTransformados);
    } catch (error) {
      console.error('Error cargando documentos:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const descargarDocumento = async (documento: DocumentoViaje) => {
    try {
      // TODO: Implementar descarga real del documento
      console.log('Descargando documento:', documento);
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error descargando documento:', error);
      toast.error('Error al descargar documento');
    }
  };

  const verDocumento = async (documento: DocumentoViaje) => {
    try {
      // TODO: Implementar visor de documentos
      console.log('Viendo documento:', documento);
      toast.info('Abriendo visor de documentos');
    } catch (error) {
      console.error('Error viendo documento:', error);
      toast.error('Error al abrir documento');
    }
  };

  const editarViaje = (documento: DocumentoViaje) => {
    // Navegar al editor de carta porte para editar el viaje
    navigate(`/carta-porte/editor?id=${documento.carta_porte_id}&mode=edit`);
  };

  const documentosFiltrados = documentos.filter(doc => {
    const coincideBusqueda = !searchTerm || 
      doc.carta_porte_folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.viaje_origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.viaje_destino?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const coincideTipo = tipoFiltro === 'todos' || doc.tipo_documento === tipoFiltro;
    
    return coincideBusqueda && coincideTipo;
  });

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'XML':
        return 'bg-blue-100 text-blue-800';
      case 'carta_porte':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cargando documentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por folio, origen o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="todos">Todos los tipos</option>
          <option value="PDF">PDF</option>
          <option value="XML">XML</option>
          <option value="carta_porte">Carta Porte</option>
        </select>
      </div>

      {/* Lista de documentos */}
      {documentosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay documentos disponibles</p>
            <p className="text-sm text-gray-500 mt-2">
              Los documentos generados aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documentosFiltrados.map((documento) => (
            <Card key={documento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">{documento.carta_porte_folio}</h3>
                      <Badge className={getTipoBadgeColor(documento.tipo_documento)}>
                        {documento.tipo_documento}
                      </Badge>
                      <Badge variant="outline">{documento.version_documento}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Origen:</span> {documento.viaje_origen}
                      </div>
                      <div>
                        <span className="font-medium">Destino:</span> {documento.viaje_destino}
                      </div>
                      <div>
                        <span className="font-medium">Fecha:</span> {' '}
                        {new Date(documento.fecha_generacion).toLocaleDateString('es-MX')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editarViaje(documento)}
                      title="Editar viaje"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verDocumento(documento)}
                      title="Ver documento"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => descargarDocumento(documento)}
                      title="Descargar documento"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
