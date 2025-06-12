
import React from 'react';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';

interface ValidationIndicatorProps {
  status: 'idle' | 'validating' | 'valid' | 'invalid';
  message?: string;
  className?: string;
}

export const ValidationIndicator = ({
  status,
  message,
  className = ''
}: ValidationIndicatorProps) => {
  const getIcon = () => {
    switch (status) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'valid':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'valid':
        return 'text-green-600';
      case 'invalid':
        return 'text-red-600';
      case 'validating':
        return 'text-blue-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getIcon()}
      {message && (
        <span className={`text-sm ${getTextColor()}`}>
          {message}
        </span>
      )}
    </div>
  );
};
