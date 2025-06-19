
import React, { memo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface PerformanceTooltipProps {
  content: string;
  children?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const PerformanceTooltip = memo<PerformanceTooltipProps>(({
  content,
  children,
  side = 'top',
  className = ''
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <HelpCircle className={`h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help ${className}`} />
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

PerformanceTooltip.displayName = 'PerformanceTooltip';

export { PerformanceTooltip };
