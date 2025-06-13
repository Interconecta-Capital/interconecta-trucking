
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  template: 'welcome' | 'verification' | 'password-reset';
  data?: Record<string, any>;
}

const getEmailTemplate = (template: string, data: Record<string, any> = {}) => {
  const baseStyles = `
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6b7280; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .logo { width: 40px; height: 40px; margin: 0 auto 10px; }
  `;

  switch (template) {
    case 'welcome':
      return {
        subject: '¡Bienvenido a Interconecta Trucking!',
        html: `
          <html>
            <head><style>${baseStyles}</style></head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🚛</div>
                  <h1>¡Bienvenido a Interconecta Trucking!</h1>
                  <p>Tu plataforma integral para gestión de cartas porte</p>
                </div>
                <div class="content">
                  <h2>Hola ${data.nombre || 'Usuario'},</h2>
                  <p>¡Gracias por registrarte en Interconecta Trucking! Estamos emocionados de tenerte en nuestra plataforma.</p>
                  
                  <h3>¿Qué puedes hacer ahora?</h3>
                  <ul>
                    <li>📋 Crear cartas porte de manera fácil y rápida</li>
                    <li>🚛 Gestionar tu flota de vehículos</li>
                    <li>👥 Administrar conductores y figuras de transporte</li>
                    <li>📊 Monitorear tus operaciones en tiempo real</li>
                  </ul>
                  
                  <a href="${data.dashboardUrl || 'https://tu-app.com/dashboard'}" class="button">
                    Ir al Dashboard
                  </a>
                  
                  <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
                </div>
                <div class="footer">
                  <p>© 2024 Interconecta Trucking. Todos los derechos reservados.</p>
                  <p>Sistema de Gestión de Cartas Porte</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

    case 'verification':
      return {
        subject: 'Verifica tu cuenta en Interconecta Trucking',
        html: `
          <html>
            <head><style>${baseStyles}</style></head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🚛</div>
                  <h1>Verifica tu cuenta</h1>
                  <p>Un paso más para acceder a Interconecta Trucking</p>
                </div>
                <div class="content">
                  <h2>Hola ${data.nombre || 'Usuario'},</h2>
                  <p>Para completar tu registro en Interconecta Trucking, necesitamos verificar tu dirección de correo electrónico.</p>
                  
                  <a href="${data.confirmationUrl}" class="button">
                    Verificar mi cuenta
                  </a>
                  
                  <p><strong>Este enlace expira en 24 horas</strong></p>
                  
                  <p>Si no solicitaste esta cuenta, puedes ignorar este correo de forma segura.</p>
                  
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #6b7280;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                    <span style="word-break: break-all;">${data.confirmationUrl}</span>
                  </p>
                </div>
                <div class="footer">
                  <p>© 2024 Interconecta Trucking. Todos los derechos reservados.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

    case 'password-reset':
      return {
        subject: 'Restablece tu contraseña - Interconecta Trucking',
        html: `
          <html>
            <head><style>${baseStyles}</style></head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🚛</div>
                  <h1>Restablece tu contraseña</h1>
                  <p>Solicitud de cambio de contraseña</p>
                </div>
                <div class="content">
                  <h2>Hola ${data.nombre || 'Usuario'},</h2>
                  <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Interconecta Trucking.</p>
                  
                  <a href="${data.resetUrl}" class="button">
                    Restablecer contraseña
                  </a>
                  
                  <p><strong>Este enlace expira en 1 hora</strong></p>
                  
                  <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.</p>
                  
                  <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;"><strong>Consejo de seguridad:</strong> Nunca compartas tu contraseña con nadie. Nuestro equipo nunca te pedirá tu contraseña por correo.</p>
                  </div>
                </div>
                <div class="footer">
                  <p>© 2024 Interconecta Trucking. Todos los derechos reservados.</p>
                </div>
              </div>
            </body>
          </html>
        `
      };

    default:
      throw new Error('Template no válido');
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, template, data = {} }: EmailRequest = await req.json();

    // Crear cliente de Supabase para usar la configuración de SendGrid existente
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const emailContent = getEmailTemplate(template, data);

    // Usar la API de Supabase que ya tiene SendGrid configurado
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject: emailContent.subject,
        html: emailContent.html
      }
    });

    if (error) {
      console.error('Error enviando email:', error);
      return new Response(
        JSON.stringify({ error: 'Error enviando email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Email enviado exitosamente:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado correctamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error en send-custom-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
