
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartaPorteBreadcrumbs } from '../navigation/CartaPorteBreadcrumbs';
import { toast } from 'sonner';

interface CartaPorteHeaderMejoradoProps {
  borradorCargado: boolean;
  ultimoGuardado: Date | null;
  isSaving: boolean;
  currentStep?: number;
  currentCartaPorteId?: string;
  onGuardarBorrador: () => Promise<void>;
  onGuardarYSalir: () => Promise<void>;
  onLimpiarBorrador: () => Promise<void>;
}

export function CartaPorteHeaderMejorado({
  borradorCargado,
  ultimoGuardado,
  isSaving,
  currentStep,
  currentCartaPorteId,
  onGuardarBorrador,
  onGuardarYSalir,
  onLimpiarBorrador,
}: CartaPorteHeaderMejoradoProps) {
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate('/cartas-porte');
  };

  const handleGuardarYSalir = async () => {
    try {
      await onGuardarYSalir();
      toast.success('Borrador guardado correctamente');
      navigate('/cartas-porte');
    } catch (error) {
      toast.error('Error al guardar el borrador');
    }
  };

  const handleLimpiarBorrador = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este borrador? Esta acción no se puede deshacer.')) {
      try {
        await onLimpiarBorrador();
        toast.success('Borrador eliminado');
        navigate('/cartas-porte');
      } catch (error) {
        toast.error('Error al eliminar el borrador');
      }
    }
  };

  const formatFechaGuardado = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border-b sticky top-0 z-40">
      {/* Breadcrumbs */}
      <CartaPorteBreadcrumbs 
        cartaPorteId={currentCartaPorteId}
        currentStep={currentStep}
        borradorCargado={borradorCargado}
      />
      
      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-t bg-gray-50/50">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVolver}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a Lista</span>
          </Button>
          
          {borradorCargado && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Editando Borrador
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Estado de guardado */}
          {ultimoGuardado && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isSaving ? (
                <>
                  <Clock className="h-3 w-3 animate-pulse" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Guardado {formatFechaGuardado(ultimoGuardado)}</span>
                </>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onGuardarBorrador}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Guardar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleGuardarYSalir}
              disabled={isSaving}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Guardar y Salir</span>
            </Button>

            {borradorCargado && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLimpiarBorrador}
                disabled={isSaving}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
