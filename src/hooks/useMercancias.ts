
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface Mercancia {
  id?: string;
  bienes_transp: string;
  descripcion: string;
  cantidad: number;
  clave_unidad: string;
  peso_kg: number;
  valor_mercancia: number;
  material_peligroso: boolean;
  cve_material_peligroso?: string;
  moneda: string;
  fraccion_arancelaria?: string;
  embalaje?: string;
  uuid_comercio_ext?: string;
  codigo_producto?: string; // New field for product ID
}

export interface MercanciaConErrores extends Mercancia {
  errores?: string[];
  fila?: number;
}

export const useMercancias = () => {
  const [mercancias, setMercancias] = useState<Mercancia[]>([]);
  const queryClient = useQueryClient();

  const validarClaveMercancia = useCallback(async (clave: string): Promise<boolean> => {
    try {
      // Mock validation - replace with real SAT validation
      return clave.length >= 8;
    } catch (error) {
      console.error('Error validando clave de mercancía:', error);
      return false;
    }
  }, []);

  const validarClaveUnidad = useCallback(async (clave: string): Promise<boolean> => {
    try {
      // Mock validation - replace with real SAT validation  
      return clave.length >= 3;
    } catch (error) {
      console.error('Error validando clave de unidad:', error);
      return false;
    }
  }, []);

  const validarMaterialPeligroso = useCallback(async (clave: string): Promise<boolean> => {
    try {
      // Mock validation - replace with real SAT validation
      return clave.length >= 4;
    } catch (error) {
      console.error('Error validando material peligroso:', error);
      return false;
    }
  }, []);

  const agregarMercancia = useMutation({
    mutationFn: async (mercancia: Mercancia) => {
      // Validaciones básicas
      if (!mercancia.bienes_transp) {
        throw new Error('La clave de producto/servicio es requerida');
      }
      
      if (!mercancia.clave_unidad) {
        throw new Error('La clave de unidad es requerida');
      }

      if (mercancia.cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      if (mercancia.peso_kg <= 0) {
        throw new Error('El peso debe ser mayor a 0');
      }

      if (mercancia.valor_mercancia <= 0) {
        throw new Error('El valor debe ser mayor a 0');
      }

      // Validar claves con SAT
      const esValidaClaveProdServ = await validarClaveMercancia(mercancia.bienes_transp);
      if (!esValidaClaveProdServ) {
        throw new Error('La clave de producto/servicio no es válida según el catálogo SAT');
      }

      const esValidaClaveUnidad = await validarClaveUnidad(mercancia.clave_unidad);
      if (!esValidaClaveUnidad) {
        throw new Error('La clave de unidad no es válida según el catálogo SAT');
      }

      if (mercancia.material_peligroso && mercancia.cve_material_peligroso) {
        const esValidaMaterialPeligroso = await validarMaterialPeligroso(mercancia.cve_material_peligroso);
        if (!esValidaMaterialPeligroso) {
          throw new Error('La clave de material peligroso no es válida según el catálogo SAT');
        }
      }

      return mercancia;
    },
    onSuccess: (mercancia) => {
      setMercancias(prev => [...prev, { ...mercancia, id: Date.now().toString() }]);
      queryClient.invalidateQueries({ queryKey: ['mercancias'] });
    }
  });

  const actualizarMercancia = useMutation({
    mutationFn: async ({ id, mercancia }: { id: string; mercancia: Mercancia }) => {
      // Validaciones similares a agregarMercancia
      if (!mercancia.bienes_transp) {
        throw new Error('La clave de producto/servicio es requerida');
      }
      
      if (!mercancia.clave_unidad) {
        throw new Error('La clave de unidad es requerida');
      }

      if (mercancia.cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      if (mercancia.peso_kg <= 0) {
        throw new Error('El peso debe ser mayor a 0');
      }

      if (mercancia.valor_mercancia <= 0) {
        throw new Error('El valor debe ser mayor a 0');
      }
      
      return { id, mercancia };
    },
    onSuccess: ({ id, mercancia }) => {
      setMercancias(prev => prev.map(m => 
        m.id === id ? { ...mercancia, id } : m
      ));
      queryClient.invalidateQueries({ queryKey: ['mercancias'] });
    }
  });

  const eliminarMercancia = useCallback((id: string) => {
    setMercancias(prev => prev.filter(m => m.id !== id));
  }, []);

  const editarMercancia = useCallback((id: string, mercanciaActualizada: Mercancia) => {
    setMercancias(prev => prev.map(m => 
      m.id === id ? { ...mercanciaActualizada, id } : m
    ));
  }, []);

  const importarMercancias = useCallback(async (mercanciasList: Mercancia[]): Promise<{
    importadas: number;
    errores: number;
    mercanciasConErrores: MercanciaConErrores[];
  }> => {
    try {
      const mercanciasConErrores: MercanciaConErrores[] = [];
      let importadas = 0;
      let errores = 0;

      // Validar cada mercancía antes de importar
      for (let i = 0; i < mercanciasList.length; i++) {
        const mercancia = mercanciasList[i];
        const erroresMercancia: string[] = [];

        if (!mercancia.bienes_transp || !mercancia.descripcion) {
          erroresMercancia.push('Datos incompletos en mercancía');
        }

        if (!mercancia.cantidad || mercancia.cantidad <= 0) {
          erroresMercancia.push('Cantidad inválida');
        }

        if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
          erroresMercancia.push('Peso inválido');
        }

        if (!mercancia.valor_mercancia || mercancia.valor_mercancia <= 0) {
          erroresMercancia.push('Valor inválido');
        }

        if (erroresMercancia.length > 0) {
          mercanciasConErrores.push({
            ...mercancia,
            errores: erroresMercancia,
            fila: i + 1
          });
          errores++;
        } else {
          importadas++;
        }
      }
      
      // Agregar solo las mercancías válidas
      const mercanciasValidas = mercanciasList.filter((_, index) => 
        !mercanciasConErrores.some(error => error.fila === index + 1)
      );

      const mercanciasConId = mercanciasValidas.map(m => ({
        ...m,
        id: `imported-${Date.now()}-${Math.random()}`
      }));
      
      setMercancias(prev => [...prev, ...mercanciasConId]);

      return {
        importadas,
        errores,
        mercanciasConErrores
      };
    } catch (error) {
      console.error('Error importando mercancías:', error);
      throw error;
    }
  }, []);

  return {
    mercancias,
    isLoading: agregarMercancia.isPending || actualizarMercancia.isPending,
    agregarMercancia: agregarMercancia.mutate,
    actualizarMercancia: actualizarMercancia.mutate,
    eliminarMercancia,
    editarMercancia,
    importarMercancias,
    validarClaveMercancia,
    validarClaveUnidad,
    validarMaterialPeligroso
  };
};
