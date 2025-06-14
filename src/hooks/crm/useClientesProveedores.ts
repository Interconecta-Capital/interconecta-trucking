
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClienteProveedor {
  id: string;
  tipo: 'cliente' | 'proveedor' | 'ambos';
  rfc: string;
  razon_social: string;
  nombre_comercial?: string;
  email: string;
  telefono?: string;
  contacto_principal?: string;
  direccion_fiscal: {
    calle: string;
    numero: string;
    colonia: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
    pais: string;
  };
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
    
    // Verificar cache primero
    if (cache.has(cacheKey)) {
      setClientes(cache.get(cacheKey)!);
      return cache.get(cacheKey)!;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('socios')
        .select('*')
        .order('razon_social');

      if (filtros.tipo) {
        query = query.eq('tipo_socio', filtros.tipo);
      }

      if (filtros.estatus) {
        query = query.eq('estado', filtros.estatus);
      }

      if (filtros.busqueda) {
        query = query.or(`razon_social.ilike.%${filtros.busqueda}%,rfc.ilike.%${filtros.busqueda}%,email.ilike.%${filtros.busqueda}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const clientesFormateados = data?.map(socio => ({
        id: socio.id,
        tipo: socio.tipo_socio || 'cliente',
        rfc: socio.rfc,
        razon_social: socio.nombre_razon_social,
        nombre_comercial: socio.nombre_comercial,
        email: socio.email,
        telefono: socio.telefono,
        contacto_principal: socio.contacto_principal,
        direccion_fiscal: socio.direccion || {},
        credito_limite: socio.limite_credito,
        credito_disponible: socio.credito_disponible,
        dias_credito: socio.dias_credito,
        estatus: socio.estado,
        fecha_registro: socio.created_at,
        ultima_actividad: socio.updated_at,
        notas: socio.notas,
        documentos: socio.documentos || [],
        user_id: socio.user_id
      })) || [];

      // Actualizar cache
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

    return await obtenerClientes({
      busqueda: termino
    });
  }, [obtenerClientes]);

  const crearCliente = useCallback(async (cliente: Omit<ClienteProveedor, 'id' | 'fecha_registro' | 'user_id'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('socios')
        .insert([{
          tipo_socio: cliente.tipo,
          rfc: cliente.rfc,
          nombre_razon_social: cliente.razon_social,
          nombre_comercial: cliente.nombre_comercial,
          email: cliente.email,
          telefono: cliente.telefono,
          contacto_principal: cliente.contacto_principal,
          direccion: cliente.direccion_fiscal,
          limite_credito: cliente.credito_limite,
          credito_disponible: cliente.credito_disponible || cliente.credito_limite,
          dias_credito: cliente.dias_credito,
          estado: cliente.estatus,
          notas: cliente.notas,
          documentos: cliente.documentos
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Cliente creado exitosamente');
      
      // Limpiar cache
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
          tipo_socio: actualizaciones.tipo,
          rfc: actualizaciones.rfc,
          nombre_razon_social: actualizaciones.razon_social,
          nombre_comercial: actualizaciones.nombre_comercial,
          email: actualizaciones.email,
          telefono: actualizaciones.telefono,
          contacto_principal: actualizaciones.contacto_principal,
          direccion: actualizaciones.direccion_fiscal,
          limite_credito: actualizaciones.credito_limite,
          credito_disponible: actualizaciones.credito_disponible,
          dias_credito: actualizaciones.dias_credito,
          estado: actualizaciones.estatus,
          notas: actualizaciones.notas,
          documentos: actualizaciones.documentos
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Cliente actualizado exitosamente');
      
      // Limpiar cache
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
        tipo: data.tipo_socio || 'cliente',
        rfc: data.rfc,
        razon_social: data.nombre_razon_social,
        nombre_comercial: data.nombre_comercial,
        email: data.email,
        telefono: data.telefono,
        contacto_principal: data.contacto_principal,
        direccion_fiscal: data.direccion || {},
        credito_limite: data.limite_credito,
        credito_disponible: data.credito_disponible,
        dias_credito: data.dias_credito,
        estatus: data.estado,
        fecha_registro: data.created_at,
        ultima_actividad: data.updated_at,
        notas: data.notas,
        documentos: data.documentos || [],
        user_id: data.user_id
      } : null;

    } catch (error: any) {
      console.error('Error obteniendo cliente por RFC:', error);
      return null;
    }
  }, []);

  // Auto-cargar clientes al inicializar
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
