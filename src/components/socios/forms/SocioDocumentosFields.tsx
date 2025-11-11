import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecureFileUpload } from '@/components/forms/SecureFileUpload';
import { FileText, Upload, Building } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDocumentosEntidades } from '@/hooks/useDocumentosEntidades';

interface SocioDocumentosFieldsProps {
  socioId?: string;
  tipoPersona?: 'fisica' | 'moral';
  onDocumentosChange?: (documentos: any[]) => void;
}

const TIPOS_DOCUMENTO_SOCIO_FISICA = [
  { value: 'identificacion_oficial', label: 'Identificación Oficial (INE/IFE)', obligatorio: true },
  { value: 'constancia_fiscal', label: 'Constancia de Situación Fiscal', obligatorio: true, vencimiento: 90 },
  { value: 'comprobante_domicilio', label: 'Comprobante de Domicilio Fiscal', obligatorio: true, vencimiento: 90 },
  { value: 'curp', label: 'CURP', obligatorio: false },
];

const TIPOS_DOCUMENTO_SOCIO_MORAL = [
  { value: 'acta_constitutiva', label: 'Acta Constitutiva', obligatorio: true },
  { value: 'constancia_fiscal', label: 'Constancia de Situación Fiscal', obligatorio: true, vencimiento: 90 },
  { value: 'comprobante_domicilio', label: 'Comprobante de Domicilio Fiscal', obligatorio: true, vencimiento: 90 },
  { value: 'poder_notarial', label: 'Poder Notarial del Representante Legal', obligatorio: false },
  { value: 'identificacion_representante', label: 'Identificación del Representante Legal', obligatorio: true },
];

export function SocioDocumentosFields({ socioId, tipoPersona = 'moral', onDocumentosChange }: SocioDocumentosFieldsProps) {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const { cargarDocumentos, subirDocumento, eliminarDocumento } = useDocumentosEntidades();
  const [loading, setLoading] = useState(false);

  const tiposDocumento = tipoPersona === 'fisica' ? TIPOS_DOCUMENTO_SOCIO_FISICA : TIPOS_DOCUMENTO_SOCIO_MORAL;

  useEffect(() => {
    if (socioId) {
      loadDocumentos();
    }
  }, [socioId]);

  const loadDocumentos = async () => {
    if (!socioId) return;
    setLoading(true);
    try {
      const docs = await cargarDocumentos('socio', socioId);
      setDocumentos(docs);
      onDocumentosChange?.(docs);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, tipoDocumento: string) => {
    if (!socioId) {
      console.warn('No se puede subir documento sin ID de socio');
      return;
    }

    const docConfig = tiposDocumento.find(t => t.value === tipoDocumento);
    const fechaVencimiento = docConfig?.vencimiento 
      ? new Date(Date.now() + docConfig.vencimiento * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    try {
      await subirDocumento(file, 'socio', socioId, tipoDocumento, fechaVencimiento);
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

  const documentosObligatoriosFaltantes = tiposDocumento
    .filter(tipo => tipo.obligatorio)
    .filter(tipo => getDocumentosByTipo(tipo.value).length === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Documentos del Socio ({tipoPersona === 'fisica' ? 'Persona Física' : 'Persona Moral'})
        </CardTitle>
        <CardDescription>
          Documentación legal y fiscal requerida. Los documentos marcados con * son obligatorios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!socioId && (
          <div className="bg-muted/50 border border-muted rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-2">
            <Upload className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Primero guarda los datos básicos del socio para poder subir documentos.</p>
          </div>
        )}

        {socioId && documentosObligatoriosFaltantes.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-900">
            <p className="font-medium">Documentos obligatorios faltantes ({documentosObligatoriosFaltantes.length}):</p>
            <ul className="list-disc list-inside mt-1">
              {documentosObligatoriosFaltantes.map(doc => (
                <li key={doc.value}>{doc.label}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4">
          {tiposDocumento.map((tipo) => {
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
                      Vigencia: {tipo.vencimiento} días
                    </span>
                  )}
                </div>
                
                <SecureFileUpload
                  label=""
                  onFilesChange={(files) => files.length > 0 && handleFileUpload(files[0], tipo.value)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10}
                />

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
