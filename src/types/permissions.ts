
export interface ResourceUsage {
  usado: number;
  limite: number | null;
}

export interface UsageData {
  cartas_porte: ResourceUsage;
  conductores: ResourceUsage;
  vehiculos: ResourceUsage;
  socios: ResourceUsage;
}

export interface Limits {
  cartas_porte: number | null;
  conductores: number | null;
  vehiculos: number | null;
  socios: number | null;
}

export interface PermissionResult {
  puede: boolean;
  razon?: string;
}

export type ResourceType = 'conductores' | 'vehiculos' | 'socios' | 'cartas_porte';
export type FunctionalityType = 'cancelar_cfdi' | 'generar_xml' | 'timbrar' | 'tracking' | 'administracion' | 'funciones_avanzadas' | 'enterprise';
