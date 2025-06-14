
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AutotransporteCompleto {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  remolques?: any[];
}

interface AutotransporteSummaryProps {
  data: AutotransporteCompleto;
}

export function AutotransporteSummary({ data }: AutotransporteSummaryProps) {
  if (!data.placa_vm) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumen de Configuración</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Vehículo:</span>
            <span className="ml-2 font-medium">{data.placa_vm} ({data.anio_modelo_vm})</span>
          </div>
          
          {data.config_vehicular && (
            <div>
              <span className="text-muted-foreground">Configuración:</span>
              <span className="ml-2 font-medium">{data.config_vehicular}</span>
            </div>
          )}
          
          {data.perm_sct && (
            <div>
              <span className="text-muted-foreground">Permiso SCT:</span>
              <span className="ml-2 font-medium">{data.perm_sct} - {data.num_permiso_sct}</span>
            </div>
          )}
          
          {data.asegura_resp_civil && (
            <div>
              <span className="text-muted-foreground">Seguro:</span>
              <span className="ml-2 font-medium">{data.asegura_resp_civil}</span>
            </div>
          )}
          
          {data.remolques && data.remolques.length > 0 && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Remolques:</span>
              <span className="ml-2 font-medium">{data.remolques.length} configurado(s)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
