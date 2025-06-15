
import { ProductoServicio, ClaveUnidad, MaterialPeligroso, ConfiguracionVehicular, FiguraTransporte, TipoPermiso, CatalogoItem as RawCatalogoItem } from '@/services/catalogosSAT';

export interface CatalogItem {
  value: string;
  label: string;
  descripcion?: string;
  [key: string]: any;
}

const formatLabel = (clave: string, descripcion: string): string => {
  return `${clave} - ${descripcion}`;
};

export const adaptProductosServicios = (data: ProductoServicio[]): CatalogItem[] => {
  return data.map(item => ({
    value: item.clave,
    label: formatLabel(item.clave, item.descripcion),
    descripcion: item.descripcion,
    ...item
  }));
};

export const adaptClaveUnidad = (data: ClaveUnidad[]): CatalogItem[] => {
  return data.map(item => ({
    value: item.clave,
    label: formatLabel(item.clave, item.nombre),
    descripcion: item.descripcion,
    ...item
  }));
};

export const adaptMaterialesPeligrosos = (data: MaterialPeligroso[]): CatalogItem[] => {
  return data.map(item => ({
    value: item.clave,
    label: formatLabel(item.clave, item.descripcion),
    descripcion: item.descripcion,
    ...item
  }));
};

export const adaptConfiguracionesVehiculares = (data: ConfiguracionVehicular[]): CatalogItem[] => {
  return data.map(item => ({
    value: item.clave,
    label: formatLabel(item.clave, item.descripcion),
    descripcion: item.descripcion,
    ...item
  }));
};

export const adaptFigurasTransporte = (data: FiguraTransporte[]): CatalogItem[] => {
  return data.map(item => ({
    value: item.clave,
    label: formatLabel(item.clave, item.descripcion),
    descripcion: item.descripcion,
    ...item
  }));
};

export const adaptTiposPermiso = (data: TipoPermiso[]): CatalogItem[] => {
  return data.map(item => ({
    value: item.clave,
    label: formatLabel(item.clave, item.descripcion),
    descripcion: item.descripcion,
    ...item
  }));
};

export const adaptCatalogItems = (data: RawCatalogoItem[]): CatalogItem[] => {
  return data.map(item => ({
    value: item.clave,
    label: formatLabel(item.clave, item.descripcion),
    descripcion: item.descripcion,
    ...item
  }));
};
