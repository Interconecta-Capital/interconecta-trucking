
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UbicacionCompleta, Domicilio } from '@/types/cartaPorte';

interface UbicacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ubicacion?: UbicacionCompleta;
  onSave: (ubicacion: UbicacionCompleta) => void;
  tipo?: 'Origen' | 'Destino' | 'Paso Intermedio';
}

export function UbicacionFormDialog({
  open,
  onOpenChange,
  ubicacion,
  onSave,
  tipo
}: UbicacionFormDialogProps) {
  const [formData, setFormData] = useState<UbicacionCompleta>({
    id: crypto.randomUUID(),
    tipo_estacion: '01',
    id_ubicacion: '',
    tipo_ubicacion: tipo || 'Origen',
    rfc_remitente_destinatario: '',
    nombre_remitente_destinatario: '',
    fecha_hora_salida_llegada: new Date().toISOString().slice(0, 16),
    distancia_recorrida: 0,
    domicilio: {
      pais: 'MEX',
      codigo_postal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numero_exterior: ''
    }
  });

  useEffect(() => {
    if (ubicacion) {
      setFormData({
        ...ubicacion,
        tipo_estacion: ubicacion.tipo_estacion || '01'
      });
    } else {
      setFormData({
        id: crypto.randomUUID(),
        tipo_estacion: '01',
        id_ubicacion: '',
        tipo_ubicacion: tipo || 'Origen',
        rfc_remitente_destinatario: '',
        nombre_remitente_destinatario: '',
        fecha_hora_salida_llegada: new Date().toISOString().slice(0, 16),
        distancia_recorrida: 0,
        domicilio: {
          pais: 'MEX',
          codigo_postal: '',
          estado: '',
          municipio: '',
          colonia: '',
          calle: '',
          numero_exterior: ''
        }
      });
    }
  }, [ubicacion, tipo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleDomicilioChange = (field: keyof Domicilio, value: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ubicacion ? 'Editar' : 'Agregar'} Ubicación - {formData.tipo_ubicacion}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Estación</Label>
            <Select
              value={formData.tipo_estacion}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_estacion: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de estación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">Terminal de carga</SelectItem>
                <SelectItem value="02">Puerto marítimo</SelectItem>
                <SelectItem value="03">Aeropuerto</SelectItem>
                <SelectItem value="04">Terminal ferroviaria</SelectItem>
                <SelectItem value="05">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ID Ubicación</Label>
              <Input
                value={formData.id_ubicacion}
                onChange={(e) => setFormData(prev => ({ ...prev, id_ubicacion: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>RFC Remitente/Destinatario</Label>
              <Input
                value={formData.rfc_remitente_destinatario}
                onChange={(e) => setFormData(prev => ({ ...prev, rfc_remitente_destinatario: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre Remitente/Destinatario</Label>
            <Input
              value={formData.nombre_remitente_destinatario}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre_remitente_destinatario: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha/Hora Salida/Llegada</Label>
              <Input
                type="datetime-local"
                value={formData.fecha_hora_salida_llegada}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_hora_salida_llegada: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Distancia Recorrida (km)</Label>
              <Input
                type="number"
                value={formData.distancia_recorrida}
                onChange={(e) => setFormData(prev => ({ ...prev, distancia_recorrida: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <h4 className="text-sm font-medium">Domicilio</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Input
                value={formData.domicilio.pais}
                onChange={(e) => handleDomicilioChange('pais', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Código Postal</Label>
              <Input
                value={formData.domicilio.codigo_postal}
                onChange={(e) => handleDomicilioChange('codigo_postal', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={formData.domicilio.estado}
                onChange={(e) => handleDomicilioChange('estado', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Municipio</Label>
              <Input
                value={formData.domicilio.municipio}
                onChange={(e) => handleDomicilioChange('municipio', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Colonia</Label>
              <Input
                value={formData.domicilio.colonia}
                onChange={(e) => handleDomicilioChange('colonia', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Calle</Label>
              <Input
                value={formData.domicilio.calle}
                onChange={(e) => handleDomicilioChange('calle', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número Exterior</Label>
              <Input
                value={formData.domicilio.numero_exterior}
                onChange={(e) => handleDomicilioChange('numero_exterior', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {ubicacion ? 'Actualizar' : 'Agregar'} Ubicación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
