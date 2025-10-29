import { supabase } from '@/integrations/supabase/client';

interface FiguraCompleta {
  id: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  num_licencia?: string;
  tipo_licencia?: string;
  curp?: string;
  operador_sct?: boolean;
  residencia_fiscal_figura?: string;
  vigencia_licencia?: string;
  domicilio?: {
    pais: string;
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
  };
}

export class FigurasAutoPopulationService {
  /**
   * Obtiene datos del conductor y los formatea como figura tipo '01' (Operador)
   */
  static async obtenerFiguraConductor(conductorId: string): Promise<FiguraCompleta | null> {
    try {
      console.log('🚗 Obteniendo datos del conductor:', conductorId);

      const { data: conductor, error } = await supabase
        .from('conductores')
        .select('*')
        .eq('id', conductorId)
        .single();

      if (error || !conductor) {
        console.error('❌ Error obteniendo conductor:', error);
        return null;
      }

      console.log('✅ Conductor encontrado:', conductor.nombre);

      // Procesar dirección JSONB
      const direccionData = conductor.direccion as any;
      const domicilio = direccionData ? {
        pais: direccionData.pais || 'MEX',
        codigo_postal: direccionData.codigo_postal || direccionData.codigoPostal || '',
        estado: direccionData.estado || '',
        municipio: direccionData.municipio || '',
        colonia: direccionData.colonia || '',
        calle: direccionData.calle || ''
      } : {
        pais: 'MEX',
        codigo_postal: '',
        estado: '',
        municipio: '',
        colonia: '',
        calle: ''
      };

      return {
        id: `figura-conductor-${conductorId}`,
        tipo_figura: '01', // Operador
        rfc_figura: conductor.rfc || '',
        nombre_figura: conductor.nombre,
        num_licencia: conductor.num_licencia || '',
        tipo_licencia: conductor.tipo_licencia || '',
        curp: conductor.curp || '',
        operador_sct: true, // Por defecto los conductores son operadores SCT
        residencia_fiscal_figura: 'MEX',
        vigencia_licencia: conductor.vigencia_licencia 
          ? new Date(conductor.vigencia_licencia).toISOString().split('T')[0]
          : undefined,
        domicilio
      };
    } catch (error) {
      console.error('❌ Error procesando figura de conductor:', error);
      return null;
    }
  }

  /**
   * Obtiene datos del cliente/socio y los formatea como figura tipo '02' (Propietario)
   * Intenta usar el contacto de emergencia si existe
   */
  static async obtenerFiguraCliente(clienteId: string): Promise<FiguraCompleta | null> {
    try {
      console.log('👤 Obteniendo datos del cliente:', clienteId);

      // Buscar en socios
      const { data: socio, error } = await supabase
        .from('socios')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (error || !socio) {
        console.log('⚠️ Cliente no encontrado en socios, buscando en clientes_proveedores...');
        
        // Fallback a clientes_proveedores
        const { data: cliente, error: clienteError } = await supabase
          .from('clientes_proveedores')
          .select('*')
          .eq('id', clienteId)
          .single();

        if (clienteError || !cliente) {
          console.error('❌ Cliente no encontrado:', clienteError);
          return null;
        }

        // Procesar cliente_proveedor
        return {
          id: `figura-cliente-${clienteId}`,
          tipo_figura: '02', // Propietario
          rfc_figura: cliente.rfc || '',
          nombre_figura: cliente.nombre_razon_social,
          residencia_fiscal_figura: 'MEX',
          domicilio: {
            pais: 'MEX',
            codigo_postal: '',
            estado: '',
            municipio: '',
            colonia: '',
            calle: ''
          }
        };
      }

      console.log('✅ Socio encontrado:', socio.nombre_razon_social);

      // Usar nombre_razon_social como figura
      const nombreFigura = socio.nombre_razon_social;

      // Procesar dirección fiscal JSONB
      const direccionData = socio.direccion_fiscal as any;
      const domicilio = direccionData ? {
        pais: direccionData.pais || 'MEX',
        codigo_postal: direccionData.codigo_postal || direccionData.codigoPostal || '',
        estado: direccionData.estado || '',
        municipio: direccionData.municipio || '',
        colonia: direccionData.colonia || '',
        calle: direccionData.calle || ''
      } : undefined;

      return {
        id: `figura-cliente-${clienteId}`,
        tipo_figura: '02', // Propietario
        rfc_figura: socio.rfc,
        nombre_figura: nombreFigura,
        residencia_fiscal_figura: 'MEX',
        domicilio
      };
    } catch (error) {
      console.error('❌ Error procesando figura de cliente:', error);
      return null;
    }
  }

  /**
   * Obtiene datos del usuario emisor y los formatea como figura tipo '02' (Propietario)
   */
  static async obtenerFiguraEmisor(): Promise<FiguraCompleta | null> {
    try {
      console.log('🏢 Obteniendo datos del usuario emisor');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ No hay usuario autenticado');
        return null;
      }
      
      // Obtener datos del perfil del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('nombre, rfc, empresa')
        .eq('id', user.id)
        .single();
      
      if (!profile) {
        console.log('⚠️ No se encontró perfil del usuario');
        return null;
      }
      
      return {
        id: `figura-emisor-${user.id}`,
        tipo_figura: '02', // Propietario
        rfc_figura: profile.rfc || '',
        nombre_figura: profile.nombre || profile.empresa || 'Usuario Emisor',
        residencia_fiscal_figura: 'MEX',
        domicilio: {
          pais: 'MEX',
          codigo_postal: '00000',
          estado: '',
          municipio: '',
          colonia: '',
          calle: ''
        }
      };
    } catch (error) {
      console.error('❌ Error procesando figura de emisor:', error);
      return null;
    }
  }

  /**
   * Obtiene todas las figuras auto-pobladas para un viaje
   * Incluye conductor, cliente y emisor si están disponibles
   */
  static async obtenerFigurasDeViaje(
    conductorId?: string,
    clienteId?: string
  ): Promise<FiguraCompleta[]> {
    const figuras: FiguraCompleta[] = [];

    // 1. Agregar conductor como primera figura (Operador - 01)
    if (conductorId) {
      const figuraConductor = await this.obtenerFiguraConductor(conductorId);
      if (figuraConductor) {
        figuras.push(figuraConductor);
        console.log('✅ Figura de conductor agregada:', figuraConductor.nombre_figura);
      }
    }

    // 2. Agregar cliente como segunda figura (Propietario mercancías - 02)
    if (clienteId) {
      const figuraCliente = await this.obtenerFiguraCliente(clienteId);
      if (figuraCliente) {
        figuras.push(figuraCliente);
        console.log('✅ Figura de cliente agregada:', figuraCliente.nombre_figura);
      }
    }

    // 3. Agregar emisor como tercera figura (Propietario transporte - 02)
    const figuraEmisor = await this.obtenerFiguraEmisor();
    if (figuraEmisor) {
      figuras.push(figuraEmisor);
      console.log('✅ Figura de emisor agregada:', figuraEmisor.nombre_figura);
    }

    console.log(`📋 Total de figuras auto-pobladas: ${figuras.length}`);
    return figuras;
  }
}
