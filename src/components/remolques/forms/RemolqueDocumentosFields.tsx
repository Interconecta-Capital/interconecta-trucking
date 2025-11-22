import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecureFileUpload } from '@/components/forms/SecureFileUpload';
import { FileText, Upload, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDocumentosEntidades } from '@/hooks/useDocumentosEntidades';

interface RemolqueDocumentosFieldsProps {
  remolqueId?: string;
  onDocumentosChange?: (documentos: any[]) => void;
}

const TIPOS_DOCUMENTO_REMOLQUE = [
  { value: 'tarjeta_circulacion', label: 'Tarjeta de Circulación', obligatorio: false, vencimiento: 365, permitirPosponer: true },
  { value: 'certificado_capacidad', label: 'Certificado de Capacidad de Carga', obligatorio: false, vencimiento: 365, permitirPosponer: true },
  { value: 'poliza_seguro', label: 'Póliza de Seguro', obligatorio: false, vencimiento: 365, permitirPosponer: true },
  { value: 'inspeccion_tecnica', label: 'Inspección Técnica', obligatorio: false, vencimiento: 180, permitirPosponer: true },
  { value: 'factura_remolque', label: 'Factura del Remolque', obligatorio: false, permitirPosponer: true },
];

export function RemolqueDocumentosFields({ remolqueId, onDocumentosChange }: RemolqueDocumentosFieldsProps) {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const { cargarDocumentos, subirDocumento, eliminarDocumento } = useDocumentosEntidades();
  const [loading, setLoading] = useState(false);
  const [postponedDocs, setPostponedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (remolqueId) {
      loadDocumentos();
    }
  }, [remolqueId]);

  const loadDocumentos = async () => {
    if (!remolqueId) return;
    setLoading(true);
    try {
      const docs = await cargarDocumentos('remolque', remolqueId);
      setDocumentos(docs);
      onDocumentosChange?.(docs);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, tipoDocumento: string) => {
    if (!remolqueId) {
      console.warn('No se puede subir documento sin ID de remolque');
      return;
    }

    const docConfig = TIPOS_DOCUMENTO_REMOLQUE.find(t => t.value === tipoDocumento);
    const fechaVencimiento = docConfig?.vencimiento 
      ? new Date(Date.now() + docConfig.vencimiento * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    try {
      await subirDocumento(file, 'remolque', remolqueId, tipoDocumento, fechaVencimiento);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Documentos del Remolque
        </CardTitle>
        <CardDescription>
          Documentación legal del remolque. Todos los documentos son opcionales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!remolqueId && (
          <div className="bg-muted/50 border border-muted rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-2">
            <Upload className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Primero guarda los datos básicos del remolque para poder subir documentos.</p>
          </div>
        )}

        <div className="grid gap-4">
          {TIPOS_DOCUMENTO_REMOLQUE.map((tipo) => {
            const existentes = getDocumentosByTipo(tipo.value);
            
            return (
              <div key={tipo.value} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {tipo.label}
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

                {tipo.permitirPosponer && existentes.length === 0 && remolqueId && (
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
                    {existentes.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded">
                        <span className="truncate">{doc.nombre_archivo}</span>
                        <button
                          onClick={() => handleDeleteDocumento(doc.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
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
