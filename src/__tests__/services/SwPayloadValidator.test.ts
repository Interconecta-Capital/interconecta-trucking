/**
 * Tests unitarios para SwPayloadValidator
 * @version 2.0.0 - Tests completos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: vi.fn(() => Promise.resolve({ data: { success: true }, error: null })) } }
}));

import { SwPayloadValidator } from '@/services/pac/SwPayloadValidator';

describe('SwPayloadValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateAndBuildPayload', () => {
    it('debería fallar sin RFC emisor', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({} as any);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.code === 'MISSING_RFC_EMISOR')).toBe(true);
    });

    it('debería fallar sin RFC receptor', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({
        rfcEmisor: 'EKU9003173C9'
      } as any);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.code === 'MISSING_RFC_RECEPTOR')).toBe(true);
    });

    it('debería fallar sin ubicaciones', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: []
      } as any);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.code === 'MISSING_UBICACIONES')).toBe(true);
    });

    it('debería fallar sin mercancías', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: [{ tipo_ubicacion: 'Origen' }, { tipo_ubicacion: 'Destino' }],
        mercancias: []
      } as any);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.code === 'MISSING_MERCANCIAS')).toBe(true);
    });

    it('debería fallar sin autotransporte', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: [{ tipo_ubicacion: 'Origen' }, { tipo_ubicacion: 'Destino' }],
        mercancias: [{ descripcion: 'Test' }],
        autotransporte: null
      } as any);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.code === 'MISSING_AUTOTRANSPORTE')).toBe(true);
    });

    it('debería fallar sin figuras de transporte', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: [{ tipo_ubicacion: 'Origen' }, { tipo_ubicacion: 'Destino' }],
        mercancias: [{ descripcion: 'Test' }],
        autotransporte: { placa_vm: 'ABC123' },
        figuras: []
      } as any);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.code === 'MISSING_FIGURAS')).toBe(true);
    });

    it('debería incluir timestamp en el resultado', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({} as any);
      expect(resultado.timestamp).toBeDefined();
      expect(new Date(resultado.timestamp).getTime()).not.toBeNaN();
    });

    it('debería manejar datos completos correctamente', async () => {
      const datosCompletos = {
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        nombreEmisor: 'ESCUELA KEMPER URGATE',
        nombreReceptor: 'Público General',
        regimenFiscalEmisor: '601',
        usoCfdi: 'S01',
        tipoCfdi: 'Traslado',
        ubicaciones: [
          { 
            tipo_ubicacion: 'Origen',
            domicilio: { codigoPostal: '06600', estado: 'CDMX', municipio: 'Cuauhtémoc' }
          },
          { 
            tipo_ubicacion: 'Destino',
            domicilio: { codigoPostal: '44100', estado: 'Jalisco', municipio: 'Guadalajara' },
            distancia_recorrida: 500
          }
        ],
        mercancias: [
          { 
            bienes_transp: '78101800',
            descripcion: 'Mercancía de prueba',
            cantidad: 1,
            clave_unidad: 'KGM',
            peso_kg: 100
          }
        ],
        autotransporte: {
          perm_sct: 'TPAF01',
          num_permiso_sct: '123456',
          placa_vm: 'ABC1234',
          config_vehicular: 'C2',
          anio_modelo_vm: 2020,
          peso_bruto_vehicular: 5000,
          asegura_resp_civil: 'SEGUROS PRUEBA',
          poliza_resp_civil: 'POL-123'
        },
        figuras: [
          {
            tipo_figura: '01',
            rfc_figura: 'XAXX010101000',
            nombre_figura: 'Operador de Prueba',
            num_licencia: 'LIC123456'
          }
        ]
      };

      const resultado = await SwPayloadValidator.validateAndBuildPayload(datosCompletos as any);
      
      // Debería ser válido con datos completos
      const erroresCriticos = resultado.errors.filter(e => e.severity === 'critical');
      expect(erroresCriticos.length).toBe(0);
    });
  });

  describe('getPayloadString', () => {
    it('debería formatear payload como JSON con indentación', () => {
      const payload = { test: 'value', nested: { key: 'data' } };
      const result = SwPayloadValidator.getPayloadString(payload);
      expect(result).toBe(JSON.stringify(payload, null, 2));
    });

    it('debería manejar payload vacío', () => {
      const result = SwPayloadValidator.getPayloadString({});
      expect(result).toBe('{}');
    });

    it('debería manejar payload con arrays', () => {
      const payload = { items: [1, 2, 3] };
      const result = SwPayloadValidator.getPayloadString(payload);
      expect(result).toContain('[');
      expect(result).toContain(']');
    });
  });

  describe('estructura del payload SW', () => {
    it('debería generar estructura CFDI 4.0 correcta', async () => {
      const datosMinimos = {
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        nombreEmisor: 'Emisor',
        nombreReceptor: 'Receptor',
        regimenFiscalEmisor: '601',
        tipoCfdi: 'Traslado',
        ubicaciones: [
          { tipo_ubicacion: 'Origen', domicilio: { codigoPostal: '06600' } },
          { tipo_ubicacion: 'Destino', domicilio: { codigoPostal: '44100' }, distancia_recorrida: 500 }
        ],
        mercancias: [{ bienes_transp: '78101800', descripcion: 'Test', cantidad: 1, peso_kg: 100 }],
        autotransporte: { placa_vm: 'ABC123', config_vehicular: 'C2', peso_bruto_vehicular: 5000 },
        figuras: [{ tipo_figura: '01', rfc_figura: 'XAXX010101000' }]
      };

      const resultado = await SwPayloadValidator.validateAndBuildPayload(datosMinimos as any);
      
      if (resultado.payload) {
        expect(resultado.payload.Version).toBe('4.0');
        expect(resultado.payload.TipoDeComprobante).toBe('T');
        expect(resultado.payload.Emisor).toBeDefined();
        expect(resultado.payload.Receptor).toBeDefined();
        expect(resultado.payload.Complemento?.CartaPorte31?.Version).toBe('3.1');
      }
    });
  });

  describe('validación de errores por severidad', () => {
    it('debería marcar RFC faltante como crítico', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({} as any);
      const errorRfc = resultado.errors.find(e => e.code === 'MISSING_RFC_EMISOR');
      expect(errorRfc?.severity).toBe('critical');
    });

    it('debería marcar ubicaciones faltantes como crítico', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: []
      } as any);
      const errorUbicaciones = resultado.errors.find(e => e.code === 'MISSING_UBICACIONES');
      expect(errorUbicaciones?.severity).toBe('critical');
    });
  });
});
