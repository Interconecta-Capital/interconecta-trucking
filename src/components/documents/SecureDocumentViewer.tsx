import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, X, Loader2, ZoomIn, ZoomOut, AlertCircle, Download } from 'lucide-react';
import { useDecryptDocument } from '@/hooks/useDecryptDocument';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface SecureDocumentViewerProps {
  tableName: 'conductores' | 'vehiculos' | 'remolques' | 'socios';
  recordId: string;
  columnName: string;
  documentLabel: string;
  open: boolean;
  onClose: () => void;
}

export function SecureDocumentViewer({
  tableName,
  recordId,
  columnName,
  documentLabel,
  open,
  onClose
}: SecureDocumentViewerProps) {
  const { decryptDocument, loading, error } = useDecryptDocument();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'image' | 'pdf' | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (open && recordId && columnName) {
      loadDocument();
    }

    return () => {
      // Cleanup: revocar URL temporal al cerrar
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [open, recordId, columnName]);

  const loadDocument = async () => {
    const result = await decryptDocument({
      tableName,
      recordId,
      columnName
    });

    if (result.success && result.documentData) {
      try {
        // El documentData viene en base64
        const base64Data = result.documentData;
        
        // Detectar tipo MIME del base64
        let mimeType = 'application/octet-stream';
        if (base64Data.startsWith('/9j/') || base64Data.startsWith('iVBOR')) {
          mimeType = base64Data.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
          setDocumentType('image');
        } else if (base64Data.startsWith('JVBER')) {
          mimeType = 'application/pdf';
          setDocumentType('pdf');
        } else {
          // Intentar determinar por extensión del columnName
          if (columnName.includes('foto') || columnName.includes('imagen')) {
            mimeType = 'image/jpeg';
            setDocumentType('image');
          }
        }

        // Convertir base64 a Blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        
        // Crear URL temporal
        const url = URL.createObjectURL(blob);
        setDocumentUrl(url);
      } catch (err) {
        console.error('Error al procesar documento:', err);
      }
    }
  };

  const handleDownload = () => {
    if (documentUrl) {
      const a = document.createElement('a');
      a.href = documentUrl;
      a.download = `${documentLabel}.${documentType === 'pdf' ? 'pdf' : 'jpg'}`;
      a.click();
    }
  };

  const handleClose = () => {
    // Limpiar datos sensibles de memoria
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl);
    }
    setDocumentUrl(null);
    setDocumentType(null);
    setZoom(100);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        {/* Header E2E Encryption - Estilo WhatsApp */}
        <div className="bg-[#128C7E] text-white px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogHeader className="p-0 space-y-0">
              <DialogTitle className="text-white flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full animate-pulse">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{documentLabel}</div>
                  <div className="text-xs text-white/90 font-normal">
                    Cifrado de extremo a extremo
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mensaje de seguridad */}
        <div className="bg-[#E8F5E9] border-b border-gray-200 px-6 py-3">
          <div className="flex items-start gap-2 text-sm">
            <Lock className="h-4 w-4 text-green-700 mt-0.5 flex-shrink-0" />
            <div className="text-green-800">
              <span className="font-medium">Documento protegido</span>
              <span className="text-green-700 block text-xs mt-0.5">
                Solo tú y los administradores autorizados pueden ver este documento. 
                La información está cifrada con AES-256-GCM.
              </span>
            </div>
          </div>
        </div>

        {/* Contenido del documento */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {loading && (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-medium">Descifrando documento...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este proceso es seguro y puede tomar unos segundos
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mx-auto max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error al descifrar el documento: {error}
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && documentUrl && (
            <div className="space-y-4">
              {/* Controles */}
              {documentType === 'image' && (
                <div className="flex items-center justify-between bg-background border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Cifrado
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Zoom: {zoom}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(50, zoom - 25))}
                      disabled={zoom <= 50}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 25))}
                      disabled={zoom >= 200}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              )}

              {/* Vista del documento */}
              <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[500px]">
                {documentType === 'image' && (
                  <img
                    src={documentUrl}
                    alt={documentLabel}
                    style={{ 
                      maxWidth: `${zoom}%`,
                      height: 'auto',
                      maxHeight: '70vh'
                    }}
                    className="rounded-lg shadow-lg"
                  />
                )}
                {documentType === 'pdf' && (
                  <iframe
                    src={documentUrl}
                    className="w-full h-[600px] rounded-lg shadow-lg"
                    title={documentLabel}
                  />
                )}
              </div>

              {/* Footer con metadata */}
              <div className="bg-background border rounded-lg p-4 text-sm text-muted-foreground">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Tabla:</span> {tableName}
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span> {documentType === 'pdf' ? 'PDF' : 'Imagen'}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Campo:</span> {columnName}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
