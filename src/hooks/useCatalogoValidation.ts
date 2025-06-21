
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

  // Cargar catálogo de productos SAT
  const { data: catalogoProductos } = useQuery({
    queryKey: ['catalogo-productos-sat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogo_claves_productos_servicios')
        .select('clave, descripcion, vigente_desde, vigente_hasta')
        .eq('vigente', true)
        .order('clave');
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  // Cargar catálogo de unidades SAT
  const { data: catalogoUnidades } = useQuery({
    queryKey: ['catalogo-unidades-sat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogo_unidades_medida')
        .select('clave, nombre, descripcion, vigente')
        .eq('vigente', true)
        .order('clave');
      
      if (error) throw error;
      return data;
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
        descripcion: item.nombre || item.descripcion,
        vigente: item.vigente
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
        (u.nombre && u.nombre.toLowerCase().includes(term)) ||
        (u.descripcion && u.descripcion.toLowerCase().includes(term))
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
