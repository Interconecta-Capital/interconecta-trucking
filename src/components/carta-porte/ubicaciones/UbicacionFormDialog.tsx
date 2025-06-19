
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { UbicacionIdGenerator } from './utils/ubicacionIdGenerator';
import { createDefaultUbicacion } from './utils/ubicacionTypeConverters';

interface UbicacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ubicacion?: UbicacionCompleta | null;
  onSave: (ubicacion: UbicacionCompleta) => void;
  ubicacionesExistentes?: UbicacionCompleta[];
}

export function UbicacionFormDialog({
  open,
  onOpenChange,
  ubicacion,
  onSave,
  ubicacionesExistentes = []
}: UbicacionFormDialogProps) {
  const [formData, setFormData] = useState<UbicacionCompleta>(
    ubicacion || createDefaultUbicacion()
  );
  const [useManualId, setUseManualId] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ubicacion) {
      setFormData(ubicacion);
      setUseManualId(!!ubicacion.id_ubicacion);
    } else {
      const newUbicacion = createDefaultUbicacion();
      setFormData(newUbicacion);
      setUseManualId(false);
    }
  }, [ubicacion, open]);

  // Generar ID automático cuando cambia el tipo de ubicación
  useEffect(() => {
    if (!useManualId && formData.tipo_ubicacion) {
      const autoId = UbicacionIdGenerator.generateAutoId(
        formData.tipo_ubicacion,
        ubicacionesExistentes
      );
      setFormData(prev => ({ ...prev, id_ubicacion: autoId }));
    }
  }, [formData.tipo_ubicacion, useManualId, ubicacionesExistentes]);

  const handleTipoChange = (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => {
    setFormData(prev => ({ ...prev, tipo_ubicacion: tipo }));
  };

  const handleIdChange = (id: string) => {
    setFormData(prev => ({ ...prev, id_ubicacion: id }));
    
    // Validar ID manual
    if (useManualId && formData.tipo_ubicacion) {
      const validation = UbicacionIdGenerator.validateManualId(id, formData.tipo_ubicacion);
      if (!validation.valido) {
        setErrors(prev => ({ ...prev, id_ubicacion: validation.mensaje || '' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.id_ubicacion;
          return newErrors;
        });
      }
    }
  };

  const handleDomicilioChange = (campo: keyof DomicilioUnificado, valor: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        // Map the unified form field names to our ubicacion structure
        ...(campo === 'codigoPostal' ? { codigo_postal: valor } : {}),
        ...(campo === 'numExterior' ? { numero_exterior: valor } : {}),
        ...(campo === 'numInterior' ? { numero_interior: valor } : {}),
        ...(campo === 'pais' ? { pais: valor } : {}),
        ...(campo === 'estado' ? { estado: valor } : {}),
        ...(campo === 'municipio' ? { municipio: valor } : {}),
        ...(campo === 'localidad' ? { localidad: valor } : {}),
        ...(campo === 'colonia' ? { colonia: valor } : {}),
        ...(campo === 'calle' ? { calle: valor } : {}),
        ...(campo === 'referencia' ? { referencia: valor } : {})
      }
    }));
  };

  const handleDistanciaChange = (distancia: string) => {
    const valor = parseFloat(distancia) || 0;
    setFormData(prev => ({ ...prev, distancia_recorrida: valor }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo_ubicacion) {
      newErrors.tipo_ubicacion = 'Seleccione el tipo de ubicación';
    }

    if (!formData.id_ubicacion) {
      newErrors.id_ubicacion = 'El ID de ubicación es requerido';
    } else {
      // Verificar duplicados
      const isDuplicated = UbicacionIdGenerator.isIdDuplicated(
        formData.id_ubicacion,
        ubicacionesExistentes,
        formData.id
      );
      if (isDuplicated) {
        newErrors.id_ubicacion = 'Este ID ya existe en otra ubicación';
      }

      // Validar formato si es manual
      if (useManualId && formData.tipo_ubicacion) {
        const validation = UbicacionIdGenerator.validateManualId(
          formData.id_ubicacion,
          formData.tipo_ubicacion
        );
        if (!validation.valido) {
          newErrors.id_ubicacion = validation.mensaje || 'ID inválido';
        }
      }
    }

    if (!formData.domicilio?.codigo_postal) {
      newErrors.codigo_postal = 'El código postal es requerido';
    }

    if (!formData.domicilio?.municipio) {
      newErrors.municipio = 'El municipio es requerido';
    }

    if (!formData.domicilio?.calle) {
      newErrors.calle = 'La calle es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  const getSuggestions = () => {
    if (!formData.tipo_ubicacion) return [];
    return UbicacionIdGenerator.getSuggestions(formData.tipo_ubicacion, ubicacionesExistentes);
  };

  // Convert ubicacion domicilio to unified form format
  const domicilioUnificado: DomicilioUnificado = {
    pais: formData.domicilio?.pais || 'México',
    codigoPostal: formData.domicilio?.codigo_postal || '',
    estado: formData.domicilio?.estado || '',
    municipio: formData.domicilio?.municipio || '',
    localidad: formData.domicilio?.localidad || '',
    colonia: formData.domicilio?.colonia || '',
    calle: formData.domicilio?.calle || '',
    numExterior: formData.domicilio?.numero_exterior || '',
    numInterior: formData.domicilio?.numero_interior || '',
    referencia: formData.domicilio?.referencia || ''
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Ubicación */}
          <div>
            <Label htmlFor="tipo_ubicacion">Tipo de Ubicación *</Label>
            <Select
              value={formData.tipo_ubicacion || ''}
              onValueChange={handleTipoChange}
            >
              <SelectTrigger className={errors.tipo_ubicacion ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Origen">Origen</SelectItem>
                <SelectItem value="Destino">Destino</SelectItem>
                <SelectItem value="Paso Intermedio">Paso Intermedio</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_ubicacion && (
              <p className="text-sm text-red-500 mt-1">{errors.tipo_ubicacion}</p>
            )}
          </div>

          {/* ID de Ubicación */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="id_ubicacion">ID de Ubicación *</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={useManualId}
                  onCheckedChange={setUseManualId}
                />
                <Label className="text-sm">Manual</Label>
              </div>
            </div>

            <Input
              id="id_ubicacion"
              value={formData.id_ubicacion || ''}
              onChange={(e) => handleIdChange(e.target.value.toUpperCase())}
              placeholder={useManualId ? 'Ej: OR000001' : 'Se genera automáticamente'}
              disabled={!useManualId}
              className={`${!useManualId ? 'bg-gray-100' : ''} ${errors.id_ubicacion ? 'border-red-500' : ''}`}
            />

            {errors.id_ubicacion && (
              <p className="text-sm text-red-500">{errors.id_ubicacion}</p>
            )}

            {/* Sugerencias de ID */}
            {useManualId && formData.tipo_ubicacion && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Sugerencias:</Label>
                <div className="flex flex-wrap gap-2">
                  {getSuggestions().slice(0, 4).map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => handleIdChange(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Distancia Recorrida */}
          <div>
            <Label htmlFor="distancia_recorrida">
              Distancia Recorrida (km)
              {formData.tipo_ubicacion === 'Destino' && ' *'}
            </Label>
            <Input
              id="distancia_recorrida"
              type="number"
              value={formData.distancia_recorrida || ''}
              onChange={(e) => handleDistanciaChange(e.target.value)}
              placeholder="Distancia desde el punto anterior"
              min="0"
              step="0.1"
            />
            {formData.tipo_ubicacion === 'Destino' && (
              <p className="text-sm text-gray-600 mt-1">
                Para destino, debe ser mayor a 0
              </p>
            )}
          </div>

          {/* Domicilio */}
          <div>
            <Label className="text-base font-medium">Domicilio *</Label>
            <div className="mt-2">
              <FormularioDomicilioUnificado
                domicilio={domicilioUnificado}
                onDomicilioChange={handleDomicilioChange}
                camposOpcionales={['numInterior', 'referencia', 'localidad']}
              />
            </div>
            
            {/* Display validation errors for domicilio fields */}
            {errors.codigo_postal && (
              <p className="text-sm text-red-500 mt-1">{errors.codigo_postal}</p>
            )}
            {errors.municipio && (
              <p className="text-sm text-red-500 mt-1">{errors.municipio}</p>
            )}
            {errors.calle && (
              <p className="text-sm text-red-500 mt-1">{errors.calle}</p>
            )}
          </div>

          {/* Botones */}
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
