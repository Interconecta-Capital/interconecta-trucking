
import React from 'react';
import { Card } from '@/components/ui/card';
import { MercanciasSectionOptimizada } from './mercancias/MercanciasSectionOptimizada';
import { PesoTotalValidator } from './validacion/PesoTotalValidator';
import type { MercanciaCompleta, AutotransporteCompleto } from '@/types/cartaPorte';

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

  // FIXED: Ensure all fields are properly typed and valor_mercancia is provided as number
  const mercanciasCompletas = data.map(mercancia => ({
    ...mercancia,
    descripcion: mercancia.descripcion || 'Sin descripción',
    cantidad: mercancia.cantidad || 1,
    clave_unidad: mercancia.clave_unidad || 'KGM',
    peso_kg: mercancia.peso_kg || 0,
    valor_mercancia: mercancia.valor_mercancia || 0 // Ensure valor_mercancia is always a number
  }));

  return (
    <div className="space-y-6">
      <Card>
        <MercanciasSectionOptimizada
          data={mercanciasCompletas}
          onChange={onChange}
          onNext={onNext}
          onPrev={onPrev}
        />
      </Card>

      {/* Validador de peso total */}
      {data.length > 0 && (
        <PesoTotalValidator
          mercancias={mercanciasCompletas}
          autotransporte={autotransporte || defaultAutotransporte}
          className="mt-4"
        />
      )}
    </div>
  );
}
