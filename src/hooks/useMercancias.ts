
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CatalogosSATService } from '@/services/catalogosSAT';

export interface Mercancia {
  id?: string;
  bienes_transp: string;
  descripcion: string;
  cantidad: number;
  clave_unidad: string;
  peso_kg?: number;
  valor_mercancia?: number;
  moneda?: string;
  material_peligroso?: boolean;
  cve_material_peligroso?: string;
  embalaje?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
}

export interface MercanciaError {
  campo: string;
  mensaje: string;
}

export interface MercanciaConErrores extends Mercancia {
  errores?: MercanciaError[];
  fila?: number;
}

export const useMercancias = () => {
  const [mercancias, setMercancias] = useState<Mercancia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validarMercancia = useCallback(async (mercancia: Mercancia): Promise<MercanciaError[]> => {
    const errores: MercanciaError[] = [];

    // Validaciones básicas
    if (!mercancia.bienes_transp) {
      errores.push({ campo: 'bienes_transp', mensaje: 'Clave de producto/servicio es requerida' });
    } else {
      // Validar que la clave existe en el catálogo
      const existe = await CatalogosSATService.validarClave('productos', mercancia.bienes_transp);
      if (!existe) {
        errores.push({ campo: 'bienes_transp', mensaje: 'Clave de producto/servicio no válida' });
      }
    }

    if (!mercancia.descripcion || mercancia.descripcion.trim().length === 0) {
      errores.push({ campo: 'descripcion', mensaje: 'Descripción es requerida' });
    }

    if (!mercancia.cantidad || mercancia.cantidad <= 0) {
      errores.push({ campo: 'cantidad', mensaje: 'Cantidad debe ser mayor a 0' });
    }

    if (!mercancia.clave_unidad) {
      errores.push({ campo: 'clave_unidad', mensaje: 'Clave de unidad es requerida' });
    } else {
      // Validar que la clave de unidad existe
      const existe = await CatalogosSATService.validarClave('unidades', mercancia.clave_unidad);
      if (!existe) {
        errores.push({ campo: 'clave_unidad', mensaje: 'Clave de unidad no válida' });
      }
    }

    if (mercancia.peso_kg && mercancia.peso_kg <= 0) {
      errores.push({ campo: 'peso_kg', mensaje: 'Peso debe ser mayor a 0' });
    }

    if (mercancia.valor_mercancia && mercancia.valor_mercancia <= 0) {
      errores.push({ campo: 'valor_mercancia', mensaje: 'Valor debe ser mayor a 0' });
    }

    if (mercancia.material_peligroso && !mercancia.cve_material_peligroso) {
      errores.push({ campo: 'cve_material_peligroso', mensaje: 'Clave de material peligroso es requerida' });
    }

    if (mercancia.cve_material_peligroso) {
      const existe = await CatalogosSATService.validarClave('materiales', mercancia.cve_material_peligroso);
      if (!existe) {
        errores.push({ campo: 'cve_material_peligroso', mensaje: 'Clave de material peligroso no válida' });
      }
    }

    return errores;
  }, []);

  const agregarMercancia = useCallback(async (mercancia: Mercancia) => {
    setIsLoading(true);
    try {
      const errores = await validarMercancia(mercancia);
      if (errores.length > 0) {
        toast({
          title: "Error de validación",
          description: `La mercancía tiene ${errores.length} errores`,
          variant: "destructive"
        });
        return { success: false, errores };
      }

      const nuevaMercancia = {
        ...mercancia,
        id: crypto.randomUUID(),
        moneda: mercancia.moneda || 'MXN'
      };

      setMercancias(prev => [...prev, nuevaMercancia]);
      toast({
        title: "Mercancía agregada",
        description: "La mercancía se agregó correctamente"
      });
      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar la mercancía",
        variant: "destructive"
      });
      return { success: false, errores: [{ campo: 'general', mensaje: 'Error interno' }] };
    } finally {
      setIsLoading(false);
    }
  }, [validarMercancia, toast]);

  const actualizarMercancia = useCallback(async (id: string, mercancia: Mercancia) => {
    setIsLoading(true);
    try {
      const errores = await validarMercancia(mercancia);
      if (errores.length > 0) {
        toast({
          title: "Error de validación",
          description: `La mercancía tiene ${errores.length} errores`,
          variant: "destructive"
        });
        return { success: false, errores };
      }

      setMercancias(prev => prev.map(m => m.id === id ? { ...mercancia, id } : m));
      toast({
        title: "Mercancía actualizada",
        description: "Los cambios se guardaron correctamente"
      });
      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la mercancía",
        variant: "destructive"
      });
      return { success: false, errores: [{ campo: 'general', mensaje: 'Error interno' }] };
    } finally {
      setIsLoading(false);
    }
  }, [validarMercancia, toast]);

  const eliminarMercancia = useCallback((id: string) => {
    setMercancias(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Mercancía eliminada",
      description: "La mercancía se eliminó correctamente"
    });
  }, [toast]);

  const validarMercancias = useCallback(async (mercanciasAValidar: Mercancia[]): Promise<MercanciaConErrores[]> => {
    const mercanciasConErrores: MercanciaConErrores[] = [];
    
    for (let i = 0; i < mercanciasAValidar.length; i++) {
      const mercancia = mercanciasAValidar[i];
      const errores = await validarMercancia(mercancia);
      mercanciasConErrores.push({
        ...mercancia,
        errores,
        fila: i + 1
      });
    }

    return mercanciasConErrores;
  }, [validarMercancia]);

  const importarMercancias = useCallback(async (mercanciasImportar: Mercancia[]) => {
    setIsLoading(true);
    try {
      const mercanciasValidadas = await validarMercancias(mercanciasImportar);
      const mercanciasValidas = mercanciasValidadas.filter(m => !m.errores || m.errores.length === 0);
      const mercanciasConErrores = mercanciasValidadas.filter(m => m.errores && m.errores.length > 0);

      if (mercanciasValidas.length > 0) {
        const nuevasMercancias = mercanciasValidas.map(m => ({
          ...m,
          id: crypto.randomUUID(),
          moneda: m.moneda || 'MXN'
        }));
        setMercancias(prev => [...prev, ...nuevasMercancias]);
      }

      toast({
        title: "Importación completada",
        description: `${mercanciasValidas.length} mercancías importadas, ${mercanciasConErrores.length} con errores`
      });

      return {
        importadas: mercanciasValidas.length,
        errores: mercanciasConErrores.length,
        mercanciasConErrores
      };
    } catch (error) {
      toast({
        title: "Error de importación",
        description: "No se pudieron importar las mercancías",
        variant: "destructive"
      });
      return { importadas: 0, errores: 0, mercanciasConErrores: [] };
    } finally {
      setIsLoading(false);
    }
  }, [validarMercancias, toast]);

  const limpiarMercancias = useCallback(() => {
    setMercancias([]);
  }, []);

  return {
    mercancias,
    isLoading,
    agregarMercancia,
    actualizarMercancia,
    eliminarMercancia,
    validarMercancias,
    importarMercancias,
    limpiarMercancias,
    validarMercancia
  };
};
