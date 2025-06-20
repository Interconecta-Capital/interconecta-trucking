
export interface AlertConfig {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  action: string;
  dismissible?: boolean;
  persistent?: boolean;
}
