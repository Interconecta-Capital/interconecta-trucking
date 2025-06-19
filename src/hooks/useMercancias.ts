
import { useState, useCallback } from 'react';
import { MercanciaCompleta } from '@/types/cartaPorte';

export interface Mercancia {
  id: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia: number; // Make required to match MercanciaCompleta
  material_peligroso?: boolean;
  moneda?: string;
  cve_material_peligroso?: string;
  embalaje?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
  carta_porte_id?: string;
  numero_autorizacion?: string;
  folio_acreditacion?: string;
  requiere_semarnat?: boolean;
  categoria_transporte?: 'general' | 'peligroso' | 'refrigerado' | 'especializado';
  regulaciones_especiales?: string[];
  temperatura_transporte?: string;
  tipo_refrigeracion?: string;
  dimensiones_especiales?: string;
  peso_especial?: string;
  peso_bruto_total?: number;
  descripcion_detallada?: string;
  especie_protegida?: boolean;
  tipo_embalaje?: string;
  material_embalaje?: string;
  unidad_peso_bruto?: string;
  dimensiones?: {
    largo?: number;
    ancho?: number;
    alto?: number;
    unidad?: string;
  };
  peso_neto_total?: number;
  numero_piezas?: number;
  requiere_cites?: boolean;
  permisos_semarnat?: any[];
  documentacion_aduanera?: any[];
}

interface ImportResult {
  importadas: number;
  errores: number;
  detalles?: string[];
}

export const useMercancias = () => {
  const [mercancias, setMercancias] = useState<MercanciaCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const agregarMercancia = useCallback((mercancia: MercanciaCompleta) => {
    const mercanciaConId: MercanciaCompleta = {
      ...mercancia,
      id: mercancia.id || crypto.randomUUID(),
      valor_mercancia: mercancia.valor_mercancia || 0
    };
    setMercancias(prev => [...prev, mercanciaConId]);
  }, []);

  const actualizarMercancia = useCallback(({ id, mercancia }: { id: string; mercancia: MercanciaCompleta }) => {
    setMercancias(prev => prev.map(m => m.id === id ? { ...mercancia, id } : m));
  }, []);

  const eliminarMercancia = useCallback((id: string) => {
    setMercancias(prev => prev.filter(m => m.id !== id));
  }, []);

  const importarMercancias = useCallback(async (nuevasMercancias: any[]): Promise<ImportResult> => {
    setIsLoading(true);
    try {
      let importadas = 0;
      let errores = 0;
      
      const mercanciasFormateadas: MercanciaCompleta[] = [];
      
      for (const mercancia of nuevasMercancias) {
        try {
          const mercanciaFormateada: MercanciaCompleta = {
            id: crypto.randomUUID(),
            descripcion: mercancia.descripcion || '',
            bienes_transp: mercancia.bienes_transp || '',
            clave_unidad: mercancia.clave_unidad || 'KGM',
            cantidad: Number(mercancia.cantidad) || 1,
            peso_kg: Number(mercancia.peso_kg) || 0,
            valor_mercancia: Number(mercancia.valor_mercancia) || 0,
            material_peligroso: Boolean(mercancia.material_peligroso),
            moneda: mercancia.moneda || 'MXN',
            cve_material_peligroso: mercancia.cve_material_peligroso,
            embalaje: mercancia.embalaje,
            fraccion_arancelaria: mercancia.fraccion_arancelaria,
            uuid_comercio_ext: mercancia.uuid_comercio_ext
          };
          
          mercanciasFormateadas.push(mercanciaFormateada);
          importadas++;
        } catch (error) {
          console.error('Error formateando mercancía:', error);
          errores++;
        }
      }
      
      setMercancias(prev => [...prev, ...mercanciasFormateadas]);
      
      return { importadas, errores };
    } catch (error) {
      console.error('Error importando mercancías:', error);
      return { importadas: 0, errores: nuevasMercancias.length };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mercancias,
    isLoading,
    agregarMercancia,
    actualizarMercancia,
    eliminarMercancia,
    importarMercancias
  };
};
