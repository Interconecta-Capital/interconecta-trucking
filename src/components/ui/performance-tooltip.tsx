
import React, { memo, useState } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  const getTooltipPosition = () => {
    switch (side) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children || (
          <HelpCircle className={`h-4 w-4 text-gray-400 hover:text-gray-600 ${className}`} />
        )}
      </div>
      {isVisible && (
        <div className={`absolute z-50 ${getTooltipPosition()}`}>
          <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded shadow-lg max-w-xs whitespace-normal">
            {content}
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -z-10"
                 style={{
                   top: side === 'bottom' ? '-4px' : side === 'top' ? 'auto' : '50%',
                   bottom: side === 'top' ? '-4px' : 'auto',
                   left: side === 'right' ? '-4px' : side === 'left' ? 'auto' : '50%',
                   right: side === 'left' ? '-4px' : 'auto',
                   transform: side === 'left' || side === 'right' ? 'translateY(-50%) rotate(45deg)' : 'translateX(-50%) rotate(45deg)'
                 }} />
          </div>
        </div>
      )}
    </div>
  );
});

PerformanceTooltip.displayName = 'PerformanceTooltip';

export { PerformanceTooltip };
