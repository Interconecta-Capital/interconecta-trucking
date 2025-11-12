export const FIELD_HELP_TEXTS = {
  // Configuración General - Emisor
  rfcEmisor: {
    help: "Es el RFC de la empresa que está transportando la mercancía. El SAT lo usa para saber quién es responsable del transporte.",
    example: "ABC123456XYZ"
  },
  nombreEmisor: {
    help: "Nombre completo o razón social de la empresa que transporta. Debe coincidir con el RFC registrado en el SAT.",
    example: "TRANSPORTES GARCIA SA DE CV"
  },
  regimenFiscalEmisor: {
    help: "El régimen fiscal en el que tributa la empresa transportista ante el SAT.",
    example: "General de Ley Personas Morales"
  },
  
  // Configuración General - Receptor
  rfcReceptor: {
    help: "Es el RFC de la persona o empresa que va a recibir la mercancía al final del viaje.",
    example: "DEF789012GHI"
  },
  nombreReceptor: {
    help: "Nombre completo o razón social de quien recibe la mercancía. Debe coincidir con el RFC.",
    example: "COMERCIALIZADORA LOPEZ SA"
  },
  usoCfdi: {
    help: "Indica el uso que le dará el receptor al comprobante fiscal para efectos de su contabilidad y declaraciones.",
    example: "G01 - Adquisición de mercancías"
  },
  
  // Ubicaciones
  codigoPostal: {
    help: "El código postal de 5 dígitos del lugar. Sirve para ubicar exactamente dónde inicia o termina el viaje.",
    example: "01000"
  },
  calle: {
    help: "Nombre de la calle donde se ubica el origen o destino del transporte. Sea lo más específico posible.",
    example: "Av. Reforma"
  },
  numeroExterior: {
    help: "Número exterior del domicilio. Si no tiene número, puede escribir 'S/N'.",
    example: "123"
  },
  colonia: {
    help: "Nombre de la colonia, fraccionamiento o barrio donde se encuentra la ubicación.",
    example: "Centro"
  },
  municipio: {
    help: "Nombre del municipio o alcaldía donde se realiza la carga o descarga.",
    example: "Benito Juárez"
  },
  estado: {
    help: "Estado de la República Mexicana donde se encuentra la ubicación.",
    example: "Ciudad de México"
  },
  fechaHoraSalida: {
    help: "Fecha y hora exacta en que el vehículo sale del punto de origen con la mercancía.",
    example: "2024-03-15 08:00"
  },
  fechaHoraLlegada: {
    help: "Fecha y hora programada de llegada al destino. Debe ser posterior a la fecha de salida.",
    example: "2024-03-15 18:00"
  },
  
  // Mercancías
  descripcionMercancia: {
    help: "Descripción clara y detallada de lo que se transporta. Sea específico para evitar problemas en inspecciones.",
    example: "Piezas de acero inoxidable para construcción"
  },
  cantidad: {
    help: "Cantidad total de unidades, piezas o bultos que se transportan de este producto.",
    example: "100"
  },
  pesoKg: {
    help: "El peso total de la mercancía en kilogramos. Es importante para verificar que el vehículo puede cargar ese peso.",
    example: "1500"
  },
  valorMercancia: {
    help: "Valor comercial total de la mercancía en pesos mexicanos. Se usa para calcular seguros y cobros.",
    example: "50000.00"
  },
  claveProducto: {
    help: "Clave del catálogo SAT que identifica el tipo de producto. Busque la clave que mejor describa su mercancía.",
    example: "78101800"
  },
  
  // Autotransporte
  placaVehiculo: {
    help: "Las placas del camión o vehículo que transporta la mercancía. Debe coincidir con el permiso SCT y la tarjeta de circulación.",
    example: "123-ABC-4"
  },
  anioModelo: {
    help: "Año del modelo del vehículo según la tarjeta de circulación.",
    example: "2020"
  },
  configVehicular: {
    help: "Tipo de configuración del vehículo según el catálogo de la SCT. Indica cuántos ejes tiene y su tipo.",
    example: "C2 - Camión Unitario (2 ejes)"
  },
  tipoCarroceria: {
    help: "Tipo de carrocería o caja del vehículo. Define cómo está construido el espacio de carga.",
    example: "Caja cerrada"
  },
  pesoBruto: {
    help: "Peso bruto vehicular en kilogramos. Es el peso máximo autorizado del vehículo más su carga.",
    example: "16000"
  },
  permisoSCT: {
    help: "Tipo de permiso federal otorgado por la SCT para realizar transporte de carga.",
    example: "TPAF01 - Autotransporte Federal"
  },
  numeroPermisoSCT: {
    help: "Número de folio del permiso SCT. Lo encuentra en su permiso federal de transporte.",
    example: "2024123456"
  },
  aseguradoraRC: {
    help: "Nombre de la compañía que asegura el vehículo contra responsabilidad civil.",
    example: "AXA Seguros"
  },
  polizaRC: {
    help: "Número de póliza del seguro de responsabilidad civil. Es obligatorio para el transporte federal.",
    example: "RC-2024-123456"
  },
  
  // Figuras del Transporte
  rfcOperador: {
    help: "RFC del conductor que opera el vehículo. Debe ser una persona física con licencia federal.",
    example: "GAPM850301HDF"
  },
  nombreOperador: {
    help: "Nombre completo del conductor como aparece en su licencia federal.",
    example: "MIGUEL ANGEL GARCIA PEREZ"
  },
  licenciaFederal: {
    help: "Número de la licencia federal tipo E (especial) para transporte de carga.",
    example: "E-12345678"
  },
  vigenciaLicencia: {
    help: "Fecha de vencimiento de la licencia federal. Debe estar vigente durante todo el viaje.",
    example: "2025-12-31"
  }
};
