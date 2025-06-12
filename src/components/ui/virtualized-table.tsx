
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutGrid, List as ListIcon } from 'lucide-react';

interface VirtualizedTableProps {
  data: any[];
  columns: {
    key: string;
    header: string;
    width: number;
    render?: (item: any, index: number) => React.ReactNode;
  }[];
  itemHeight?: number;
  height?: number;
  onItemClick?: (item: any, index: number) => void;
  className?: string;
  compact?: boolean;
  onCompactToggle?: (compact: boolean) => void;
  showCompactToggle?: boolean;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    columns: VirtualizedTableProps['columns'];
    onItemClick?: VirtualizedTableProps['onItemClick'];
    compact: boolean;
  };
}

const Row = ({ index, style, data }: RowProps) => {
  const { items, columns, onItemClick, compact } = data;
  const item = items[index];

  return (
    <div
      style={style}
      className={cn(
        "flex items-center border-b border-border hover:bg-muted/50 cursor-pointer",
        "transition-colors duration-150",
        compact ? "text-xs" : "text-sm"
      )}
      onClick={() => onItemClick?.(item, index)}
    >
      {columns.map((column) => (
        <div
          key={column.key}
          style={{ width: column.width }}
          className={cn(
            "truncate",
            compact ? "px-2 py-1" : "px-4 py-2"
          )}
        >
          {column.render ? column.render(item, index) : item[column.key]}
        </div>
      ))}
    </div>
  );
};

export function VirtualizedTable({
  data,
  columns,
  itemHeight = 60,
  height = 400,
  onItemClick,
  className,
  compact = false,
  onCompactToggle,
  showCompactToggle = false
}: VirtualizedTableProps) {
  const itemData = useMemo(() => ({
    items: data,
    columns,
    onItemClick,
    compact
  }), [data, columns, onItemClick, compact]);

  const adjustedItemHeight = compact ? Math.max(itemHeight * 0.6, 32) : itemHeight;
  const headerHeight = compact ? 32 : 48;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header with compact toggle */}
      <div 
        className="flex bg-muted/50 border-b"
        style={{ height: headerHeight }}
      >
        <div className="flex flex-1">
          {columns.map((column) => (
            <div
              key={column.key}
              style={{ width: column.width }}
              className={cn(
                "flex items-center font-medium text-muted-foreground",
                compact ? "px-2 py-1 text-xs" : "px-4 py-3 text-sm"
              )}
            >
              {column.header}
            </div>
          ))}
        </div>
        
        {showCompactToggle && onCompactToggle && (
          <div className="flex items-center px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCompactToggle(!compact)}
              className="h-6 w-6 p-0"
              title={compact ? "Vista normal" : "Vista compacta"}
            >
              {compact ? (
                <ListIcon className="h-3 w-3" />
              ) : (
                <LayoutGrid className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Virtualized Content */}
      <List
        height={height}
        itemCount={data.length}
        itemSize={adjustedItemHeight}
        itemData={itemData}
        overscanCount={compact ? 15 : 5}
      >
        {Row}
      </List>
    </div>
  );
}
