
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClienteProveedor {
  id: string;
  tipo: 'cliente' | 'proveedor' | 'ambos';
  rfc: string;
  razon_social: string;
  nombre_comercial?: string;
  email?: string;
  telefono?: string;
  contacto_principal?: string;
  direccion_fiscal?: any;
  credito_limite?: number;
  credito_disponible?: number;
  dias_credito?: number;
  estatus: 'activo' | 'inactivo' | 'suspendido';
  fecha_registro: string;
  ultima_actividad?: string;
  notas?: string;
  documentos?: any[];
  user_id: string;
}

export interface FiltrosClientes {
  tipo?: 'cliente' | 'proveedor' | 'ambos';
  estatus?: 'activo' | 'inactivo' | 'suspendido';
  busqueda?: string;
  estado?: string;
  limite_credito_min?: number;
  limite_credito_max?: number;
}

export function useClientesProveedores() {
  const [clientes, setClientes] = useState<ClienteProveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState(new Map<string, ClienteProveedor[]>());

  const obtenerClientes = useCallback(async (filtros: FiltrosClientes = {}) => {
    const cacheKey = JSON.stringify(filtros);
    
    if (cache.has(cacheKey)) {
      setClientes(cache.get(cacheKey)!);
      return cache.get(cacheKey)!;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('socios')
        .select('*')
        .order('nombre_razon_social');

      if (filtros.estatus) {
        query = query.eq('estado', filtros.estatus);
      }

      if (filtros.busqueda) {
        query = query.or(`nombre_razon_social.ilike.%${filtros.busqueda}%,rfc.ilike.%${filtros.busqueda}%,email.ilike.%${filtros.busqueda}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const clientesFormateados: ClienteProveedor[] = data?.map(socio => ({
        id: socio.id,
        tipo: (socio.tipo_persona as 'cliente' | 'proveedor' | 'ambos') || 'cliente',
        rfc: socio.rfc,
        razon_social: socio.nombre_razon_social,
        nombre_comercial: '',
        email: socio.email || '',
        telefono: socio.telefono || '',
        contacto_principal: '',
        direccion_fiscal: socio.direccion || {},
        credito_limite: 0,
        credito_disponible: 0,
        dias_credito: 0,
        estatus: socio.estado === 'activo' ? 'activo' : 'inactivo',
        fecha_registro: socio.created_at,
        ultima_actividad: socio.updated_at,
        notas: '',
        documentos: [],
        user_id: socio.user_id
      })) || [];

      setCache(prev => new Map(prev.set(cacheKey, clientesFormateados)));
      setClientes(clientesFormateados);
      return clientesFormateados;

    } catch (error: any) {
      console.error('Error obteniendo clientes:', error);
      toast.error('Error al obtener clientes: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const buscarClientes = useCallback(async (termino: string) => {
    if (termino.length < 2) return [];
    return await obtenerClientes({ busqueda: termino });
  }, [obtenerClientes]);

  const crearCliente = useCallback(async (cliente: Omit<ClienteProveedor, 'id' | 'fecha_registro' | 'user_id'>) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('socios')
        .insert({
          tipo_persona: cliente.tipo,
          rfc: cliente.rfc,
          nombre_razon_social: cliente.razon_social,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion_fiscal || {},
          estado: cliente.estatus,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Cliente creado exitosamente');
      setCache(new Map());
      return data;
    } catch (error: any) {
      console.error('Error creando cliente:', error);
      toast.error('Error al crear cliente: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarCliente = useCallback(async (id: string, actualizaciones: Partial<ClienteProveedor>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('socios')
        .update({
          tipo_persona: actualizaciones.tipo,
          rfc: actualizaciones.rfc,
          nombre_razon_social: actualizaciones.razon_social,
          email: actualizaciones.email,
          telefono: actualizaciones.telefono,
          direccion: actualizaciones.direccion_fiscal,
          estado: actualizaciones.estatus
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Cliente actualizado exitosamente');
      setCache(new Map());
      return data;
    } catch (error: any) {
      console.error('Error actualizando cliente:', error);
      toast.error('Error al actualizar cliente: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerClientePorRFC = useCallback(async (rfc: string) => {
    try {
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .eq('rfc', rfc.toUpperCase())
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data ? {
        id: data.id,
        tipo: (data.tipo_persona as 'cliente' | 'proveedor' | 'ambos') || 'cliente',
        rfc: data.rfc,
        razon_social: data.nombre_razon_social,
        nombre_comercial: '',
        email: data.email || '',
        telefono: data.telefono || '',
        contacto_principal: '',
        direccion_fiscal: data.direccion || {},
        credito_limite: 0,
        credito_disponible: 0,
        dias_credito: 0,
        estatus: data.estado === 'activo' ? 'activo' : 'inactivo',
        fecha_registro: data.created_at,
        ultima_actividad: data.updated_at,
        notas: '',
        documentos: [],
        user_id: data.user_id
      } as ClienteProveedor : null;

    } catch (error: any) {
      console.error('Error obteniendo cliente por RFC:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    obtenerClientes();
  }, []);

  return {
    clientes,
    loading,
    obtenerClientes,
    buscarClientes,
    crearCliente,
    actualizarCliente,
    obtenerClientePorRFC,
    limpiarCache: () => setCache(new Map())
  };
}
