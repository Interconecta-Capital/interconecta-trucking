
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { useTiposPermiso } from '@/hooks/useCatalogos';
import { VehicleValidator } from '@/utils/vehicleValidation';
import { AutotransporteData } from '@/hooks/useAutotransporte';

interface SegurosSectionProps {
  data: AutotransporteData;
  onChange: (data: Partial<AutotransporteData>) => void;
}

export function SegurosSection({ data, onChange }: SegurosSectionProps) {
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string[]>>({});
  const { data: tiposPermiso } = useTiposPermiso();

  const handlePermisoSCTChange = (permiso: any) => {
    onChange({ perm_sct: permiso.clave });
  };

  const handleNumPermisoChange = (value: string) => {
    const validacion = VehicleValidator.validarPermisoSCT(value);
    
    setErroresValidacion(prev => ({
      ...prev,
      num_permiso_sct: validacion.errores
    }));

    onChange({ num_permiso_sct: value.toUpperCase() });
  };

  const handlePolizaRespCivilChange = (value: string) => {
    const validacion = VehicleValidator.validarPoliza(value);
    
    setErroresValidacion(prev => ({
      ...prev,
      poliza_resp_civil: validacion.errores
    }));

    onChange({ poliza_resp_civil: value });
  };

  const handlePolizaMedAmbienteChange = (value: string) => {
    if (value) {
      const validacion = VehicleValidator.validarPoliza(value);
      
      setErroresValidacion(prev => ({
        ...prev,
        poliza_med_ambiente: validacion.errores
      }));
    } else {
      setErroresValidacion(prev => ({
        ...prev,
        poliza_med_ambiente: []
      }));
    }

    onChange({ poliza_med_ambiente: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Permisos y Seguros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Permiso SCT *</Label>
          <CatalogoSelector
            items={tiposPermiso || []}
            value={data.perm_sct}
            onSelect={handlePermisoSCTChange}
            placeholder="Seleccionar tipo de permiso..."
            searchPlaceholder="Buscar permiso..."
            displayFormat={(item) => `${item.clave} - ${item.descripcion}`}
          />
        </div>

        <div>
          <Label htmlFor="num_permiso_sct">Número de Permiso SCT *</Label>
          <Input
            id="num_permiso_sct"
            value={data.num_permiso_sct || ''}
            onChange={(e) => handleNumPermisoChange(e.target.value)}
            placeholder="Número de permiso"
            className={erroresValidacion.num_permiso_sct?.length ? 'border-red-500' : ''}
          />
          {erroresValidacion.num_permiso_sct?.map((error, index) => (
            <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Seguro de Responsabilidad Civil</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="asegura_resp_civil">Aseguradora *</Label>
            <Input
              id="asegura_resp_civil"
              value={data.asegura_resp_civil || ''}
              onChange={(e) => onChange({ asegura_resp_civil: e.target.value })}
              placeholder="Nombre de la aseguradora"
            />
          </div>

          <div>
            <Label htmlFor="poliza_resp_civil">Número de Póliza *</Label>
            <Input
              id="poliza_resp_civil"
              value={data.poliza_resp_civil || ''}
              onChange={(e) => handlePolizaRespCivilChange(e.target.value)}
              placeholder="Número de póliza"
              className={erroresValidacion.poliza_resp_civil?.length ? 'border-red-500' : ''}
            />
            {erroresValidacion.poliza_resp_civil?.map((error, index) => (
              <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Seguro de Medio Ambiente (Opcional)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="asegura_med_ambiente">Aseguradora</Label>
            <Input
              id="asegura_med_ambiente"
              value={data.asegura_med_ambiente || ''}
              onChange={(e) => onChange({ asegura_med_ambiente: e.target.value })}
              placeholder="Nombre de la aseguradora"
            />
          </div>

          <div>
            <Label htmlFor="poliza_med_ambiente">Número de Póliza</Label>
            <Input
              id="poliza_med_ambiente"
              value={data.poliza_med_ambiente || ''}
              onChange={(e) => handlePolizaMedAmbienteChange(e.target.value)}
              placeholder="Número de póliza"
              className={erroresValidacion.poliza_med_ambiente?.length ? 'border-red-500' : ''}
            />
            {erroresValidacion.poliza_med_ambiente?.map((error, index) => (
              <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
