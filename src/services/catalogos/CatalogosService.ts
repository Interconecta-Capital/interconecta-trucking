/**
 * CatalogosService - Servicio centralizado para validación de catálogos SAT
 * 
 * Implementa validación de correlación CP ↔ Estado ↔ Municipio
 * según recomendaciones de SmartWeb para Carta Porte 3.1
 * 
 * @see FASE_1_IMPLEMENTACION.md
 */

import { supabase } from '@/integrations/supabase/client';

export interface CpLookupResult {
  codigoPostal: string;
  estado: string;
  estadoClave: string;
  municipio: string;
  municipioClave: string;
  localidad?: string;
  colonias: Array<{ nombre: string; tipo?: string }>;
  zona?: string;
}

export interface CpValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details?: {
    cpExists: boolean;
    estadoMatch: boolean;
    municipioMatch: boolean;
    expectedEstado?: string;
    expectedMunicipio?: string;
    actualEstado?: string;
    actualMunicipio?: string;
  };
}

export interface RegimenValidationResult {
  isValid: boolean;
  descripcion?: string;
  error?: string;
}

class CatalogosServiceImpl {
  private cache = new Map<string, CpLookupResult>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutos

  /**
   * Valida la correlación entre código postal, estado y municipio
   * según los catálogos SAT oficiales.
   * 
   * @param cp - Código postal (5 dígitos)
   * @param estado - Clave o nombre del estado
   * @param municipio - Clave o nombre del municipio
   * @returns Resultado de validación con detalles
   */
  async validateCpRelation(
    cp: string,
    estado: string,
    municipio: string
  ): Promise<CpValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar formato de CP
    if (!this.isValidCpFormat(cp)) {
      return {
        isValid: false,
        errors: ['Formato de código postal inválido. Debe ser 5 dígitos numéricos.'],
        warnings: []
      };
    }

    try {
      // Buscar el CP en la base de datos
      const lookupResult = await this.lookupByCp(cp);

      if (!lookupResult) {
        return {
          isValid: false,
          errors: [`Código postal ${cp} no encontrado en catálogos SAT`],
          warnings: ['Verifica que el código postal sea correcto'],
          details: {
            cpExists: false,
            estadoMatch: false,
            municipioMatch: false
          }
        };
      }

      // Normalizar valores para comparación
      const normalizedEstado = this.normalizeString(estado);
      const normalizedMunicipio = this.normalizeString(municipio);
      const expectedEstado = this.normalizeString(lookupResult.estado);
      const expectedEstadoClave = lookupResult.estadoClave;
      const expectedMunicipio = this.normalizeString(lookupResult.municipio);
      const expectedMunicipioClave = lookupResult.municipioClave;

      // Validar estado (por nombre o clave)
      const estadoMatch = 
        normalizedEstado === expectedEstado ||
        estado === expectedEstadoClave ||
        this.normalizeString(estado) === this.normalizeString(expectedEstadoClave);

      // Validar municipio (por nombre o clave)
      const municipioMatch = 
        normalizedMunicipio === expectedMunicipio ||
        municipio === expectedMunicipioClave ||
        this.normalizeString(municipio) === this.normalizeString(expectedMunicipioClave);

      if (!estadoMatch) {
        errors.push(
          `El código postal ${cp} pertenece al estado "${lookupResult.estado}" (${lookupResult.estadoClave}), ` +
          `pero se indicó "${estado}"`
        );
      }

      if (!municipioMatch) {
        errors.push(
          `El código postal ${cp} pertenece al municipio "${lookupResult.municipio}" (${lookupResult.municipioClave}), ` +
          `pero se indicó "${municipio}"`
        );
      }

      return {
        isValid: estadoMatch && municipioMatch,
        errors,
        warnings,
        details: {
          cpExists: true,
          estadoMatch,
          municipioMatch,
          expectedEstado: lookupResult.estado,
          expectedMunicipio: lookupResult.municipio,
          actualEstado: estado,
          actualMunicipio: municipio
        }
      };

    } catch (error: any) {
      console.error('[CatalogosService] Error validando CP:', error);
      return {
        isValid: false,
        errors: ['Error al validar código postal: ' + (error.message || 'Error desconocido')],
        warnings: []
      };
    }
  }

  /**
   * Busca información completa de un código postal
   */
  async lookupByCp(cp: string): Promise<CpLookupResult | null> {
    // Verificar cache
    const cached = this.cache.get(cp);
    if (cached) {
      return cached;
    }

    try {
      // Primero intentar con codigos_postales_mexico (tiene nombres completos)
      const { data: cpMexico, error: cpMexicoError } = await supabase
        .from('codigos_postales_mexico')
        .select('*')
        .eq('codigo_postal', cp);

      if (!cpMexicoError && cpMexico && cpMexico.length > 0) {
        const colonias = cpMexico.map(row => ({
          nombre: row.colonia,
          tipo: row.tipo_asentamiento || 'Colonia'
        }));

        const result: CpLookupResult = {
          codigoPostal: cp,
          estado: cpMexico[0].estado,
          estadoClave: cpMexico[0].estado_clave,
          municipio: cpMexico[0].municipio,
          municipioClave: cpMexico[0].municipio_clave,
          localidad: cpMexico[0].localidad || cpMexico[0].ciudad,
          colonias,
          zona: cpMexico[0].zona
        };

        this.cache.set(cp, result);
        this.cleanOldCache();
        return result;
      }

      // Fallback a cat_codigo_postal (tiene solo claves)
      const { data: catCp, error: catCpError } = await supabase
        .from('cat_codigo_postal')
        .select('*')
        .eq('codigo_postal', cp)
        .single();

      if (!catCpError && catCp) {
        // Obtener nombres de estado y municipio
        const { data: estadoData } = await supabase
          .from('cat_estado')
          .select('descripcion')
          .eq('clave_estado', catCp.estado_clave)
          .single();

        const { data: municipioData } = await supabase
          .from('cat_municipio')
          .select('descripcion')
          .eq('estado_clave', catCp.estado_clave)
          .eq('clave_municipio', catCp.municipio_clave)
          .single();

        // Obtener colonias
        const { data: coloniasData } = await supabase
          .from('cat_colonia')
          .select('descripcion, clave_colonia')
          .eq('codigo_postal', cp);

        const result: CpLookupResult = {
          codigoPostal: cp,
          estado: estadoData?.descripcion || catCp.estado_clave,
          estadoClave: catCp.estado_clave,
          municipio: municipioData?.descripcion || catCp.municipio_clave,
          municipioClave: catCp.municipio_clave,
          localidad: catCp.localidad_clave || undefined,
          colonias: coloniasData?.map(c => ({ nombre: c.descripcion })) || []
        };

        this.cache.set(cp, result);
        this.cleanOldCache();
        return result;
      }

      // Si no hay datos locales, intentar con edge function (SEPOMEX API)
      const { data: edgeResult, error: edgeError } = await supabase.functions.invoke(
        'codigo-postal-mexico',
        { body: { codigoPostal: cp } }
      );

      if (!edgeError && edgeResult && !edgeResult.error) {
        const result: CpLookupResult = {
          codigoPostal: edgeResult.codigoPostal,
          estado: edgeResult.estado,
          estadoClave: edgeResult.estadoClave || '',
          municipio: edgeResult.municipio,
          municipioClave: edgeResult.municipioClave || '',
          localidad: edgeResult.localidad,
          colonias: edgeResult.colonias || [],
          zona: edgeResult.zona
        };

        this.cache.set(cp, result);
        this.cleanOldCache();
        return result;
      }

      return null;

    } catch (error) {
      console.error('[CatalogosService] Error en lookupByCp:', error);
      return null;
    }
  }

  /**
   * Valida si un código de régimen fiscal es válido
   */
  isValidRegimen(code: string): boolean {
    const regimenesValidos = [
      '601', '603', '605', '606', '607', '608', '610', '611', '612', '614',
      '615', '616', '620', '621', '622', '623', '624', '625', '626', '628', '629', '630'
    ];
    return regimenesValidos.includes(code);
  }

  /**
   * Valida si un código de uso CFDI es válido
   */
  isValidUsoCfdi(code: string): boolean {
    const usosValidos = [
      'G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08',
      'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10',
      'S01', 'CP01', 'CN01'
    ];
    return usosValidos.includes(code);
  }

  /**
   * Valida si una clave de unidad es válida
   */
  async isValidClaveUnidad(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cat_clave_unidad')
        .select('clave_unidad')
        .eq('clave_unidad', code)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Valida si una clave de producto/servicio es válida para Carta Porte
   */
  async isValidClaveProdServ(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cat_clave_prod_serv_cp')
        .select('clave_prod_serv')
        .eq('clave_prod_serv', code)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene todos los estados de México
   */
  async getEstados(): Promise<Array<{ clave: string; nombre: string }>> {
    try {
      const { data, error } = await supabase
        .from('cat_estado')
        .select('clave_estado, descripcion')
        .eq('pais_clave', 'MEX')
        .order('descripcion');

      if (error) throw error;

      return (data || []).map(e => ({
        clave: e.clave_estado,
        nombre: e.descripcion
      }));
    } catch (error) {
      console.error('[CatalogosService] Error obteniendo estados:', error);
      return [];
    }
  }

  /**
   * Obtiene municipios de un estado
   */
  async getMunicipiosByEstado(estadoClave: string): Promise<Array<{ clave: string; nombre: string }>> {
    try {
      const { data, error } = await supabase
        .from('cat_municipio')
        .select('clave_municipio, descripcion')
        .eq('estado_clave', estadoClave)
        .order('descripcion');

      if (error) throw error;

      return (data || []).map(m => ({
        clave: m.clave_municipio,
        nombre: m.descripcion
      }));
    } catch (error) {
      console.error('[CatalogosService] Error obteniendo municipios:', error);
      return [];
    }
  }

  /**
   * Limpia el cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ========== Métodos privados ==========

  private isValidCpFormat(cp: string): boolean {
    return /^\d{5}$/.test(cp?.trim() || '');
  }

  private normalizeString(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .trim();
  }

  private cleanOldCache(): void {
    if (this.cache.size > 200) {
      const entries = Array.from(this.cache.entries());
      for (let i = 0; i < 50; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }
}

// Exportar instancia singleton
export const CatalogosService = new CatalogosServiceImpl();

// Exportar clase para testing
export { CatalogosServiceImpl };
