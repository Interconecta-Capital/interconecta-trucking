import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============================================================================
// INTERFACES - Basadas en documentación oficial de SW
// ============================================================================

interface CFDIJson {
  Version: "4.0";
  Serie: string;
  Folio: string;
  Fecha: string;
  SubTotal: string;
  Moneda: "MXN";
  Total: string;
  TipoDeComprobante: "I" | "T" | "P";
  Exportacion: "01";
  LugarExpedicion: string;
  FormaPago?: string;
  MetodoPago?: string;
  Emisor: {
    Rfc: string;
    Nombre: string;
    RegimenFiscal: string;
  };
  Receptor: {
    Rfc: string;
    Nombre: string;
    DomicilioFiscalReceptor: string;
    RegimenFiscalReceptor: string;
    UsoCFDI: string;
  };
  Conceptos: Array<{
    ClaveProdServ: string;
    Cantidad: string;
    ClaveUnidad: string;
    Descripcion: string;
    ValorUnitario: string;
    Importe: string;
    ObjetoImp: "01" | "02";
  }>;
  Impuestos?: {
    TotalImpuestosTrasladados: string;
    Traslados: Array<{
      Base: string;
      Importe: string;
      Impuesto: "002";
      TasaOCuota: "0.160000";
      TipoFactor: "Tasa";
    }>;
  };
  Complemento?: any;
}

interface TimbradoRequest {
  cartaPorteData: any;
  cartaPorteId: string;
  ambiente: 'sandbox' | 'production';
}

// ============================================================================
// FUNCIONES AUXILIARES SIMPLES
// ============================================================================

function formatoFechaSAT(fecha: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
}

function calcularSubtotal(conceptos: any[]): number {
  return conceptos.reduce((sum, c) => {
    const valorUnitario = parseFloat(c.valor_unitario || c.ValorUnitario || c.valor_mercancia || 0);
    const cantidad = parseFloat(c.cantidad || c.Cantidad || 1);
    return sum + (valorUnitario * cantidad);
  }, 0);
}

function determinarTipoComprobante(subtotal: number): "I" | "T" {
  // REGLA SAT CFDI40109: Si hay importe, es "I" (Ingreso)
  return subtotal > 0 ? "I" : "T";
}

function obtenerCodigoPostalEmisor(data: any): string {
  return data.domicilio_fiscal_emisor?.codigo_postal 
    || data.lugarExpedicion 
    || data.lugar_expedicion 
    || "00000";
}

function obtenerCodigoPostalReceptor(data: any): string {
  return data.domicilio_fiscal_receptor?.codigo_postal
    || data.ubicaciones?.find((u: any) => u.tipo_ubicacion === 'Destino')?.domicilio?.codigo_postal
    || "00000";
}

// ============================================================================
// VALIDACIÓN PRE-TIMBRADO
// ============================================================================

function validarEmisorAntesDeTimbrar(rfc: string, nombre: string, ambiente: string): void {
  console.log(`🔍 Validando emisor - Ambiente: ${ambiente}, RFC: ${rfc}, Nombre: ${nombre}`);
  
  if (ambiente === 'sandbox') {
    const rfcsPruebaValidos: Record<string, string> = {
      'EKU9003173C9': 'ESCUELA KEMPER URGATE',
      'CACX7605101P8': 'XOCHILT CASAS CHAVEZ'
    };

    if (rfc in rfcsPruebaValidos) {
      const nombreEsperado = rfcsPruebaValidos[rfc];
      if (nombre !== nombreEsperado) {
        throw new Error(
          `CFDI40139: Para RFC ${rfc} en sandbox, debes usar el nombre oficial del SAT: "${nombreEsperado}". ` +
          `Nombre recibido: "${nombre}". Este RFC es oficial de pruebas del SAT y requiere su nombre exacto.`
        );
      }
      console.log(`✅ Validación exitosa: RFC y nombre coinciden con datos oficiales SAT`);
    } else {
      console.warn(`⚠️ RFC ${rfc} no está en la lista de RFCs de prueba oficiales del SAT. Esto podría causar problemas en sandbox.`);
    }
  } else {
    console.log(`✅ Modo producción - validación de nombre omitida`);
  }
}

// ============================================================================
// CONSTRUCCIÓN DE CFDI - Lógica simplificada
// ============================================================================

function construirEmisor(data: any) {
  return {
    Rfc: data.rfcEmisor || data.rfc_emisor || "",
    Nombre: data.nombreEmisor || data.nombre_emisor || "",
    RegimenFiscal: data.regimen_fiscal_emisor || data.regimenFiscalEmisor || "601"
  };
}

function construirReceptor(data: any) {
  return {
    Rfc: data.rfcReceptor || data.rfc_receptor || "",
    Nombre: data.nombreReceptor || data.nombre_receptor || "",
    DomicilioFiscalReceptor: obtenerCodigoPostalReceptor(data),
    RegimenFiscalReceptor: data.regimen_fiscal_receptor || data.regimenFiscalReceptor || "616",
    UsoCFDI: data.uso_cfdi || data.usoCFDI || "S01"
  };
}

function construirConceptos(data: any, tipoComprobante: "I" | "T"): Array<any> {
  // Si vienen conceptos directos de factura
  if (data.conceptos && data.conceptos.length > 0) {
    return data.conceptos.map((c: any) => {
      const valorUnitario = parseFloat(c.valor_unitario || c.ValorUnitario || 0);
      const cantidad = parseFloat(c.cantidad || c.Cantidad || 1);
      const importe = valorUnitario * cantidad;

      return {
        ClaveProdServ: c.clave_prod_serv || c.ClaveProdServ || "78101800",
        Cantidad: cantidad.toString(),
        ClaveUnidad: c.clave_unidad || c.ClaveUnidad || "E48",
        Descripcion: c.descripcion || c.Descripcion || "Servicio de transporte",
        ValorUnitario: tipoComprobante === "I" ? valorUnitario.toFixed(4) : "0",
        Importe: tipoComprobante === "I" ? importe.toFixed(2) : "0",
        ObjetoImp: "01"
      };
    });
  }

  // Si vienen mercancías (Carta Porte)
  if (data.mercancias && data.mercancias.length > 0) {
    return data.mercancias.map((m: any) => {
      const valorUnitario = parseFloat(m.valor_mercancia || m.valor_unitario || 0);
      const cantidad = parseFloat(m.cantidad || 1);
      const importe = valorUnitario * cantidad;

      return {
        ClaveProdServ: m.bienes_transp || "78101800",
        Cantidad: cantidad.toString(),
        ClaveUnidad: m.clave_unidad || "KGM",
        Descripcion: m.descripcion || "Mercancía",
        ValorUnitario: tipoComprobante === "I" ? valorUnitario.toFixed(4) : "0",
        Importe: tipoComprobante === "I" ? importe.toFixed(2) : "0",
        ObjetoImp: "01"
      };
    });
  }

  // Concepto por defecto
  return [{
    ClaveProdServ: "78101800",
    Cantidad: "1",
    ClaveUnidad: "E48",
    Descripcion: "Servicio de transporte de carga",
    ValorUnitario: "0",
    Importe: "0",
    ObjetoImp: "01"
  }];
}

function construirImpuestos(subtotal: number) {
  const iva = subtotal * 0.16;
  
  return {
    TotalImpuestosTrasladados: iva.toFixed(2),
    Traslados: [{
      Base: subtotal.toFixed(2),
      Importe: iva.toFixed(2),
      Impuesto: "002" as const,
      TasaOCuota: "0.160000",
      TipoFactor: "Tasa" as const
    }]
  };
}

function construirCartaPorte(data: any) {
  const ubicaciones = data.ubicaciones || [];
  const mercancias = data.mercancias || [];

  const cartaPorte: any = {
    "cartaporte31:CartaPorte": {
      Version: "3.1",
      TranspInternac: data.transporte_internacional ? "Sí" : "No",
      TotalDistRec: (data.distancia_total || 0).toFixed(2),

      Ubicaciones: {
        Ubicacion: ubicaciones.map((u: any, idx: number) => ({
          TipoUbicacion: u.tipo_ubicacion === "Origen" ? "Origen" : "Destino",
          IDUbicacion: `OR${String(idx + 1).padStart(6, '0')}`,
          RFCRemitenteDestinatario: u.rfc || "XAXX010101000",
          NombreRemitenteDestinatario: u.nombre || "Público General",
          FechaHoraSalidaLlegada: u.fecha_hora || formatoFechaSAT(new Date()),
          Domicilio: {
            Calle: u.domicilio?.calle || "Sin calle",
            CodigoPostal: u.domicilio?.codigo_postal || "00000",
            Estado: u.domicilio?.estado_clave || "ZAC",
            Pais: "MEX",
            Municipio: u.domicilio?.municipio_clave || "001"
          }
        }))
      },

      Mercancias: {
        PesoBrutoTotal: mercancias.reduce((sum: number, m: any) => sum + (parseFloat(m.peso_kg || 0) * parseFloat(m.cantidad || 1)), 0).toFixed(3),
        UnidadPeso: "KGM",
        NumTotalMercancias: mercancias.length.toString(),

        Mercancia: mercancias.map((m: any) => ({
          BienesTransp: m.bienes_transp || "43232200",
          Descripcion: m.descripcion || "Mercancía",
          Cantidad: (m.cantidad || 1).toString(),
          ClaveUnidad: m.clave_unidad || "KGM",
          PesoEnKg: (parseFloat(m.peso_kg || 0) * parseFloat(m.cantidad || 1)).toFixed(3),
          MaterialPeligroso: m.material_peligroso ? "Sí" : "No"
        })),

        Autotransporte: data.autotransporte ? {
          PermSCT: data.autotransporte.perm_sct || "TPAF01",
          NumPermisoSCT: data.autotransporte.num_permiso_sct || "00000000",
          IdentificacionVehicular: {
            ConfigVehicular: data.autotransporte.config_vehicular || "C2",
            PlacaVM: data.autotransporte.placa_vm || "ABC1234",
            AnioModeloVM: data.autotransporte.anio_modelo_vm || new Date().getFullYear()
          }
        } : undefined
      }
    }
  };

  return cartaPorte;
}

function construirCFDI(data: any): CFDIJson {
  console.log("📝 Construyendo CFDI con datos:", { 
    tieneConceptos: !!data.conceptos,
    tieneMercancias: !!data.mercancias,
    tieneUbicaciones: !!data.ubicaciones
  });

  // 1. Construir conceptos primero
  const conceptosPreliminar = construirConceptos(data, "I");
  
  // 2. Calcular subtotal real
  const subtotal = conceptosPreliminar.reduce((sum, c) => {
    return sum + parseFloat(c.Importe || "0");
  }, 0);

  console.log("💰 Subtotal calculado:", subtotal);

  // 3. Determinar tipo de comprobante
  const tipoComprobante = determinarTipoComprobante(subtotal);
  console.log("📋 Tipo de comprobante:", tipoComprobante);

  // 4. Reconstruir conceptos con tipo correcto
  const conceptos = construirConceptos(data, tipoComprobante);

  // 5. Calcular IVA e importes finales
  const iva = tipoComprobante === "I" ? subtotal * 0.16 : 0;
  const total = subtotal + iva;

  console.log("🧮 Cálculos finales:", { subtotal, iva, total, tipo: tipoComprobante });

  // 6. Construir estructura CFDI
  const cfdi: CFDIJson = {
    Version: "4.0",
    Serie: data.serie || "CP",
    Folio: data.folio || "1",
    Fecha: formatoFechaSAT(new Date()),
    SubTotal: subtotal.toFixed(2),
    Moneda: "MXN",
    Total: total.toFixed(2),
    TipoDeComprobante: tipoComprobante,
    Exportacion: "01",
    LugarExpedicion: obtenerCodigoPostalEmisor(data),
    Emisor: construirEmisor(data),
    Receptor: construirReceptor(data),
    Conceptos: conceptos
  };

  // 7. Agregar FormaPago/MetodoPago SOLO si es tipo "I"
  if (tipoComprobante === "I") {
    cfdi.FormaPago = data.formaPago || data.forma_pago || "01";
    cfdi.MetodoPago = data.metodoPago || data.metodo_pago || "PUE";
  }

  // 8. Agregar impuestos SOLO si es tipo "I" y hay IVA
  if (tipoComprobante === "I" && iva > 0) {
    cfdi.Impuestos = construirImpuestos(subtotal);
  }

  // 9. Agregar CartaPorte si tiene ubicaciones
  if (data.ubicaciones && data.ubicaciones.length >= 2) {
    cfdi.Complemento = construirCartaPorte(data);
  }

  return cfdi;
}

// ============================================================================
// INTEGRACIÓN CON SW
// ============================================================================

async function timbrarConSW(cfdi: CFDIJson, ambiente: 'sandbox' | 'production'): Promise<any> {
  const swToken = Deno.env.get('SW_TOKEN');
  if (!swToken) {
    throw new Error('SW_TOKEN no configurado');
  }

  // ✅ VALIDACIÓN PRE-TIMBRADO: Verificar RFC y nombre del emisor
  validarEmisorAntesDeTimbrar(cfdi.Emisor.Rfc, cfdi.Emisor.Nombre, ambiente);

  const baseUrl = ambiente === 'production' 
    ? 'https://services.sw.com.mx'
    : 'https://services.test.sw.com.mx';

  console.log(`🚀 Timbrando con SW (${ambiente})`);
  console.log("📤 Payload CFDI:", JSON.stringify(cfdi, null, 2));

  const response = await fetch(`${baseUrl}/cfdi33/issue/json/v4`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${swToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cfdi)
  });

  const responseText = await response.text();
  console.log("📥 Respuesta SW (raw):", responseText);

  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(`Respuesta inválida de SW: ${responseText}`);
  }

  if (!response.ok) {
    console.error("❌ Error de SW:", result);
    throw new Error(result.message || result.messageDetail || 'Error en timbrado');
  }

  if (result.status !== 'success') {
    console.error("❌ Timbrado fallido:", result);
    throw new Error(result.message || 'Timbrado rechazado');
  }

  console.log("✅ Timbrado exitoso:", { uuid: result.data?.uuid });
  return result.data;
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cartaPorteData, cartaPorteId, ambiente = 'sandbox' }: TimbradoRequest = await req.json();

    console.log("\n🎯 ============================================");
    console.log("🎯 TIMBRADO V2 - Iniciando");
    console.log("🎯 ============================================");
    console.log("📋 Carta Porte ID:", cartaPorteId);
    console.log("🌍 Ambiente:", ambiente);

    // Validaciones básicas
    if (!cartaPorteId) {
      throw new Error('cartaPorteId es requerido');
    }

    // Construir CFDI
    const cfdi = construirCFDI(cartaPorteData);

    // Timbrar con SW
    const timbrado = await timbrarConSW(cfdi, ambiente);

    // Guardar en Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase
      .from('cartas_porte')
      .update({
        uuid_fiscal: timbrado.uuid,
        status: 'timbrado',
        fecha_timbrado: new Date().toISOString(),
        xml_generado: timbrado.cfdi
      })
      .eq('id', cartaPorteId);

    console.log("✅ Guardado en base de datos");
    console.log("🎯 ============================================\n");

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          uuid: timbrado.uuid,
          xml: timbrado.cfdi,
          cadenaOriginal: timbrado.cadenaOriginalSAT,
          noCertificadoSAT: timbrado.noCertificadoSAT,
          fechaTimbrado: timbrado.fechaTimbrado
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error("\n💥 ============================================");
    console.error("💥 ERROR EN TIMBRADO V2");
    console.error("💥 ============================================");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("💥 ============================================\n");

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        support: "Contacte a soporte si el problema persiste",
        debug: {
          stack: error.stack,
          name: error.name
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
