
import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pb-4 border-b border-gray-20",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-xl bg-blue-light">
            <Icon className="h-5 w-5 text-blue-interconecta" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-90 leading-tight">
              {title}
            </h2>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-gray-60 mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
