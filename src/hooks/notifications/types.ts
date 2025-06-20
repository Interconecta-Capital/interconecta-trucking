
export interface FloatingNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHide?: boolean;
  duration?: number;
}

export interface RealtimeNotification {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  urgente: boolean;
  metadata: any;
  created_at: string;
}
