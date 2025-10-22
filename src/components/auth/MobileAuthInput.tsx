import * as React from 'react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface MobileAuthInputProps extends React.ComponentProps<typeof Input> {}

export const MobileAuthInput = React.forwardRef<HTMLInputElement, MobileAuthInputProps>(
  ({ className, ...props }, ref) => {
    const isMobile = useIsMobile();

    return (
      <Input
        ref={ref}
        className={cn(
          className,
          isMobile ? 'min-h-[48px] text-base' : 'min-h-[40px]',
          // Prevent iOS zoom on focus
          isMobile && 'text-[16px]'
        )}
        {...props}
      />
    );
  }
);

MobileAuthInput.displayName = 'MobileAuthInput';
