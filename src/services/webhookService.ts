
import { supabase } from '@/integrations/supabase/client';

interface WebhookEvent {
  type: 'viaje_estado_cambio' | 'documento_vencimiento' | 'mantenimiento_programado' | 'emergencia';
  entity_id: string;
  entity_type: string;
  data: any;
  user_id: string;
}

class WebhookService {
  // Registrar webhook para cambios de estado
  async registrarWebhook(event: WebhookEvent) {
    try {
      // Crear notificación en la base de datos
      const { error } = await supabase
        .from('notificaciones')
        .insert({
          user_id: event.user_id,
          tipo: this.getTipoNotificacion(event.type),
          titulo: this.getTituloNotificacion(event.type),
          mensaje: this.getMensajeNotificacion(event),
          metadata: {
            entity_id: event.entity_id,
            entity_type: event.entity_type,
            webhook_data: event.data
          }
        });

      if (error) throw error;

      // Enviar webhook a sistemas externos si están configurados
      await this.enviarWebhookExterno(event);

      return true;
    } catch (error) {
      console.error('Error registrando webhook:', error);
      return false;
    }
  }

  private getTipoNotificacion(type: string): string {
    switch (type) {
      case 'viaje_estado_cambio':
        return 'info';
      case 'documento_vencimiento':
        return 'warning';
      case 'mantenimiento_programado':
        return 'info';
      case 'emergencia':
        return 'error';
      default:
        return 'info';
    }
  }

  private getTituloNotificacion(type: string): string {
    switch (type) {
      case 'viaje_estado_cambio':
        return 'Estado de Viaje Actualizado';
      case 'documento_vencimiento':
        return 'Documento por Vencer';
      case 'mantenimiento_programado':
        return 'Mantenimiento Programado';
      case 'emergencia':
        return 'EMERGENCIA';
      default:
        return 'Notificación';
    }
  }

  private getMensajeNotificacion(event: WebhookEvent): string {
    switch (event.type) {
      case 'viaje_estado_cambio':
        return `El viaje ${event.entity_id} cambió a estado: ${event.data.nuevo_estado}`;
      case 'documento_vencimiento':
        return `El documento ${event.data.tipo_documento} vence en ${event.data.dias_restantes} días`;
      case 'mantenimiento_programado':
        return `Mantenimiento programado para ${event.data.fecha}`;
      case 'emergencia':
        return `Emergencia reportada: ${event.data.descripcion}`;
      default:
        return 'Notificación del sistema';
    }
  }

  private async enviarWebhookExterno(event: WebhookEvent) {
    // Aquí se pueden configurar webhooks a sistemas externos
    // como sistemas contables, de facturación, etc.
    console.log('Enviando webhook externo:', event);
    
    // Ejemplo de integración con sistema contable
    if (event.type === 'viaje_estado_cambio' && event.data.nuevo_estado === 'completado') {
      await this.notificarSistemaContable(event);
    }
  }

  private async notificarSistemaContable(event: WebhookEvent) {
    // Placeholder para integración con sistema contable
    console.log('Notificando sistema contable de viaje completado:', event.entity_id);
  }

  // Webhook para cambios de estado de viaje
  async viajeEstadoCambiado(viajeId: string, estadoAnterior: string, estadoNuevo: string, userId: string) {
    return this.registrarWebhook({
      type: 'viaje_estado_cambio',
      entity_id: viajeId,
      entity_type: 'viaje',
      data: {
        estado_anterior: estadoAnterior,
        nuevo_estado: estadoNuevo,
        timestamp: new Date().toISOString()
      },
      user_id: userId
    });
  }

  // Webhook para documentos por vencer
  async documentoPorVencer(documentoId: string, tipoDocumento: string, diasRestantes: number, userId: string) {
    return this.registrarWebhook({
      type: 'documento_vencimiento',
      entity_id: documentoId,
      entity_type: 'documento',
      data: {
        tipo_documento: tipoDocumento,
        dias_restantes: diasRestantes
      },
      user_id: userId
    });
  }

  // Webhook para emergencias
  async reportarEmergencia(viajeId: string, descripcion: string, ubicacion: any, userId: string) {
    return this.registrarWebhook({
      type: 'emergencia',
      entity_id: viajeId,
      entity_type: 'viaje',
      data: {
        descripcion,
        ubicacion,
        timestamp: new Date().toISOString(),
        prioridad: 'alta'
      },
      user_id: userId
    });
  }
}

export const webhookService = new WebhookService();
