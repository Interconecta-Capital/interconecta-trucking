
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Eye, X } from 'lucide-react';

interface PDFPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  onDownload: () => void;
  title?: string;
}

export function PDFPreviewDialog({
  open,
  onClose,
  pdfUrl,
  onDownload,
  title = 'Previsualización PDF'
}: PDFPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>{title}</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onDownload}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="PDF Preview"
            style={{ border: 'none' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
