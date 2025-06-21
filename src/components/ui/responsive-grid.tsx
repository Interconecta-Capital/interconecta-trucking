
import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols = { default: 1, md: 2, lg: 3 }, gap = { default: 4, md: 6 }, ...props }, ref) => {
    const gridClasses = cn(
      "grid",
      // Responsive columns
      cols.default && `grid-cols-${cols.default}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`,
      // Responsive gaps
      gap.default && `gap-${gap.default}`,
      gap.sm && `sm:gap-${gap.sm}`,
      gap.md && `md:gap-${gap.md}`,
      gap.lg && `lg:gap-${gap.lg}`,
      className
    );

    return (
      <div
        ref={ref}
        className={gridClasses}
        {...props}
      />
    )
  }
)
ResponsiveGrid.displayName = "ResponsiveGrid"

export { ResponsiveGrid }
