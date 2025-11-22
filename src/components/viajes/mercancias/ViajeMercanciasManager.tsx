import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { DocumentUploadDialog } from '@/components/carta-porte/mercancias/DocumentUploadDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ViajeMercanciasManagerProps {
  viajeId: string;
  onMercanciasUpdate?: () => void;
}

export const ViajeMercanciasManager: React.FC<ViajeMercanciasManagerProps> = ({
  viajeId,
  onMercanciasUpdate
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [mercancias, setMercancias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ⚡ UNIFICADO: Cargar mercancías SOLO de tabla mercancias (UNA fuente de verdad)
  useEffect(() => {
    cargarMercancias();
  }, [viajeId]);
  
  const cargarMercancias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mercancias')
        .select('*')
        .eq('viaje_id', viajeId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMercancias(data || []);
    } catch (error) {
      console.error('Error cargando mercancías:', error);
      toast.error('Error cargando mercancías');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDocumentProcessed = async (mercanciasNuevas: any[]) => {
    try {
      // ⚡ UNIFICADO: Guardar directamente en tabla mercancias
      const { error } = await supabase
        .from('mercancias')
        .insert(
          mercanciasNuevas.map(m => ({
            viaje_id: viajeId,
            estado: 'borrador',
            bienes_transp: m.bienes_transp || '',
            descripcion: m.descripcion || '',
            cantidad: m.cantidad || 1,
            clave_unidad: m.clave_unidad || 'KGM',
            unidad: 'Kilogramo',
            peso_kg: m.peso_kg || 0,
            valor_mercancia: m.valor_mercancia || 0,
            material_peligroso: m.material_peligroso || false,
            moneda: m.moneda || 'MXN',
            embalaje: m.embalaje
          }))
        );
      
      if (error) throw error;
      
      toast.success(`${mercanciasNuevas.length} mercancías importadas`);
      await cargarMercancias();
      onMercanciasUpdate?.();
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error guardando mercancías:', error);
      toast.error('Error guardando mercancías');
    }
  };
  
  const handleDelete = async (mercanciaId: string) => {
    try {
      const { error } = await supabase
        .from('mercancias')
        .delete()
        .eq('id', mercanciaId);
      
      if (error) throw error;
      
      toast.success('Mercancía eliminada');
      await cargarMercancias();
      onMercanciasUpdate?.();
    } catch (error) {
      console.error('Error eliminando mercancía:', error);
      toast.error('Error eliminando mercancía');
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Cargando mercancías...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mercancías del Viaje
              <Badge variant="secondary">{mercancias.length}</Badge>
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
      {mercancias.length === 0 ? (
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
          {mercancias.map((mercancia) => (
            <Card key={mercancia.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{mercancia.descripcion}</h4>
                      <Badge variant={mercancia.estado === 'timbrada' ? 'default' : 'secondary'}>
                        {mercancia.estado === 'timbrada' ? 'Timbrada' : 'Borrador'}
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
                          {mercancia.cantidad} {mercancia.clave_unidad}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Peso:</span>
                        <p className="font-medium">{mercancia.peso_kg} kg</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor:</span>
                        <p className="font-medium">
                          ${mercancia.valor_mercancia?.toLocaleString('es-MX')} {mercancia.moneda}
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
                  
                  {mercancia.estado === 'borrador' && (
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(mercancia.id)}
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
      {mercancias.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{mercancias.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Total</p>
                <p className="text-2xl font-bold">
                  {mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0).toFixed(2)} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  ${mercancias.reduce((sum, m) => sum + (m.valor_mercancia || 0), 0).toLocaleString('es-MX')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timbradas</p>
                <p className="text-2xl font-bold">
                  {mercancias.filter(m => m.estado === 'timbrada').length}/{mercancias.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
