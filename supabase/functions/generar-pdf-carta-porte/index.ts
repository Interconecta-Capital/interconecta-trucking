import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest { id: string }

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { id } = await req.json() as GenerateRequest;
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'id requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('cartas_porte')
      .select('id, folio, rfc_emisor, nombre_emisor, rfc_receptor, nombre_receptor, xml_generado, uuid_fiscal, datos_formulario')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error('Carta porte no encontrada');

    const { data: tracking } = await supabase
      .from('tracking_carta_porte')
      .select('metadata')
      .eq('carta_porte_id', id)
      .eq('evento', 'timbrado')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const meta = tracking?.metadata ?? {};
    const cadenaOriginal = meta.cadena_original ?? '';
    const selloDigital = meta.sello_digital ?? '';
    let qrCode: string | undefined = meta.qrCode || meta.qr_code;
    let idCCP: string | undefined = meta.idCCP;

    let formData: any = {};
    try {
      formData = typeof data.datos_formulario === 'string'
        ? JSON.parse(data.datos_formulario)
        : (data.datos_formulario || {});
    } catch (_) {
      formData = {};
    }

    if (data.xml_generado) {
      if (!qrCode) {
        const matchQR = data.xml_generado.match(/QRCode="([^"]+)"/);
        if (matchQR) qrCode = matchQR[1];
      }
      if (!idCCP) {
        const matchId = data.xml_generado.match(/IdCCP="([^"]+)"/);
        if (matchId) idCCP = matchId[1];
      }
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = height - 40;

    const drawText = (text: string, options: { bold?: boolean; size?: number } = {}) => {
      page.drawText(text, {
        x: 50,
        y,
        size: options.size ?? 10,
        font: options.bold ? bold : font
      });
      y -= (options.size ?? 10) + 6;
    };

    drawText('Carta Porte', { bold: true, size: 18 });
    if (data.uuid_fiscal) drawText(`UUID: ${data.uuid_fiscal}`);
    if (idCCP) drawText(`IdCCP: ${idCCP}`);
    if (selloDigital) drawText(`Sello Digital: ${selloDigital}`, { size: 8 });
    if (cadenaOriginal) drawText(`Cadena Original: ${cadenaOriginal}`, { size: 8 });
    y -= 10;

    drawText('Emisor', { bold: true });
    drawText(`RFC: ${data.rfc_emisor}`);
    if (data.nombre_emisor) drawText(`Nombre: ${data.nombre_emisor}`);
    y -= 10;

    drawText('Receptor', { bold: true });
    drawText(`RFC: ${data.rfc_receptor}`);
    if (data.nombre_receptor) drawText(`Nombre: ${data.nombre_receptor}`);
    y -= 10;

    if (Array.isArray(formData.mercancias) && formData.mercancias.length) {
      drawText('Mercancías', { bold: true });
      for (const m of formData.mercancias) {
        drawText(`${m.descripcion || ''} Cant:${m.cantidad ?? ''} ${m.clave_unidad ?? ''}`);
      }
      y -= 10;
    }

    if (Array.isArray(formData.ubicaciones) && formData.ubicaciones.length) {
      drawText('Ubicaciones', { bold: true });
      for (const u of formData.ubicaciones) {
        const loc = `${u.tipo_ubicacion || ''} ${u.domicilio?.estado || ''} ${u.domicilio?.codigo_postal || ''}`;
        drawText(loc);
      }
      y -= 10;
    }

    if (Array.isArray(formData.figuras) && formData.figuras.length) {
      drawText('Figuras', { bold: true });
      for (const f of formData.figuras) {
        drawText(`${f.tipo_figura || ''} ${f.nombre_figura || ''} RFC:${f.rfc_figura || ''}`);
      }
      y -= 10;
    }

    if (qrCode) {
      try {
        const base = qrCode.startsWith('data:') ? qrCode.split(',')[1] : qrCode;
        const png = Uint8Array.from(atob(base), c => c.charCodeAt(0));
        const img = await pdfDoc.embedPng(png);
        const dim = img.scale(0.5);
        page.drawImage(img, { x: width - dim.width - 50, y: 40, width: dim.width, height: dim.height });
      } catch (e) {
        console.error('QR embed error', e);
      }
    }

    const bytes = await pdfDoc.save();
    const pdfBase64 = btoa(String.fromCharCode(...bytes));

    return new Response(
      JSON.stringify({
        success: true,
        pdfBase64,
        uuid: data.uuid_fiscal,
        idCCP,
        selloDigital,
        cadenaOriginal,
        qrCode,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error generando PDF:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
