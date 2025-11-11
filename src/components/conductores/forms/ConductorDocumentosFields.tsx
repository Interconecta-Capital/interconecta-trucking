import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecureFileUpload } from '@/components/forms/SecureFileUpload';
import { FileText, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDocumentosEntidades } from '@/hooks/useDocumentosEntidades';

interface ConductorDocumentosFieldsProps {
  conductorId?: string;
  onDocumentosChange?: (documentos: any[]) => void;
}

const TIPOS_DOCUMENTO_CONDUCTOR = [
  { value: 'licencia_conducir', label: 'Licencia de Conducir', obligatorio: true, vencimiento: 1095, permitirPosponer: false },
  { value: 'cdsf', label: 'Certificado de Seguridad Federal (CDSF)', obligatorio: true, vencimiento: 1095, permitirPosponer: false },
  { value: 'comprobante_domicilio', label: 'Comprobante de Domicilio', obligatorio: false, vencimiento: 90, permitirPosponer: true },
  { value: 'curp', label: 'CURP', obligatorio: false, permitirPosponer: true },
  { value: 'certificado_medico', label: 'Certificado Médico', obligatorio: false, vencimiento: 365, permitirPosponer: true },
  { value: 'antecedentes_penales', label: 'Carta de No Antecedentes Penales', obligatorio: false, vencimiento: 180, permitirPosponer: true },
  { value: 'identificacion_oficial', label: 'Identificación Oficial (INE/IFE)', obligatorio: false, permitirPosponer: true },
];

export function ConductorDocumentosFields({ conductorId, onDocumentosChange }: ConductorDocumentosFieldsProps) {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [postponedDocs, setPostponedDocs] = useState<Set<string>>(new Set());
  const { cargarDocumentos, subirDocumento, eliminarDocumento } = useDocumentosEntidades();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (conductorId) {
      loadDocumentos();
    }
  }, [conductorId]);

  const loadDocumentos = async () => {
    if (!conductorId) return;
    setLoading(true);
    try {
      const docs = await cargarDocumentos('conductor', conductorId);
      setDocumentos(docs);
      onDocumentosChange?.(docs);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, tipoDocumento: string) => {
    if (!conductorId) {
      console.warn('No se puede subir documento sin ID de conductor');
      return;
    }

    const docConfig = TIPOS_DOCUMENTO_CONDUCTOR.find(t => t.value === tipoDocumento);
    const fechaVencimiento = docConfig?.vencimiento 
      ? new Date(Date.now() + docConfig.vencimiento * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    try {
      await subirDocumento(file, 'conductor', conductorId, tipoDocumento, fechaVencimiento);
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
          <FileText className="h-5 w-5" />
          Documentos del Conductor
        </CardTitle>
        <CardDescription>
          Sube los documentos requeridos. Los campos marcados con * son obligatorios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!conductorId && (
          <div className="bg-muted/50 border border-muted rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-2">
            <Upload className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Primero guarda los datos básicos del conductor para poder subir documentos.</p>
          </div>
        )}

        {TIPOS_DOCUMENTO_CONDUCTOR.map((tipo) => {
          const existentes = getDocumentosByTipo(tipo.value);
          const isPostponed = postponedDocs.has(tipo.value);
          
          return (
            <div key={tipo.value} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {tipo.label}
                  {tipo.obligatorio && !tipo.permitirPosponer && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="flex items-center gap-4">
                  {tipo.vencimiento && (
                    <span className="text-xs text-muted-foreground">
                      Vence en {tipo.vencimiento} días
                    </span>
                  )}
                  {tipo.permitirPosponer && existentes.length === 0 && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPostponed}
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
                      <span className="text-gray-600">Subir después</span>
                    </label>
                  )}
                </div>
              </div>
              
              {!isPostponed && existentes.length === 0 && (
                <SecureFileUpload
                  label=""
                  onFilesChange={(files) => files.length > 0 && handleFileUpload(files[0], tipo.value)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10}
                />
              )}

              {isPostponed && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
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
      </CardContent>
    </Card>
  );
}
