
import { useCallback } from 'react';

interface MercanciaCompleta {
  id: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia?: number;
  material_peligroso?: boolean;
  moneda?: string;
  cve_material_peligroso?: string;
  embalaje?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
}

interface Totales {
  totalCantidad: number;
  totalPeso: number;
  totalValor: number;
  materialesPeligrosos: number;
}

export function useMercanciasLogic(
  data: MercanciaCompleta[],
  onChange: (data: MercanciaCompleta[]) => void,
  setFormErrors: (errors: string[]) => void,
  toast: any
) {
  const isDataComplete = useCallback(() => {
    return data.length > 0 && data.every(mercancia => 
      mercancia.descripcion && 
      mercancia.cantidad > 0 && 
      mercancia.bienes_transp &&
      mercancia.clave_unidad
    );
  }, [data]);

  const validateMercancia = useCallback((mercancia: MercanciaCompleta): string[] => {
    const errors: string[] = [];
    
    if (!mercancia.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (!mercancia.bienes_transp?.trim()) {
      errors.push('La clave de producto/servicio es requerida');
    }
    
    if (!mercancia.clave_unidad?.trim()) {
      errors.push('La unidad de medida es requerida');
    }
    
    if (!mercancia.cantidad || mercancia.cantidad <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }
    
    if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
      errors.push('El peso debe ser mayor a 0');
    }
    
    if (mercancia.material_peligroso && !mercancia.cve_material_peligroso?.trim()) {
      errors.push('La clave de material peligroso es requerida cuando es material peligroso');
    }
    
    return errors;
  }, []);

  const handleSaveMercancia = useCallback(async (mercanciaData: MercanciaCompleta): Promise<boolean> => {
    try {
      const errors = validateMercancia(mercanciaData);
      if (errors.length > 0) {
        setFormErrors(errors);
        return false;
      }

      setFormErrors([]);
      onChange([...data, mercanciaData]);
      return true;
    } catch (error) {
      console.error('Error saving mercancia:', error);
      setFormErrors(['Error al guardar la mercancía. Verifique los datos ingresados.']);
      return false;
    }
  }, [data, onChange, setFormErrors, validateMercancia]);

  const handleDocumentProcessed = useCallback((mercancias: any[]) => {
    if (mercancias && mercancias.length > 0) {
      const mercanciasFormateadas = mercancias.map((mercancia, index) => ({
        id: `imported-${Date.now()}-${index}`,
        descripcion: mercancia.descripcion || '',
        bienes_transp: mercancia.bienes_transp || '',
        clave_unidad: mercancia.clave_unidad || '',
        cantidad: mercancia.cantidad || 0,
        peso_kg: mercancia.peso_kg || 0,
        valor_mercancia: mercancia.valor_mercancia || 0,
        material_peligroso: mercancia.material_peligroso || false,
        moneda: mercancia.moneda || 'MXN',
        cve_material_peligroso: mercancia.cve_material_peligroso,
        embalaje: mercancia.embalaje,
        fraccion_arancelaria: mercancia.fraccion_arancelaria,
        uuid_comercio_ext: mercancia.uuid_comercio_ext
      }));

      onChange([...data, ...mercanciasFormateadas]);
      
      toast({
        title: "Mercancías importadas",
        description: `Se importaron ${mercanciasFormateadas.length} mercancías desde el documento.`,
      });
    }
  }, [data, onChange, toast]);

  const calcularTotales = useCallback((): Totales => {
    return {
      totalCantidad: data.reduce((sum, m) => sum + m.cantidad, 0),
      totalPeso: data.reduce((sum, m) => sum + m.peso_kg, 0),
      totalValor: data.reduce((sum, m) => sum + (m.cantidad * (m.valor_mercancia || 0)), 0),
      materialesPeligrosos: data.filter(m => m.material_peligroso).length
    };
  }, [data]);

  return {
    isDataComplete,
    handleSaveMercancia,
    handleDocumentProcessed,
    calcularTotales
  };
}
