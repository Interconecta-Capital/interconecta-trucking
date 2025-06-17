
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface XMLPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  xmlContent: string;
}

export function XMLPreviewDialog({ open, onClose, xmlContent }: XMLPreviewDialogProps) {
  const { toast } = useToast();

  const handleCopyXML = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      toast({
        title: "XML copiado",
        description: "El contenido XML se ha copiado al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el XML al portapapeles.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadXML = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta-porte-${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "XML descargado",
      description: "El archivo XML se ha descargado correctamente.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Vista Previa XML - Carta Porte</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCopyXML}
                size="sm"
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copiar</span>
              </Button>
              <Button
                onClick={handleDownloadXML}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="outline"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50">
          <pre className="p-4 text-xs overflow-auto w-full h-full whitespace-pre-wrap font-mono">
            {xmlContent}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
