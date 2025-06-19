
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar, Edit, Trash2, Download, Copy } from 'lucide-react';
import { useCartaPorteLifecycle } from '@/hooks/cartaPorte/useCartaPorteLifecycle';
import { BorradorCard } from './BorradorCard';
import { ConvertirBorradorDialog } from './ConvertirBorradorDialog';
import { EliminarBorradorDialog } from './EliminarBorradorDialog';
import { BorradorCartaPorte } from '@/types/cartaPorteLifecycle';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function BorradoresManager() {
  const navigate = useNavigate();
  const {
    borradores,
    isLoading,
    listarBorradores,
    crearBorrador,
    eliminarBorrador,
    convertirBorradorACartaPorte
  } = useCartaPorteLifecycle();

  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBorrador, setSelectedBorrador] = useState<BorradorCartaPorte | null>(null);

  useEffect(() => {
    listarBorradores();
  }, [listarBorradores]);

  const handleCrearNuevoBorrador = async () => {
    try {
      const nuevoBorrador = await crearBorrador();
      navigate(`/carta-porte/${nuevoBorrador.id}`);
    } catch (error) {
      console.error('Error creando borrador:', error);
    }
  };

  const handleEditarBorrador = (borrador: BorradorCartaPorte) => {
    navigate(`/carta-porte/${borrador.id}`);
  };

  const handleConvertirBorrador = (borrador: BorradorCartaPorte) => {
    setSelectedBorrador(borrador);
    setShowConvertDialog(true);
  };

  const handleEliminarBorrador = (borrador: BorradorCartaPorte) => {
    setSelectedBorrador(borrador);
    setShowDeleteDialog(true);
  };

  const handleConfirmarConversion = async (nombreDocumento: string, validarDatos: boolean) => {
    if (!selectedBorrador) return;

    try {
      const cartaPorte = await convertirBorradorACartaPorte({
        borradorId: selectedBorrador.id,
        nombre_documento: nombreDocumento,
        validarDatos
      });

      setShowConvertDialog(false);
      setSelectedBorrador(null);
      
      toast.success(`Carta Porte creada exitosamente con IdCCP: ${cartaPorte.id_ccp}`);
      
      // Refrescar la lista
      listarBorradores();
    } catch (error) {
      console.error('Error convirtiendo borrador:', error);
    }
  };

  const handleConfirmarEliminacion = async () => {
    if (!selectedBorrador) return;

    try {
      await eliminarBorrador(selectedBorrador.id);
      setShowDeleteDialog(false);
      setSelectedBorrador(null);
    } catch (error) {
      console.error('Error eliminando borrador:', error);
    }
  };

  const handleDuplicarBorrador = async (borrador: BorradorCartaPorte) => {
    try {
      const nuevoBorrador = await crearBorrador({
        nombre_borrador: `${borrador.nombre_borrador} (Copia)`,
        datos_formulario: borrador.datos_formulario,
        version_formulario: borrador.version_formulario
      });
      
      navigate(`/carta-porte/${nuevoBorrador.id}`);
    } catch (error) {
      console.error('Error duplicando borrador:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Borradores</h1>
          <p className="text-muted-foreground mt-1">
            Administra tus borradores de Carta Porte y conviértelos en documentos oficiales
          </p>
        </div>
        <Button onClick={handleCrearNuevoBorrador} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Borrador
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{borradores.length}</p>
                <p className="text-sm text-muted-foreground">Total Borradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {borradores.filter(b => {
                    const hoy = new Date();
                    const ultimaEdicion = new Date(b.ultima_edicion);
                    return hoy.getTime() - ultimaEdicion.getTime() < 24 * 60 * 60 * 1000;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Editados Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {borradores.filter(b => b.auto_saved).length}
                </p>
                <p className="text-sm text-muted-foreground">Auto-guardados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de borradores */}
      <Card>
        <CardHeader>
          <CardTitle>Borradores Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Cargando borradores...</p>
              </div>
            </div>
          ) : borradores.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No hay borradores</h3>
                <p className="text-muted-foreground">Crea tu primer borrador para comenzar</p>
              </div>
              <Button onClick={handleCrearNuevoBorrador} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Primer Borrador
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {borradores.map((borrador) => (
                <BorradorCard
                  key={borrador.id}
                  borrador={borrador}
                  onEditar={() => handleEditarBorrador(borrador)}
                  onConvertir={() => handleConvertirBorrador(borrador)}
                  onEliminar={() => handleEliminarBorrador(borrador)}
                  onDuplicar={() => handleDuplicarBorrador(borrador)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogos */}
      <ConvertirBorradorDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        borrador={selectedBorrador}
        onConfirmar={handleConfirmarConversion}
      />

      <EliminarBorradorDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        borrador={selectedBorrador}
        onConfirmar={handleConfirmarEliminacion}
      />
    </div>
  );
}
