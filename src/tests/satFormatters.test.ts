import { describe, it, expect } from 'vitest';
import { SATFormatters } from '@/utils/satFormatters';

describe('SATFormatters', () => {
  it('debe formatear fecha sin milisegundos', () => {
    const fecha = new Date('2025-11-24T14:30:15.266Z');
    const resultado = SATFormatters.formatFechaCFDI(fecha);
    expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    expect(resultado).not.toContain('.');
    expect(resultado).not.toContain('Z');
  });

  it('debe validar RFC correctamente', () => {
    expect(SATFormatters.validarRFC('ABC123456XXX')).toBe(true);
    expect(SATFormatters.validarRFC('ABCD123456XXX')).toBe(true);
    expect(SATFormatters.validarRFC('invalid')).toBe(false);
    expect(SATFormatters.validarRFC('')).toBe(false);
  });

  it('debe formatear valores monetarios con 2 decimales', () => {
    expect(SATFormatters.formatMonetario(100)).toBe('100.00');
    expect(SATFormatters.formatMonetario(100.5)).toBe('100.50');
    expect(SATFormatters.formatMonetario(100.999)).toBe('101.00');
    expect(SATFormatters.formatMonetario(0)).toBe('0.00');
  });

  it('debe validar código postal mexicano', () => {
    expect(SATFormatters.validarCodigoPostal('09209')).toBe(true);
    expect(SATFormatters.validarCodigoPostal('12345')).toBe(true);
    expect(SATFormatters.validarCodigoPostal('1234')).toBe(false);
    expect(SATFormatters.validarCodigoPostal('123456')).toBe(false);
    expect(SATFormatters.validarCodigoPostal('abcde')).toBe(false);
  });

  it('debe escapar caracteres especiales XML', () => {
    expect(SATFormatters.escaparXML('Test & Company')).toBe('Test &amp; Company');
    expect(SATFormatters.escaparXML('<tag>')).toBe('&lt;tag&gt;');
    expect(SATFormatters.escaparXML('"quoted"')).toBe('&quot;quoted&quot;');
    expect(SATFormatters.escaparXML("it's")).toBe('it&#39;s');
  });
});
