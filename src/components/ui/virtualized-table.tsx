
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

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
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    columns: VirtualizedTableProps['columns'];
    onItemClick?: VirtualizedTableProps['onItemClick'];
  };
}

const Row = ({ index, style, data }: RowProps) => {
  const { items, columns, onItemClick } = data;
  const item = items[index];

  return (
    <div
      style={style}
      className={cn(
        "flex items-center border-b border-border hover:bg-muted/50 cursor-pointer",
        "transition-colors duration-150"
      )}
      onClick={() => onItemClick?.(item, index)}
    >
      {columns.map((column) => (
        <div
          key={column.key}
          style={{ width: column.width }}
          className="px-4 py-2 text-sm truncate"
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
  className
}: VirtualizedTableProps) {
  const itemData = useMemo(() => ({
    items: data,
    columns,
    onItemClick
  }), [data, columns, onItemClick]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex bg-muted/50 border-b">
        {columns.map((column) => (
          <div
            key={column.key}
            style={{ width: column.width }}
            className="px-4 py-3 text-sm font-medium text-muted-foreground"
          >
            {column.header}
          </div>
        ))}
      </div>
      
      {/* Virtualized Content */}
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
}
