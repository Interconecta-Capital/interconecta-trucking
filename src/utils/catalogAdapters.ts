
import { 
  ProductoServicio, 
  ClaveUnidad, 
  MaterialPeligroso, 
  ConfiguracionVehicular,
  FiguraTransporte,
  TipoPermiso,
  CatalogoItem 
} from '@/services/catalogosSAT';

export interface CatalogItem {
  value: string;
  label: string;
  metadata?: any;
}

export const adaptProductosServicios = (productos: ProductoServicio[]): CatalogItem[] => {
  return productos.map(producto => ({
    value: producto.clave,
    label: `${producto.clave} - ${producto.descripcion}`,
    metadata: { incluye_iva: producto.incluye_iva }
  }));
};

export const adaptClaveUnidad = (unidades: ClaveUnidad[]): CatalogItem[] => {
  return unidades.map(unidad => ({
    value: unidad.clave,
    label: `${unidad.clave} - ${unidad.nombre}`,
    metadata: { simbolo: unidad.simbolo, descripcion: unidad.descripcion }
  }));
};

export const adaptMaterialesPeligrosos = (materiales: MaterialPeligroso[]): CatalogItem[] => {
  return materiales.map(material => ({
    value: material.clave,
    label: `${material.clave} - ${material.descripcion}`,
    metadata: { 
      clase_division: material.clase_division, 
      grupo_embalaje: material.grupo_embalaje 
    }
  }));
};

export const adaptConfiguracionesVehiculares = (configuraciones: ConfiguracionVehicular[]): CatalogItem[] => {
  return configuraciones.map(config => ({
    value: config.clave,
    label: `${config.clave} - ${config.descripcion}`,
    metadata: { 
      remolque: config.remolque, 
      semirremolque: config.semirremolque 
    }
  }));
};

export const adaptFigurasTransporte = (figuras: FiguraTransporte[]): CatalogItem[] => {
  return figuras.map(figura => ({
    value: figura.clave,
    label: `${figura.clave} - ${figura.descripcion}`,
    metadata: { 
      persona_fisica: figura.persona_fisica, 
      persona_moral: figura.persona_moral 
    }
  }));
};

export const adaptTiposPermiso = (tipos: TipoPermiso[]): CatalogItem[] => {
  return tipos.map(tipo => ({
    value: tipo.clave,
    label: `${tipo.clave} - ${tipo.descripcion}`,
    metadata: { 
      transporte_carga: tipo.transporte_carga, 
      transporte_pasajeros: tipo.transporte_pasajeros 
    }
  }));
};

export const adaptCatalogItems = (items: CatalogoItem[]): CatalogItem[] => {
  return items.map(item => ({
    value: item.clave,
    label: `${item.clave} - ${item.descripcion}`,
    metadata: {}
  }));
};
