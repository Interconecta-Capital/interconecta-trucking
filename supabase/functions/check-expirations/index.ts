import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpirationWindow {
  days: number;
  label: string;
}

const EXPIRATION_WINDOWS: ExpirationWindow[] = [
  { days: 30, label: '30 días' },
  { days: 15, label: '15 días' },
  { days: 7, label: '7 días' },
  { days: 3, label: '3 días' },
  { days: 1, label: '1 día' }
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Verify secret header for cron authentication
  const CRON_SECRET = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('X-Cron-Secret');

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    console.log('❌ [check-expirations] Unauthorized access attempt');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }), 
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 [check-expirations] Iniciando verificación de vencimientos...');

    const now = new Date();
    const stats = {
      certificados: 0,
      seguros: 0,
      licencias: 0,
      permisos: 0,
      total: 0
    };

    // ==========================================
    // 1. CERTIFICADOS DIGITALES
    // ==========================================
    console.log('📜 Verificando certificados digitales...');
    
    for (const window of EXPIRATION_WINDOWS) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + window.days);
      
      const { data: certificados, error: certError } = await supabase
        .from('certificados_digitales')
        .select('id, user_id, nombre_certificado, fecha_fin_vigencia, rfc_titular')
        .eq('activo', true)
        .gte('fecha_fin_vigencia', now.toISOString())
        .lte('fecha_fin_vigencia', targetDate.toISOString());

      if (certError) {
        console.error('Error consultando certificados:', certError);
        continue;
      }

      for (const cert of certificados || []) {
        // Verificar si ya existe notificación reciente para este certificado
        const { data: existingNotif } = await supabase
          .from('notificaciones')
          .select('id')
          .eq('user_id', cert.user_id)
          .eq('tipo', 'warning')
          .ilike('titulo', '%Certificado Digital%')
          .gte('created_at', new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (existingNotif && existingNotif.length > 0) {
          console.log(`⏭️ Ya existe notificación reciente para certificado ${cert.id}`);
          continue;
        }

        const diasRestantes = Math.ceil(
          (new Date(cert.fecha_fin_vigencia).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        await supabase
          .from('notificaciones')
          .insert({
            user_id: cert.user_id,
            tipo: 'warning',
            titulo: `Certificado Digital vence en ${window.label}`,
            mensaje: `Tu certificado "${cert.nombre_certificado}" (RFC: ${cert.rfc_titular}) vencerá el ${new Date(cert.fecha_fin_vigencia).toLocaleDateString('es-MX')}. Renuévalo para continuar timbrando.`,
            urgente: window.days <= 7,
            metadata: {
              link: '/configuracion/empresa',
              entityType: 'certificado',
              entityId: cert.id,
              actionRequired: true,
              expiresAt: cert.fecha_fin_vigencia,
              icon: 'FileText',
              diasRestantes
            }
          });

        stats.certificados++;
        stats.total++;
        console.log(`✅ Notificación creada para certificado ${cert.id} (vence en ${diasRestantes} días)`);
      }
    }

    // ==========================================
    // 2. SEGUROS DE VEHÍCULOS
    // ==========================================
    console.log('🚗 Verificando seguros de vehículos...');
    
    for (const window of EXPIRATION_WINDOWS) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + window.days);
      
      const { data: vehiculos, error: vehError } = await supabase
        .from('vehiculos')
        .select('id, user_id, placa, vigencia_seguro, poliza_resp_civil')
        .eq('activo', true)
        .not('vigencia_seguro', 'is', null)
        .gte('vigencia_seguro', now.toISOString())
        .lte('vigencia_seguro', targetDate.toISOString());

      if (vehError) {
        console.error('Error consultando vehículos:', vehError);
        continue;
      }

      for (const vehiculo of vehiculos || []) {
        const { data: existingNotif } = await supabase
          .from('notificaciones')
          .select('id')
          .eq('user_id', vehiculo.user_id)
          .eq('tipo', 'warning')
          .ilike('mensaje', `%${vehiculo.placa}%`)
          .ilike('titulo', '%Seguro%')
          .gte('created_at', new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (existingNotif && existingNotif.length > 0) {
          console.log(`⏭️ Ya existe notificación reciente para seguro vehículo ${vehiculo.placa}`);
          continue;
        }

        const diasRestantes = Math.ceil(
          (new Date(vehiculo.vigencia_seguro).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        await supabase
          .from('notificaciones')
          .insert({
            user_id: vehiculo.user_id,
            tipo: 'warning',
            titulo: `Seguro de vehículo vence en ${window.label}`,
            mensaje: `El seguro del vehículo ${vehiculo.placa} (Póliza: ${vehiculo.poliza_resp_civil || 'N/A'}) vencerá el ${new Date(vehiculo.vigencia_seguro).toLocaleDateString('es-MX')}. Renuévalo para evitar multas.`,
            urgente: window.days <= 7,
            metadata: {
              link: '/vehiculos',
              entityType: 'seguro',
              entityId: vehiculo.id,
              actionRequired: true,
              expiresAt: vehiculo.vigencia_seguro,
              icon: 'Shield',
              diasRestantes
            }
          });

        stats.seguros++;
        stats.total++;
        console.log(`✅ Notificación creada para seguro vehículo ${vehiculo.placa} (vence en ${diasRestantes} días)`);
      }
    }

    // ==========================================
    // 3. LICENCIAS DE CONDUCTORES
    // ==========================================
    console.log('👤 Verificando licencias de conductores...');
    
    for (const window of EXPIRATION_WINDOWS) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + window.days);
      
      const { data: conductores, error: condError } = await supabase
        .from('conductores')
        .select('id, user_id, nombre, num_licencia, vigencia_licencia')
        .eq('activo', true)
        .not('vigencia_licencia', 'is', null)
        .gte('vigencia_licencia', now.toISOString())
        .lte('vigencia_licencia', targetDate.toISOString());

      if (condError) {
        console.error('Error consultando conductores:', condError);
        continue;
      }

      for (const conductor of conductores || []) {
        const { data: existingNotif } = await supabase
          .from('notificaciones')
          .select('id')
          .eq('user_id', conductor.user_id)
          .eq('tipo', 'warning')
          .ilike('mensaje', `%${conductor.nombre}%`)
          .ilike('titulo', '%Licencia%')
          .gte('created_at', new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (existingNotif && existingNotif.length > 0) {
          console.log(`⏭️ Ya existe notificación reciente para licencia conductor ${conductor.nombre}`);
          continue;
        }

        const diasRestantes = Math.ceil(
          (new Date(conductor.vigencia_licencia).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        await supabase
          .from('notificaciones')
          .insert({
            user_id: conductor.user_id,
            tipo: 'warning',
            titulo: `Licencia de conductor vence en ${window.label}`,
            mensaje: `La licencia del conductor ${conductor.nombre} (Núm: ${conductor.num_licencia || 'N/A'}) vencerá el ${new Date(conductor.vigencia_licencia).toLocaleDateString('es-MX')}. Renuévala para poder operar.`,
            urgente: window.days <= 7,
            metadata: {
              link: '/conductores',
              entityType: 'licencia',
              entityId: conductor.id,
              actionRequired: true,
              expiresAt: conductor.vigencia_licencia,
              icon: 'User',
              diasRestantes
            }
          });

        stats.licencias++;
        stats.total++;
        console.log(`✅ Notificación creada para licencia conductor ${conductor.nombre} (vence en ${diasRestantes} días)`);
      }
    }

    // ==========================================
    // 4. PERMISOS SCT DE VEHÍCULOS
    // ==========================================
    console.log('📋 Verificando permisos SCT...');
    
    for (const window of EXPIRATION_WINDOWS) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + window.days);
      
      const { data: vehiculos, error: permError } = await supabase
        .from('vehiculos')
        .select('id, user_id, placa, num_permiso_sct, vigencia_permiso')
        .eq('activo', true)
        .not('vigencia_permiso', 'is', null)
        .gte('vigencia_permiso', now.toISOString())
        .lte('vigencia_permiso', targetDate.toISOString());

      if (permError) {
        console.error('Error consultando permisos SCT:', permError);
        continue;
      }

      for (const vehiculo of vehiculos || []) {
        const { data: existingNotif } = await supabase
          .from('notificaciones')
          .select('id')
          .eq('user_id', vehiculo.user_id)
          .eq('tipo', 'warning')
          .ilike('mensaje', `%${vehiculo.placa}%`)
          .ilike('titulo', '%Permiso SCT%')
          .gte('created_at', new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (existingNotif && existingNotif.length > 0) {
          console.log(`⏭️ Ya existe notificación reciente para permiso SCT vehículo ${vehiculo.placa}`);
          continue;
        }

        const diasRestantes = Math.ceil(
          (new Date(vehiculo.vigencia_permiso).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        await supabase
          .from('notificaciones')
          .insert({
            user_id: vehiculo.user_id,
            tipo: 'warning',
            titulo: `Permiso SCT vence en ${window.label}`,
            mensaje: `El Permiso SCT del vehículo ${vehiculo.placa} (Núm: ${vehiculo.num_permiso_sct || 'N/A'}) vencerá el ${new Date(vehiculo.vigencia_permiso).toLocaleDateString('es-MX')}. Renuévalo para operar legalmente.`,
            urgente: window.days <= 7,
            metadata: {
              link: '/vehiculos',
              entityType: 'vehiculo',
              entityId: vehiculo.id,
              actionRequired: true,
              expiresAt: vehiculo.vigencia_permiso,
              icon: 'FileText',
              diasRestantes
            }
          });

        stats.permisos++;
        stats.total++;
        console.log(`✅ Notificación creada para permiso SCT vehículo ${vehiculo.placa} (vence en ${diasRestantes} días)`);
      }
    }

    console.log('✅ [check-expirations] Verificación completada:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verificación de vencimientos completada',
        stats,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('💥 Error en check-expirations:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
