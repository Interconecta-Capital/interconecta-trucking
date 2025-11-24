# Catálogos SAT para CFDI 4.0 y CartaPorte 3.1

## c_RegimenFiscal (Régimen Fiscal)

| Código | Descripción |
|--------|-------------|
| 601 | General de Ley Personas Morales |
| 603 | Personas Morales con Fines no Lucrativos |
| 605 | Sueldos y Salarios e Ingresos Asimilados a Salarios |
| 606 | Arrendamiento |
| 607 | Régimen de Enajenación o Adquisición de Bienes |
| 608 | Demás ingresos |
| 610 | Residentes en el Extranjero sin Establecimiento Permanente en México |
| 611 | Ingresos por Dividendos (socios y accionistas) |
| 612 | Personas Físicas con Actividades Empresariales y Profesionales |
| 614 | Ingresos por intereses |
| 615 | Régimen de los ingresos por obtención de premios |
| 616 | Sin obligaciones fiscales |
| 620 | Sociedades Cooperativas de Producción que optan por diferir sus ingresos |
| 621 | Incorporación Fiscal |
| 622 | Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras |
| 623 | Opcional para Grupos de Sociedades |
| 624 | Coordinados |
| 625 | Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas |
| 626 | Régimen Simplificado de Confianza |
| 628 | Hidrocarburos |
| 629 | De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales |
| 630 | Enajenación de acciones en bolsa de valores |

## c_UsoCFDI (Uso del CFDI)

### Adquisición de Mercancías
| Código | Descripción |
|--------|-------------|
| G01 | Adquisición de mercancías |
| G02 | Devoluciones, descuentos o bonificaciones |
| G03 | Gastos en general |

### Inversiones
| Código | Descripción |
|--------|-------------|
| I01 | Construcciones |
| I02 | Mobilario y equipo de oficina por inversiones |
| I03 | Equipo de transporte |
| I04 | Equipo de cómputo y accesorios |
| I05 | Dados, troqueles, moldes, matrices y herramental |
| I06 | Comunicaciones telefónicas |
| I07 | Comunicaciones satelitales |
| I08 | Otra maquinaria y equipo |

### Deducción Personal
| Código | Descripción |
|--------|-------------|
| D01 | Honorarios médicos, dentales y gastos hospitalarios |
| D02 | Gastos médicos por incapacidad o discapacidad |
| D03 | Gastos funerales |
| D04 | Donativos |
| D05 | Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación) |
| D06 | Aportaciones voluntarias al SAR |
| D07 | Primas por seguros de gastos médicos |
| D08 | Gastos de transportación escolar obligatoria |
| D09 | Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones |
| D10 | Pagos por servicios educativos (colegiaturas) |

### Otros
| Código | Descripción |
|--------|-------------|
| S01 | Sin efectos fiscales |
| CP01 | Pagos (Complemento de Pagos) |
| CN01 | Nómina |

## c_FormaPago (Forma de Pago)

| Código | Descripción |
|--------|-------------|
| 01 | Efectivo |
| 02 | Cheque nominativo |
| 03 | Transferencia electrónica de fondos |
| 04 | Tarjeta de crédito |
| 05 | Monedero electrónico |
| 06 | Dinero electrónico |
| 08 | Vales de despensa |
| 12 | Dación en pago |
| 13 | Pago por subrogación |
| 14 | Pago por consignación |
| 15 | Condonación |
| 17 | Compensación |
| 23 | Novación |
| 24 | Confusión |
| 25 | Remisión de deuda |
| 26 | Prescripción o caducidad |
| 27 | A satisfacción del acreedor |
| 28 | Tarjeta de débito |
| 29 | Tarjeta de servicios |
| 30 | Aplicación de anticipos |
| 31 | Intermediario pagos |
| 99 | Por definir |

## c_MetodoPago (Método de Pago)

| Código | Descripción |
|--------|-------------|
| PUE | Pago en una sola exhibición |
| PPD | Pago en parcialidades o diferido |

## c_Moneda

| Código | Descripción |
|--------|-------------|
| MXN | Peso Mexicano |
| USD | Dólar estadounidense |
| EUR | Euro |
| XXX | Los códigos asignados para las transacciones en que intervenga ninguna moneda |

## c_ClaveProdServ (Clave de Producto o Servicio)

Ejemplos comunes:
| Código | Descripción |
|--------|-------------|
| 78101800 | Servicios de transporte de carga por carretera |
| 78101801 | Servicios de transporte de carga consolidada |
| 78101802 | Servicios de transporte local de carga |
| 43211500 | Vehículos comerciales de carretera |

## c_ClaveUnidad (Clave de Unidad de Medida)

| Código | Descripción |
|--------|-------------|
| E48 | Unidad de servicio |
| KGM | Kilogramo |
| TNE | Tonelada |
| LTR | Litro |
| MTR | Metro |
| KTM | Kilómetro |
| H87 | Pieza |
| XBX | Caja |

## c_TipoPermiso (CartaPorte - Tipo de Permiso SCT)

| Código | Descripción |
|--------|-------------|
| TPAF01 | Autotransporte Federal de carga general |
| TPAF02 | Transporte privado de carga |
| TPAF03 | Autotransporte Federal de Carga Especializada de materiales y residuos peligrosos |
| TPAF04 | Transporte de automóviles sin rodar en vehículo tipo góndola |
| TPAF05 | Transporte de carga de gran peso y/o volumen de hasta 90 toneladas |
| TPAF06 | Transporte de mercancías entre distintos países (internacional) |
| TPAF07 | Operadores de grúas |
| TPAF08 | Servicio de paquetería y mensajería |
| TPAF09 | Autotransporte Federal de pasajeros |
| TPAF10 | Turismo |

## c_ConfigAutotransporte (Configuración Vehicular)

| Código | Descripción |
|--------|-------------|
| C2 | Camión Unitario (2 llantas en el eje delantero y 4 llantas en el eje trasero) |
| C3 | Camión Unitario (2 llantas en el eje delantero y 6 o más llantas en los ejes traseros) |
| T2S1 | Tractocamión articulado de 2 ejes y Semirremolque de 1 eje |
| T2S2 | Tractocamión articulado de 2 ejes y Semirremolque de 2 ejes |
| T2S3 | Tractocamión articulado de 2 ejes y Semirremolque de 3 ejes |
| T3S1 | Tractocamión articulado de 3 ejes y Semirremolque de 1 eje |
| T3S2 | Tractocamión articulado de 3 ejes y Semirremolque de 2 ejes |
| T3S3 | Tractocamión articulado de 3 ejes y Semirremolque de 3 ejes |
| C2R2 | Camión Unitario de 2 ejes y Remolque de 2 ejes |
| C3R2 | Camión Unitario de 3 ejes y Remolque de 2 ejes |
| C3R3 | Camión Unitario de 3 ejes y Remolque de 3 ejes |

## c_TipoFigura (CartaPorte - Tipo de Figura de Transporte)

| Código | Descripción |
|--------|-------------|
| 01 | Operador |
| 02 | Propietario |
| 03 | Arrendador |
| 04 | Notificado |

## Validaciones de Formato

### RFC
- Persona Moral: 3 letras + 6 dígitos + 3 caracteres alfanuméricos
- Persona Física: 4 letras + 6 dígitos + 3 caracteres alfanuméricos
- Patrón: `^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$`

### Código Postal
- Formato: 5 dígitos
- Patrón: `^\d{5}$`

### Fecha CFDI
- Formato: YYYY-MM-DDTHH:MM:SS
- Sin milisegundos ni zona horaria
- Patrón: `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$`

### Valores Monetarios
- SubTotal, Total: 2 decimales
- Formato: `^\d+\.\d{2}$`

### Valores de Peso
- PesoEnKg: 3 decimales
- Formato: `^\d+\.\d{3}$`

### Valores de Distancia
- DistanciaRecorrida: 3 decimales
- Formato: `^\d+\.\d{3}$`

## Referencias

- [Portal SAT - Catálogos CFDI 4.0](http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/catCFDI.xls)
- [Portal SAT - CartaPorte 3.1](http://omawww.sat.gob.mx/tramitesyservicios/Paginas/complemento_carta_porte.htm)
- [SmartWeb - Documentación](https://developers.sw.com.mx/)
