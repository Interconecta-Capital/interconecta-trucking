
import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Upload, FileText, Calendar } from 'lucide-react';
import { useDocumentosEntidades, type DocumentoEntidad } from '@/hooks/useDocumentosEntidades';
import { toast } from 'sonner';

interface DocumentUploadProps {
  entidadTipo: 'vehiculo' | 'conductor' | 'socio';
  entidadId: string;
  documentos: DocumentoEntidad[];
  onDocumentosChange: () => void;
}

const TIPOS_DOCUMENTO = {
  vehiculo: [
    'Tarjeta de Circulación',
    'Factura',
    'Verificación Vehicular',
    'Póliza de Seguro',
    'Permiso SCT',
    'Acta GPS'
  ],
  conductor: [
    'Licencia de Conducir',
    'CURP',
    'INE',
    'Comprobante de Domicilio',
    'Certificado Médico',
    'Antecedentes No Penales'
  ],
  socio: [
    'Acta Constitutiva',
    'RFC',
    'Comprobante de Domicilio',
    'Poder Notarial',
    'Cédula Fiscal',
    'Estados Financieros'
  ]
};

export const DocumentUpload = memo(({ entidadTipo, entidadId, documentos, onDocumentosChange }: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const { subirDocumento, eliminarDocumento, isLoading } = useDocumentosEntidades();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es muy grande. Máximo 10MB permitido.');
        return;
      }
      
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de archivo no permitido. Solo PDF, JPG y PNG.');
        return;
      }
      
      setSelectedFile(file);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !tipoDocumento) {
      toast.error('Selecciona un archivo y tipo de documento');
      return;
    }

    console.log('Uploading document:', { selectedFile: selectedFile.name, tipoDocumento, entidadTipo, entidadId });

    const resultado = await subirDocumento(
      selectedFile,
      entidadTipo,
      entidadId,
      tipoDocumento,
      fechaVencimiento || undefined
    );

    if (resultado) {
      setSelectedFile(null);
      setTipoDocumento('');
      setFechaVencimiento('');
      onDocumentosChange();
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  }, [selectedFile, tipoDocumento, fechaVencimiento, entidadTipo, entidadId, subirDocumento, onDocumentosChange]);

  const handleEliminar = useCallback(async (documentoId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      console.log('Deleting document:', documentoId);
      await eliminarDocumento(documentoId);
      onDocumentosChange();
    }
  }, [eliminarDocumento, onDocumentosChange]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario para subir documento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
          <div>
            <Label htmlFor="tipo-documento">Tipo de Documento</Label>
            <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_DOCUMENTO[entidadTipo].map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fecha-vencimiento">Fecha de Vencimiento (Opcional)</Label>
            <Input
              id="fecha-vencimiento"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="file-upload">Archivo</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !tipoDocumento || isLoading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? 'Subiendo...' : 'Subir Documento'}
            </Button>
          </div>
        </div>

        {/* Lista de documentos existentes */}
        {documentos.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Documentos Existentes</h4>
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{doc.tipo_documento}</p>
                  <p className="text-sm text-muted-foreground">{doc.nombre_archivo}</p>
                  {doc.fecha_vencimiento && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Vence: {new Date(doc.fecha_vencimiento).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEliminar(doc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DocumentUpload.displayName = 'DocumentUpload';
