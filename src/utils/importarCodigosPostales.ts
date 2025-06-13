
import { supabase } from '@/integrations/supabase/client';

interface RegistroSEPOMEX {
  d_codigo: string;      // Código postal
  d_asenta: string;      // Colonia/Asentamiento  
  d_tipo_asenta: string; // Tipo de asentamiento
  d_mnp: string;         // Municipio
  d_estado: string;      // Estado
  d_ciudad: string;      // Ciudad
  d_cp: string;          // Código postal (duplicado)
  c_estado: string;      // Clave estado
  c_oficina: string;     // Clave oficina
  c_cp: string;          // Clave CP
  c_tipo_asenta: string; // Clave tipo asentamiento
  c_mnp: string;         // Clave municipio
  id_asenta_cpcons: string; // ID único
  d_zona: string;        // Zona postal
  c_cve_ciudad: string;  // Clave ciudad
}

export class ImportadorCodigosPostales {
  
  /**
   * Importa datos de SEPOMEX desde un archivo CSV
   * INSTRUCCIONES:
   * 1. Descargar archivo oficial de: https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx
   * 2. Convertir a CSV si es necesario
   * 3. Llamar esta función con los datos
   */
  static async importarDesdeCSV(archivo: File): Promise<{exitosos: number, errores: number}> {
    console.log('[IMPORTADOR] Iniciando importación desde CSV...');
    
    const texto = await archivo.text();
    const lineas = texto.split('\n');
    const headers = lineas[0].split(',');
    
    let exitosos = 0;
    let errores = 0;
    const loteSize = 100; // Procesar en lotes de 100
    
    for (let i = 1; i < lineas.length; i += loteSize) {
      const lote = lineas.slice(i, i + loteSize);
      const registros = [];
      
      for (const linea of lote) {
        if (!linea.trim()) continue;
        
        const valores = linea.split(',');
        if (valores.length < headers.length) continue;
        
        try {
          const registro = {
            codigo_postal: valores[0]?.replace(/"/g, '').trim(),
            colonia: valores[1]?.replace(/"/g, '').trim(),
            tipo_asentamiento: valores[2]?.replace(/"/g, '').trim(),
            municipio: valores[3]?.replace(/"/g, '').trim(),
            estado: valores[4]?.replace(/"/g, '').trim(),
            ciudad: valores[5]?.replace(/"/g, '').trim(),
            estado_clave: valores[6]?.replace(/"/g, '').trim(),
            municipio_clave: valores[7]?.replace(/"/g, '').trim(),
            zona: valores[8]?.replace(/"/g, '').toLowerCase().trim()
          };
          
          // Validar datos esenciales
          if (registro.codigo_postal && registro.colonia && registro.estado && registro.municipio) {
            registros.push(registro);
          }
        } catch (error) {
          console.warn('[IMPORTADOR] Error procesando línea:', linea, error);
          errores++;
        }
      }
      
      // Insertar lote en base de datos
      if (registros.length > 0) {
        try {
          const { error } = await supabase
            .from('codigos_postales_mexico')
            .insert(registros);
          
          if (error) {
            console.error('[IMPORTADOR] Error insertando lote:', error);
            errores += registros.length;
          } else {
            exitosos += registros.length;
            console.log(`[IMPORTADOR] Lote insertado: ${registros.length} registros`);
          }
        } catch (error) {
          console.error('[IMPORTADOR] Error en lote:', error);
          errores += registros.length;
        }
      }
    }
    
    console.log(`[IMPORTADOR] Importación completada: ${exitosos} exitosos, ${errores} errores`);
    return { exitosos, errores };
  }
  
  /**
   * Importa datos desde la API de SEPOMEX (método alternativo)
   */
  static async importarDesdeAPI(): Promise<{exitosos: number, errores: number}> {
    console.log('[IMPORTADOR] Importando desde API SEPOMEX...');
    
    // Lista de estados mexicanos para iterar
    const estados = [
      '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
      '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
      '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
      '31', '32'
    ];
    
    let exitosos = 0;
    let errores = 0;
    
    // Implementar lógica de importación desde API
    // (Esto requeriría una API que permita consultas masivas)
    
    return { exitosos, errores };
  }
  
  /**
   * Verifica la cobertura actual de la base de datos
   */
  static async verificarCobertura(): Promise<{
    totalCPs: number;
    totalColonias: number;
    estadosCubiertos: string[];
    cpsPorEstado: Record<string, number>;
  }> {
    console.log('[IMPORTADOR] Verificando cobertura...');
    
    const { data, error } = await supabase
      .from('codigos_postales_mexico')
      .select('codigo_postal, estado, colonia');
    
    if (error) {
      throw new Error(`Error verificando cobertura: ${error.message}`);
    }
    
    const cpSet = new Set();
    const coloniaSet = new Set();
    const estadosSet = new Set();
    const cpsPorEstado: Record<string, number> = {};
    
    data?.forEach(registro => {
      cpSet.add(registro.codigo_postal);
      coloniaSet.add(`${registro.codigo_postal}-${registro.colonia}`);
      estadosSet.add(registro.estado);
      
      cpsPorEstado[registro.estado] = (cpsPorEstado[registro.estado] || 0) + 1;
    });
    
    return {
      totalCPs: cpSet.size,
      totalColonias: coloniaSet.size,
      estadosCubiertos: Array.from(estadosSet) as string[],
      cpsPorEstado
    };
  }
}

/**
 * GUÍA DE USO:
 * 
 * 1. Para importar archivo SEPOMEX completo:
 *    const resultado = await ImportadorCodigosPostales.importarDesdeCSV(archivo);
 * 
 * 2. Para verificar cobertura actual:
 *    const cobertura = await ImportadorCodigosPostales.verificarCobertura();
 * 
 * 3. Fuentes de datos recomendadas:
 *    - SEPOMEX oficial: https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx
 *    - INEGI: Catálogo de localidades
 *    - GitHub: mexico-zip-codes datasets
 */
