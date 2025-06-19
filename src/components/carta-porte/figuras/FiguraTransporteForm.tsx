
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiguraCompleta } from '@/types/cartaPorte';

interface FiguraTransporteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  figura: FiguraCompleta | null;
  onSave: (figura: FiguraCompleta) => void;
}

export function FiguraTransporteForm({
  open,
  onOpenChange,
  figura,
  onSave
}: FiguraTransporteFormProps) {
  const [formData, setFormData] = useState<FiguraCompleta>({
    id: '',
    tipo_figura: '01',
    rfc_transportista: '',
    nombre_transportista: '',
    carta_porte_id: undefined
  });

  useEffect(() => {
    if (figura) {
      setFormData(figura);
    } else {
      setFormData({
        id: crypto.randomUUID(),
        tipo_figura: '01',
        rfc_transportista: '',
        nombre_transportista: '',
        carta_porte_id: undefined
      });
    }
  }, [figura]);

  const handleChange = (field: keyof FiguraCompleta, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {figura ? 'Editar Figura de Transporte' : 'Agregar Figura de Transporte'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Figura *</Label>
              <Select
                value={formData.tipo_figura}
                onValueChange={(value) => handleChange('tipo_figura', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">01 - Operador</SelectItem>
                  <SelectItem value="02">02 - Propietario</SelectItem>
                  <SelectItem value="03">03 - Arrendador</SelectItem>
                  <SelectItem value="04">04 - Notificado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>RFC Transportista *</Label>
              <Input
                value={formData.rfc_transportista}
                onChange={(e) => handleChange('rfc_transportista', e.target.value.toUpperCase())}
                placeholder="RFC del transportista"
                maxLength={13}
                className="uppercase"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre Transportista</Label>
            <Input
              value={formData.nombre_transportista || ''}
              onChange={(e) => handleChange('nombre_transportista', e.target.value)}
              placeholder="Nombre completo o razón social"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número de Licencia</Label>
              <Input
                value={formData.num_licencia || ''}
                onChange={(e) => handleChange('num_licencia', e.target.value)}
                placeholder="Número de licencia"
              />
            </div>

            <div className="space-y-2">
              <Label>RFC Figura</Label>
              <Input
                value={formData.rfc_figura || ''}
                onChange={(e) => handleChange('rfc_figura', e.target.value.toUpperCase())}
                placeholder="RFC de la figura"
                maxLength={13}
                className="uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
