
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, Download, FileText, MoreHorizontal, RefreshCw, Zap } from 'lucide-react';
import { XMLPreviewDialog } from './XMLPreviewDialog';
import { CartaPortePDFAdvanced } from '@/services/pdfGenerator/CartaPortePDFAdvanced';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface CartaPorte {
  id: string;
  folio: string;
  rfc_emisor: string;
  rfc_receptor: string;
  status: string;
  created_at: string;
  xml_generado?: string;
  datos_formulario?: any;
  nombre_emisor?: string;
  nombre_receptor?: string;
}

interface CartasPorteTableAdvancedProps {
  cartasPorte: CartaPorte[];
  loading: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRegenerateXML?: (id: string) => void;
  onGeneratePDF?: (id: string) => void;
  pdfLinks?: Record<string, string>;
}

export function CartasPorteTableAdvanced({
  cartasPorte,
  loading,
  onEdit,
  onDelete,
  onRegenerateXML,
  onGeneratePDF,
  pdfLinks
}: CartasPorteTableAdvancedProps) {
  const [selectedXML, setSelectedXML] = useState<string | null>(null);
  const [showXMLDialog, setShowXMLDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cartaToDelete, setCartaToDelete] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'borrador': return 'secondary';
      case 'completa': return 'default';
      case 'timbrada': return 'default';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'timbrada': return <Zap className="h-3 w-3" />;
      case 'completa': return <FileText className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleViewXML = (carta: CartaPorte) => {
    if (carta.xml_generado) {
      setSelectedXML(carta.xml_generado);
      setShowXMLDialog(true);
    } else {
      toast({
        title: "XML no disponible",
        description: "Esta carta porte no tiene XML generado aún.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async (carta: CartaPorte) => {
    if (onGeneratePDF) {
      onGeneratePDF(carta.id);
    } else if (!carta.datos_formulario) {
      toast({
        title: "Error",
        description: "No hay datos suficientes para generar el PDF.",
        variant: "destructive"
      });
      return;
    } else {
      // Fallback to local PDF generation if no onGeneratePDF prop
      setGeneratingPDF(carta.id);
      try {
        const result = await CartaPortePDFAdvanced.generarPDF(carta.datos_formulario);
        
        if (result.success && result.pdfBlob) {
          CartaPortePDFAdvanced.descargarPDF(result.pdfBlob, `carta-porte-${carta.folio || carta.id.slice(-8)}.pdf`);
          toast({
            title: "PDF generado",
            description: "El PDF se ha descargado correctamente.",
          });
        } else {
          throw new Error(result.error || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error generando PDF:', error);
        toast({
          title: "Error generando PDF",
          description: "No se pudo generar el PDF. Intenta nuevamente.",
          variant: "destructive"
        });
      } finally {
        setGeneratingPDF(null);
      }
    }
  };

  const handleDelete = (id: string) => {
    setCartaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (cartaToDelete && onDelete) {
      onDelete(cartaToDelete);
      setDeleteDialogOpen(false);
      setCartaToDelete(null);
    }
  };

  const generateFolio = (carta: CartaPorte) => {
    return carta.folio || `CP-${carta.id.slice(-8).toUpperCase()}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando cartas de porte...</div>
        </CardContent>
      </Card>
    );
  }

  if (cartasPorte.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay cartas de porte registradas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cartas de Porte</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID / Folio</TableHead>
                <TableHead>Emisor</TableHead>
                <TableHead>Receptor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartasPorte.map((carta) => (
                <TableRow key={carta.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-mono text-sm font-medium">
                        {generateFolio(carta)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {carta.id.slice(-8)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{carta.nombre_emisor || 'Sin nombre'}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {carta.rfc_emisor}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{carta.nombre_receptor || 'Sin nombre'}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {carta.rfc_receptor}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(carta.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(carta.status)}
                      {carta.status || 'Borrador'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(carta.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(carta.created_at).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewXML(carta)}
                        disabled={!carta.xml_generado}
                        className="h-8"
                      >
                        <FileText className="h-4 w-4" />
                        XML
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(carta)}
                        disabled={generatingPDF === carta.id}
                        className="h-8"
                      >
                        {generatingPDF === carta.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        PDF
                      </Button>
                      {pdfLinks && pdfLinks[carta.id] && (
                        <a
                          href={pdfLinks[carta.id]}
                          download={`carta-porte-${carta.folio || carta.id.slice(-8)}.pdf`}
                          className="text-xs text-blue-600 underline"
                        >
                          Descargar
                        </a>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(carta.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => window.open(`/cartas-porte/${carta.id}/view`, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          
                          {onRegenerateXML && (
                            <DropdownMenuItem onClick={() => onRegenerateXML(carta.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerar XML
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => handleDelete(carta.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <XMLPreviewDialog
        open={showXMLDialog}
        onClose={() => setShowXMLDialog(false)}
        xmlContent={selectedXML || ''}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar carta porte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la carta porte
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
