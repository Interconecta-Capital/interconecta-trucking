
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePlantillas } from '@/hooks/usePlantillas';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { toast } from 'sonner';
import { Save, Globe, FileText } from 'lucide-react';

interface GuardarPlantillaDialogProps {
  open: boolean;
  onClose: () => void;
  cartaPorteData: CartaPorteData;
}

export function GuardarPlantillaDialog({ 
  open, 
  onClose, 
  cartaPorteData 
}: GuardarPlantillaDialogProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esPublica, setEsPublica] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { guardarPlantilla } = usePlantillas();

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre de la plantilla es requerido');
      return;
    }

    setSaving(true);
    try {
      await guardarPlantilla(nombre, descripcion, cartaPorteData, esPublica);
      toast.success('Plantilla guardada exitosamente');
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Error al guardar la plantilla');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setEsPublica(false);
  };

  const getResumenDatos = () => {
    return {
      ubicaciones: cartaPorteData.ubicaciones?.length || 0,
      mercancias: cartaPorteData.mercancias?.length || 0,
      tieneTransporte: !!cartaPorteData.autotransporte?.placaVm,
      figuras: cartaPorteData.figuras?.length || 0
    };
  };

  const resumen = getResumenDatos();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>Guardar como Plantilla</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumen de lo que se va a guardar */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Contenido de la Plantilla:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>📍 {resumen.ubicaciones} ubicaciones</div>
              <div>📦 {resumen.mercancias} mercancías</div>
              <div>🚛 {resumen.tieneTransporte ? 'Con vehículo' : 'Sin vehículo'}</div>
              <div>👥 {resumen.figuras} figuras</div>
            </div>
          </div>

          {/* Nombre de la plantilla */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Plantilla *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Ruta CDMX - Guadalajara"
              maxLength={100}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe cuándo usar esta plantilla..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Plantilla pública */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <Label htmlFor="publica" className="font-medium">
                  Plantilla Pública
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Otros usuarios podrán usar esta plantilla
              </p>
            </div>
            <Switch
              id="publica"
              checked={esPublica}
              onCheckedChange={setEsPublica}
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleGuardar}
              disabled={saving || !nombre.trim()}
              className="flex-1"
            >
              {saving ? 'Guardando...' : 'Guardar Plantilla'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
