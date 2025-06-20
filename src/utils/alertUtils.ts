
import { AlertTriangle, TrendingUp, Clock, Gift, Trash2 } from 'lucide-react';
import { AlertStyles } from '@/types/alerts';

export const getAlertStyle = (type: string): string => {
  switch (type) {
    case 'critical':
      return 'border-red-200 bg-red-50 animate-pulse';
    case 'error':
      return 'border-red-200 bg-red-50';
    case 'warning':
      return 'border-orange-200 bg-orange-50';
    case 'info':
      return 'border-blue-200 bg-blue-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

export const getAlertIcon = (alert: any) => {
  if (alert.icon) return alert.icon;
  
  switch (alert.type) {
    case 'critical':
    case 'error':
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Gift;
    default:
      return TrendingUp;
  }
};

export const getButtonStyle = (type: string): string => {
  switch (type) {
    case 'critical':
      return 'bg-red-600 hover:bg-red-700 text-white animate-pulse';
    case 'error':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'warning':
      return 'bg-orange-600 hover:bg-orange-700 text-white';
    default:
      return '';
  }
};
