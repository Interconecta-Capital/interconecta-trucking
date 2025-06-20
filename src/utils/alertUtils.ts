
import { AlertTriangle, Info, Clock } from 'lucide-react';
import { AlertConfig } from '@/types/alerts';

export const getAlertIcon = (alert: AlertConfig) => {
  switch (alert.type) {
    case 'critical':
      return AlertTriangle;
    case 'warning':
      return AlertTriangle;
    case 'info':
    default:
      return Info;
  }
};

export const getAlertStyle = (type: AlertConfig['type']) => {
  switch (type) {
    case 'critical':
      return 'border-red-500 bg-red-50';
    case 'warning':
      return 'border-orange-500 bg-orange-50';
    case 'info':
    default:
      return 'border-blue-500 bg-blue-50';
  }
};

export const getButtonStyle = (type: AlertConfig['type']) => {
  switch (type) {
    case 'critical':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'warning':
      return 'bg-orange-600 hover:bg-orange-700 text-white';
    case 'info':
    default:
      return 'bg-blue-600 hover:bg-blue-700 text-white';
  }
};
