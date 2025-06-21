
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CatalogoItem {
  clave: string;
  descripcion: string;
  vigente: boolean;
}

export const useCatalogoValidation = () => {
  const [lastValidation, setLastValidation] = useState<{
    claveProdServ?: { valid: boolean; item?: CatalogoItem };
    claveUnidad?: { valid: boolean; item?: CatalogoItem };
  }>({});

  // Cargar catálogo de productos SAT usando la tabla correcta
  const { data: catalogoProductos } = useQuery({
    queryKey: ['catalogo-productos-sat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cat_clave_prod_serv_cp')
        .select('clave_prod_serv, descripcion, fecha_inicio_vigencia, fecha_fin_vigencia')
        .order('clave_prod_serv');
      
      if (error) throw error;
      
      // Transformar los datos para que coincidan con la interfaz esperada
      return data?.map(item => ({
        clave: item.clave_prod_serv,
        descripcion: item.descripcion,
        vigente: true // Simplificamos por ahora
      })) || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  // Cargar catálogo de unidades SAT usando la tabla correcta
  const { data: catalogoUnidades } = useQuery({
    queryKey: ['catalogo-unidades-sat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cat_clave_unidad')
        .select('clave_unidad, nombre, descripcion')
        .order('clave_unidad');
      
      if (error) throw error;
      
      // Transformar los datos para que coincidan con la interfaz esperada
      return data?.map(item => ({
        clave: item.clave_unidad,
        descripcion: item.nombre || item.descripcion,
        vigente: true
      })) || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const validateClaveProdServ = useCallback((clave: string) => {
    if (!catalogoProductos || !clave) {
      return { valid: false, item: undefined };
    }

    const item = catalogoProductos.find(p => p.clave === clave);
    const result = { 
      valid: !!item, 
      item: item ? {
        clave: item.clave,
        descripcion: item.descripcion,
        vigente: true
      } : undefined
    };

    setLastValidation(prev => ({ ...prev, claveProdServ: result }));
    return result;
  }, [catalogoProductos]);

  const validateClaveUnidad = useCallback((clave: string) => {
    if (!catalogoUnidades || !clave) {
      return { valid: false, item: undefined };
    }

    const item = catalogoUnidades.find(u => u.clave === clave);
    const result = { 
      valid: !!item, 
      item: item ? {
        clave: item.clave,
        descripcion: item.descripcion,
        vigente: true
      } : undefined
    };

    setLastValidation(prev => ({ ...prev, claveUnidad: result }));
    return result;
  }, [catalogoUnidades]);

  const searchProductos = useCallback((searchTerm: string, limit: number = 10) => {
    if (!catalogoProductos || !searchTerm || searchTerm.length < 2) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    return catalogoProductos
      .filter(p => 
        p.clave.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
      )
      .slice(0, limit);
  }, [catalogoProductos]);

  const searchUnidades = useCallback((searchTerm: string, limit: number = 10) => {
    if (!catalogoUnidades || !searchTerm || searchTerm.length < 2) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    return catalogoUnidades
      .filter(u => 
        u.clave.toLowerCase().includes(term) ||
        u.descripcion.toLowerCase().includes(term)
      )
      .slice(0, limit);
  }, [catalogoUnidades]);

  return {
    validateClaveProdServ,
    validateClaveUnidad,
    searchProductos,
    searchUnidades,
    lastValidation,
    isLoadingCatalogos: !catalogoProductos || !catalogoUnidades
  };
};
