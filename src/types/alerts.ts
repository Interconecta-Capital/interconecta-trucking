
export interface AlertConfig {
  id: string;
  type: 'critical' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
  priority: number;
  icon?: any;
}

export interface AlertStyles {
  container: string;
  button: string;
}
