import { supabase } from '@/integrations/supabase/client';

class GoogleCalendarSyncService {
  async exchangeCode(code: string) {
    const { data, error } = await supabase.functions.invoke('google-oauth-callback', {
      body: { code },
    });
    if (error) throw error;
    return data;
  }

  async pushEvent(userId: string, event: Record<string, any>) {
    const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
      body: { userId, event },
    });
    if (error) throw error;
    return data;
  }
}

export const googleCalendarSyncService = new GoogleCalendarSyncService();
