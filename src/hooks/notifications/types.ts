
export interface FloatingNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  autoHide?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}
