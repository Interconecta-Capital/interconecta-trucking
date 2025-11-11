import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecureFileUpload } from '@/components/forms/SecureFileUpload';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDocumentosEntidades } from '@/hooks/useDocumentosEntidades';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VehiculoDocumentosSectionProps {
  vehiculoId?: string;
  onDocumentosChange?: (documentos: any[]) => void;
}

const TIPOS_DOCUMENTO_VEHICULO = [
  { value: 'tarjeta_circulacion', label: 'Tarjeta de Circulación', obligatorio: true, vencimiento: 365, permitirPosponer: false },
  { value: 'poliza_seguro', label: 'Póliza de Seguro', obligatorio: true, vencimiento: 365, permitirPosponer: true },
  { value: 'permiso_sct', label: 'Permiso SCT', obligatorio: true, vencimiento: 1095, permitirPosponer: true },
  { value: 'verificacion_vehicular', label: 'Verificación Vehicular', obligatorio: false, vencimiento: 180, permitirPosponer: true },
  { value: 'factura_vehiculo', label: 'Factura del Vehículo', obligatorio: false, permitirPosponer: true },
  { value: 'certificado_peso', label: 'Certificado de Peso y Dimensiones', obligatorio: false, vencimiento: 365, permitirPosponer: true },
];

export function VehiculoDocumentosSection({ vehiculoId, onDocumentosChange }: VehiculoDocumentosSectionProps) {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const { cargarDocumentos, subirDocumento, eliminarDocumento } = useDocumentosEntidades();
  const [loading, setLoading] = useState(false);
  const [postponedDocs, setPostponedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (vehiculoId) {
      loadDocumentos();
    }
  }, [vehiculoId]);

  const loadDocumentos = async () => {
    if (!vehiculoId) return;
    setLoading(true);
    try {
      const docs = await cargarDocumentos('vehiculo', vehiculoId);
      setDocumentos(docs);
      onDocumentosChange?.(docs);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, tipoDocumento: string) => {
    if (!vehiculoId) {
      console.warn('No se puede subir documento sin ID de vehículo');
      return;
    }

    const docConfig = TIPOS_DOCUMENTO_VEHICULO.find(t => t.value === tipoDocumento);
    const fechaVencimiento = docConfig?.vencimiento 
      ? new Date(Date.now() + docConfig.vencimiento * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    try {
      await subirDocumento(file, 'vehiculo', vehiculoId, tipoDocumento, fechaVencimiento);
      await loadDocumentos();
    } catch (error) {
      console.error('Error subiendo documento:', error);
    }
  };

  const handleDeleteDocumento = async (documentoId: string) => {
    try {
      await eliminarDocumento(documentoId);
      await loadDocumentos();
    } catch (error) {
      console.error('Error eliminando documento:', error);
    }
  };

  const getDocumentosByTipo = (tipoDocumento: string) => {
    return documentos.filter(doc => doc.tipo_documento === tipoDocumento);
  };

  const documentosObligatoriosFaltantes = TIPOS_DOCUMENTO_VEHICULO
    .filter(tipo => tipo.obligatorio)
    .filter(tipo => getDocumentosByTipo(tipo.value).length === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos del Vehículo
        </CardTitle>
        <CardDescription>
          Documentación legal y técnica del vehículo. Los documentos obligatorios son requeridos para operar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!vehiculoId && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Primero guarda los datos básicos del vehículo para poder subir documentos.
            </AlertDescription>
          </Alert>
        )}

        {vehiculoId && documentosObligatoriosFaltantes.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Faltan {documentosObligatoriosFaltantes.length} documento(s) obligatorio(s): {
                documentosObligatoriosFaltantes.map(d => d.label).join(', ')
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {TIPOS_DOCUMENTO_VEHICULO.map((tipo) => {
            const existentes = getDocumentosByTipo(tipo.value);
            const tieneDocumento = existentes.length > 0;
            
            return (
              <div 
                key={tipo.value} 
                className={`space-y-2 p-3 rounded-lg border ${
                  tipo.obligatorio && !tieneDocumento ? 'border-red-200 bg-red-50/50' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {tipo.label}
                    {tipo.obligatorio && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {tipo.vencimiento && (
                    <span className="text-xs text-muted-foreground">
                      Vigencia: {Math.floor(tipo.vencimiento / 30)} meses
                    </span>
                  )}
                </div>
                
                <SecureFileUpload
                  label=""
                  onFilesChange={(files) => files.length > 0 && handleFileUpload(files[0], tipo.value)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10}
                />

                {tipo.permitirPosponer && existentes.length === 0 && vehiculoId && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={postponedDocs.has(tipo.value)}
                      onChange={(e) => {
                        const newPostponed = new Set(postponedDocs);
                        if (e.target.checked) {
                          newPostponed.add(tipo.value);
                        } else {
                          newPostponed.delete(tipo.value);
                        }
                        setPostponedDocs(newPostponed);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-muted-foreground">Subir después</span>
                  </label>
                )}

                {postponedDocs.has(tipo.value) && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      📌 Este documento será subido posteriormente
                    </p>
                  </div>
                )}

                {existentes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {existentes.map((doc) => {
                      const vencido = doc.fecha_vencimiento && new Date(doc.fecha_vencimiento) < new Date();
                      const proximoVencer = doc.fecha_vencimiento && 
                        new Date(doc.fecha_vencimiento).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
                      
                      return (
                        <div 
                          key={doc.id} 
                          className={`flex items-center justify-between text-xs p-2 rounded ${
                            vencido ? 'bg-red-100 text-red-900' : 
                            proximoVencer ? 'bg-yellow-100 text-yellow-900' :
                            'bg-green-50 text-green-900'
                          }`}
                        >
                          <div className="flex-1 truncate">
                            <span className="font-medium">{doc.nombre_archivo}</span>
                            {doc.fecha_vencimiento && (
                              <span className="ml-2 opacity-75">
                                {vencido ? '(Vencido)' : 
                                 proximoVencer ? '(Por vencer)' :
                                 `(Vence: ${new Date(doc.fecha_vencimiento).toLocaleDateString()})`}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteDocumento(doc.id)}
                            className="ml-2 text-red-600 hover:text-red-800 font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
