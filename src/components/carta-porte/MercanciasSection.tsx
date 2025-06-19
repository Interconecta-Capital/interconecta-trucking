
import React from 'react';
import { Card } from '@/components/ui/card';
import { MercanciasSectionOptimizada } from './mercancias/MercanciasSectionOptimizada';
import { PesoTotalValidator } from './validacion/PesoTotalValidator';
import { MercanciaCompleta, AutotransporteCompleto } from '@/types/cartaPorte';

interface MercanciasSectionProps {
  data: MercanciaCompleta[];
  onChange: (data: MercanciaCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
  autotransporte?: AutotransporteCompleto;
}

export function MercanciasSection({ data, onChange, onNext, onPrev, autotransporte }: MercanciasSectionProps) {
  // Autotransporte por defecto si no se proporciona
  const defaultAutotransporte: AutotransporteCompleto = {
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    peso_bruto_vehicular: 0,
    capacidad_carga: 0,
    remolques: []
  };

  // Asegurar que todas las mercancías tengan descripción
  const mercanciasConDescripcion = data.map(mercancia => ({
    ...mercancia,
    descripcion: mercancia.descripcion || 'Sin descripción'
  }));

  return (
    <div className="space-y-6">
      <Card>
        <MercanciasSectionOptimizada
          data={mercanciasConDescripcion}
          onChange={onChange}
          onNext={onNext}
          onPrev={onPrev}
        />
      </Card>

      {/* Validador de peso total */}
      {data.length > 0 && (
        <PesoTotalValidator
          mercancias={mercanciasConDescripcion}
          autotransporte={autotransporte || defaultAutotransporte}
          className="mt-4"
        />
      )}
    </div>
  );
}
