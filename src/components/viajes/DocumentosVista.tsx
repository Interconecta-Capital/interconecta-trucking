
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Calendar, Search } from 'lucide-react';
import { useDocumentosEntidades, type DocumentoEntidad } from '@/hooks/useDocumentosEntidades';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';

export function DocumentosVista() {
  const [documentos, setDocumentos] = useState<DocumentoEntidad[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEntidad, setFiltroEntidad] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { cargarDocumentos } = useDocumentosEntidades();
  const { vehiculos } = useVehiculos();
  const { conductores } = useConductores();
  const { socios } = useSocios();

  useEffect(() => {
    const cargarTodosDocumentos = async () => {
      setLoading(true);
      const todosDocumentos: DocumentoEntidad[] = [];
      
      // Cargar documentos de vehículos
      for (const vehiculo of vehiculos) {
        const docs = await cargarDocumentos('vehiculo', vehiculo.id);
        todosDocumentos.push(...docs);
      }
      
      // Cargar documentos de conductores
      for (const conductor of conductores) {
        const docs = await cargarDocumentos('conductor', conductor.id);
        todosDocumentos.push(...docs);
      }
      
      // Cargar documentos de socios
      for (const socio of socios) {
        const docs = await cargarDocumentos('socio', socio.id);
        todosDocumentos.push(...docs);
      }
      
      setDocumentos(todosDocumentos);
      setLoading(false);
    };

    if (vehiculos.length > 0 || conductores.length > 0 || socios.length > 0) {
      cargarTodosDocumentos();
    }
  }, [vehiculos, conductores, socios, cargarDocumentos]);

  const documentosFiltrados = documentos.filter(doc => {
    const matchBusqueda = doc.nombre_archivo.toLowerCase().includes(busqueda.toLowerCase()) ||
                         doc.tipo_documento.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || doc.tipo_documento === filtroTipo;
    const matchEntidad = filtroEntidad === 'todos' || doc.entidad_tipo === filtroEntidad;
    
    return matchBusqueda && matchTipo && matchEntidad;
  });

  const obtenerNombreEntidad = (doc: DocumentoEntidad) => {
    if (doc.entidad_tipo === 'vehiculo') {
      const vehiculo = vehiculos.find(v => v.id === doc.entidad_id);
      return vehiculo?.placa || 'Vehículo';
    } else if (doc.entidad_tipo === 'conductor') {
      const conductor = conductores.find(c => c.id === doc.entidad_id);
      return conductor?.nombre || 'Conductor';
    } else if (doc.entidad_tipo === 'socio') {
      const socio = socios.find(s => s.id === doc.entidad_id);
      return socio?.nombre_razon_social || 'Socio';
    }
    return 'Desconocido';
  };

  const obtenerEstadoVencimiento = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return null;
    
    const fecha = new Date(fechaVencimiento);
    const hoy = new Date();
    const diasHastaVencimiento = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasHastaVencimiento < 0) {
      return { estado: 'vencido', dias: Math.abs(diasHastaVencimiento), color: 'bg-red-100 text-red-800' };
    } else if (diasHastaVencimiento <= 30) {
      return { estado: 'por_vencer', dias: diasHastaVencimiento, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { estado: 'vigente', dias: diasHastaVencimiento, color: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando documentos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filtroEntidad} onValueChange={setFiltroEntidad}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las entidades</SelectItem>
                <SelectItem value="vehiculo">Vehículos</SelectItem>
                <SelectItem value="conductor">Conductores</SelectItem>
                <SelectItem value="socio">Socios</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los documentos</SelectItem>
                <SelectItem value="Tarjeta de Circulación">Tarjeta de Circulación</SelectItem>
                <SelectItem value="Licencia de Conducir">Licencia de Conducir</SelectItem>
                <SelectItem value="Póliza de Seguro">Póliza de Seguro</SelectItem>
                <SelectItem value="Verificación Vehicular">Verificación Vehicular</SelectItem>
                <SelectItem value="Acta Constitutiva">Acta Constitutiva</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-muted-foreground flex items-center">
              Total: {documentosFiltrados.length} documentos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      <div className="grid gap-4">
        {documentosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron documentos</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          documentosFiltrados.map((doc) => {
            const nombreEntidad = obtenerNombreEntidad(doc);
            const estadoVencimiento = obtenerEstadoVencimiento(doc.fecha_vencimiento);
            
            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{doc.tipo_documento}</h3>
                        <Badge variant="outline" className="capitalize">
                          {doc.entidad_tipo}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Entidad:</span> {nombreEntidad}
                        </div>
                        <div>
                          <span className="font-medium">Archivo:</span> {doc.nombre_archivo}
                        </div>
                        <div>
                          <span className="font-medium">Subido:</span> {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {estadoVencimiento && (
                        <div className="mt-2">
                          <Badge className={estadoVencimiento.color}>
                            {estadoVencimiento.estado === 'vencido' && `Vencido hace ${estadoVencimiento.dias} días`}
                            {estadoVencimiento.estado === 'por_vencer' && `Vence en ${estadoVencimiento.dias} días`}
                            {estadoVencimiento.estado === 'vigente' && `Vigente ${estadoVencimiento.dias} días más`}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
