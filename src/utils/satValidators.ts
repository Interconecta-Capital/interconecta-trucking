/**
 * Validadores exhaustivos según catálogos SAT
 */

export class SATValidators {
  // Catálogos SAT actualizados
  static readonly REGIMENES_FISCALES = [
    '601', '603', '605', '606', '607', '608', '610', '611', '612', '614',
    '615', '616', '620', '621', '622', '623', '624', '625', '626', '628', '629', '630'
  ];

  static readonly USOS_CFDI = [
    'G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08',
    'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10',
    'S01', 'CP01', 'CN01'
  ];

  static readonly FORMAS_PAGO = [
    '01', '02', '03', '04', '05', '06', '08', '12', '13', '14', '15',
    '17', '23', '24', '25', '26', '27', '28', '29', '30', '31', '99'
  ];

  static readonly METODOS_PAGO = ['PUE', 'PPD'];

  static readonly MONEDAS = ['MXN', 'USD', 'EUR', 'XXX'];

  static validarRegimenFiscal(regimen: string): boolean {
    return this.REGIMENES_FISCALES.includes(regimen);
  }

  static validarUsoCFDI(uso: string): boolean {
    return this.USOS_CFDI.includes(uso);
  }

  static validarFormaPago(forma: string): boolean {
    return this.FORMAS_PAGO.includes(forma);
  }

  static validarMetodoPago(metodo: string): boolean {
    return this.METODOS_PAGO.includes(metodo);
  }

  static validarMoneda(moneda: string): boolean {
    return this.MONEDAS.includes(moneda);
  }
}
