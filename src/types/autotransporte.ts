
// Re-export from cartaPorte.ts to maintain compatibility
export type { AutotransporteCompleto, Remolque } from './cartaPorte';

export interface VehiculoGuardado {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  tipo?: string;
  estado: 'disponible' | 'en_ruta' | 'mantenimiento' | 'fuera_servicio';
  ubicacion_actual?: string;
  datos_completos: import('./cartaPorte').AutotransporteCompleto;
  created_at: string;
  updated_at: string;
}
