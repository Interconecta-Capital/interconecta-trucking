
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Trash2, Calendar, User, MapPin } from 'lucide-react';
import { useViajes } from '@/hooks/useViajes';
import { useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function BorradoresSection() {
  const { borradorActivo, loadingBorrador, eliminarBorrador } = useViajes();
  const { openViajeWizard } = useViajeWizardModal();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (loadingBorrador) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Borradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!borradorActivo) {
    return null; // No mostrar la sección si no hay borradores
  }

  const handleContinuarBorrador = () => {
    // El ViajeWizard detectará automáticamente el borrador activo
    openViajeWizard();
  };

  const handleEliminarBorrador = () => {
    eliminarBorrador(borradorActivo.id);
    setShowDeleteDialog(false);
    toast.success('Borrador eliminado exitosamente');
  };

  // Extraer información del tracking_data
  const trackingData = borradorActivo.tracking_data as any;
  const clienteNombre = trackingData?.cliente?.nombre_razon_social || 'Cliente no definido';
  const origen = trackingData?.origen?.domicilio?.municipio || borradorActivo.origen || 'Origen pendiente';
  const destino = trackingData?.destino?.domicilio?.municipio || borradorActivo.destino || 'Destino pendiente';
  const stepProgress = trackingData?.currentStep || 1;

  return (
    <>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <FileText className="h-5 w-5" />
            Borrador Guardado
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              Paso {stepProgress}/5
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Cliente</p>
                <p className="text-amber-700">{clienteNombre}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Ruta</p>
                <p className="text-amber-700">{origen} → {destino}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Guardado</p>
                <p className="text-amber-700">
                  {new Date(borradorActivo.updated_at).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleContinuarBorrador}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Continuar Editando
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-amber-600 bg-amber-100 p-2 rounded">
            💡 <strong>Tip:</strong> Los borradores te permiten guardar tu progreso y continuar más tarde. 
            No aparecen en la lista de viajes hasta que los finalices.
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar borrador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El borrador y todo su progreso se perderán permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEliminarBorrador}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Borrador
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
