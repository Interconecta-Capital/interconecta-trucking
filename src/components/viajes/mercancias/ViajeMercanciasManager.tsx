import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Upload, Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { DocumentUploadDialog } from '@/components/carta-porte/mercancias/DocumentUploadDialog';

interface ViajeMercanciasManagerProps {
  viajeId: string;
  mercanciasTracking: any[];
  mercanciasCartaPorte: any[];
  onMercanciasUpdate: (mercancias: any[]) => void;
}

export const ViajeMercanciasManager: React.FC<ViajeMercanciasManagerProps> = ({
  viajeId,
  mercanciasTracking = [],
  mercanciasCartaPorte = [],
  onMercanciasUpdate
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // Combinar mercancías de ambas fuentes
  const todasMercancias = [
    ...mercanciasCartaPorte.map(m => ({ ...m, fuente: 'carta_porte', editable: false })),
    ...mercanciasTracking.map(m => ({ ...m, fuente: 'tracking', editable: true }))
  ];
  
  const handleDocumentProcessed = (mercanciasNuevas: any[]) => {
    // Agregar mercancías procesadas al viaje
    onMercanciasUpdate([...mercanciasTracking, ...mercanciasNuevas]);
    setShowUploadDialog(false);
  };
  
  const handleDelete = (index: number) => {
    const nuevasMercancias = mercanciasTracking.filter((_, i) => i !== index);
    onMercanciasUpdate(nuevasMercancias);
  };
  
  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mercancías del Viaje
              <Badge variant="secondary">{todasMercancias.length}</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cargar Documento
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Lista de mercancías */}
      {todasMercancias.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground mb-4">
              No hay mercancías registradas para este viaje
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Puedes cargar un documento (PDF, Excel, CSV, XML o imagen) para extraer las mercancías automáticamente
            </p>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Cargar Documento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {todasMercancias.map((mercancia, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{mercancia.descripcion}</h4>
                      <Badge variant={mercancia.fuente === 'carta_porte' ? 'default' : 'secondary'}>
                        {mercancia.fuente === 'carta_porte' ? 'En Carta Porte' : 'Pendiente'}
                      </Badge>
                      {mercancia.material_peligroso && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Material Peligroso
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cantidad:</span>
                        <p className="font-medium">
                          {mercancia.cantidad} {mercancia.clave_unidad || mercancia.unidad}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Peso:</span>
                        <p className="font-medium">{mercancia.peso_kg} kg</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor:</span>
                        <p className="font-medium">
                          ${mercancia.valor_mercancia?.toLocaleString('es-MX')} {mercancia.moneda || 'MXN'}
                        </p>
                      </div>
                      {mercancia.bienes_transp && (
                        <div>
                          <span className="text-muted-foreground">Clave SAT:</span>
                          <p className="font-medium font-mono text-xs">{mercancia.bienes_transp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {mercancia.editable && (
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Dialog para cargar documentos */}
      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onDocumentProcessed={handleDocumentProcessed}
        cartaPorteId={undefined}
      />
      
      {/* Resumen */}
      {todasMercancias.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{todasMercancias.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Total</p>
                <p className="text-2xl font-bold">
                  {todasMercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0).toFixed(2)} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  ${todasMercancias.reduce((sum, m) => sum + (m.valor_mercancia || 0), 0).toLocaleString('es-MX')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Carta Porte</p>
                <p className="text-2xl font-bold">
                  {mercanciasCartaPorte.length}/{todasMercancias.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
