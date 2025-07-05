
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useGestionOperadores } from '@/hooks/useGestionOperadores';
import { CalificacionConductor } from '@/types/operadores';

interface CalificacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductorId: string;
  conductorNombre: string;
  viajeId?: string;
  clienteId?: string;
}

export function CalificacionForm({
  open,
  onOpenChange,
  conductorId,
  conductorNombre,
  viajeId,
  clienteId
}: CalificacionFormProps) {
  const { crearCalificacion } = useGestionOperadores();
  const [calificacion, setCalificacion] = useState(5);
  const [comentarios, setComentarios] = useState('');
  const [criterios, setCriterios] = useState({
    puntualidad: 5,
    trato: 5,
    cuidado_carga: 5,
    comunicacion: 5,
    profesionalismo: 5
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nuevaCalificacion: Omit<CalificacionConductor, 'id' | 'created_at' | 'user_id'> = {
        conductor_id: conductorId,
        viaje_id: viajeId,
        cliente_id: clienteId,
        calificacion,
        comentarios,
        tipo_calificacion: 'cliente_a_conductor',
        criterios
      };

      await crearCalificacion(nuevaCalificacion);
      onOpenChange(false);
      
      // Reset form
      setCalificacion(5);
      setComentarios('');
      setCriterios({
        puntualidad: 5,
        trato: 5,
        cuidado_carga: 5,
        comunicacion: 5,
        profesionalismo: 5
      });
    } catch (error) {
      console.error('Error al crear calificación:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (
    value: number, 
    onChange: (rating: number) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="hover:scale-110 transition-transform"
          >
            <Star
              className={`h-5 w-5 ${
                star <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({value}/5)</span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Calificar a {conductorNombre}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Calificación general */}
          <div className="text-center">
            {renderStarRating(
              calificacion, 
              setCalificacion, 
              'Calificación General'
            )}
          </div>

          {/* Criterios específicos */}
          <div className="space-y-4">
            <h4 className="font-medium">Criterios Específicos</h4>
            
            {renderStarRating(
              criterios.puntualidad,
              (rating) => setCriterios(prev => ({ ...prev, puntualidad: rating })),
              'Puntualidad'
            )}
            
            {renderStarRating(
              criterios.trato,
              (rating) => setCriterios(prev => ({ ...prev, trato: rating })),
              'Trato al Cliente'
            )}
            
            {renderStarRating(
              criterios.cuidado_carga,
              (rating) => setCriterios(prev => ({ ...prev, cuidado_carga: rating })),
              'Cuidado de la Carga'
            )}
            
            {renderStarRating(
              criterios.comunicacion,
              (rating) => setCriterios(prev => ({ ...prev, comunicacion: rating })),
              'Comunicación'
            )}
            
            {renderStarRating(
              criterios.profesionalismo,
              (rating) => setCriterios(prev => ({ ...prev, profesionalismo: rating })),
              'Profesionalismo'
            )}
          </div>

          {/* Comentarios */}
          <div className="space-y-2">
            <Label htmlFor="comentarios">Comentarios (opcional)</Label>
            <Textarea
              id="comentarios"
              placeholder="Comparte tu experiencia con este conductor..."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
