
import { LucideIcon } from 'lucide-react';

export interface AlertConfig {
  id: string;
  type: 'critical' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
  priority: number;
  icon?: LucideIcon;
}
