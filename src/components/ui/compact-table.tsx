
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Eye } from 'lucide-react';

interface CompactTableProps {
  data: any[];
  columns: {
    key: string;
    header: string;
    width: number;
    minWidth?: number;
    sortable?: boolean;
    render?: (item: any, index: number) => React.ReactNode;
    compact?: (item: any, index: number) => React.ReactNode;
  }[];
  itemHeight?: number;
  height?: number;
  onItemClick?: (item: any, index: number) => void;
  onItemAction?: (action: string, item: any, index: number) => void;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
  actionItems?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    columns: CompactTableProps['columns'];
    compact: boolean;
    showActions: boolean;
    actionItems?: CompactTableProps['actionItems'];
    onItemClick?: CompactTableProps['onItemClick'];
    onItemAction?: CompactTableProps['onItemAction'];
  };
}

const CompactRow = ({ index, style, data }: RowProps) => {
  const { items, columns, compact, showActions, actionItems, onItemClick, onItemAction } = data;
  const item = items[index];

  return (
    <div
      style={style}
      className={cn(
        "flex items-center border-b border-border hover:bg-muted/30 cursor-pointer group",
        "transition-colors duration-150",
        compact ? "text-xs" : "text-sm"
      )}
      onClick={() => onItemClick?.(item, index)}
    >
      {columns.map((column) => (
        <div
          key={column.key}
          style={{ width: column.width, minWidth: column.minWidth }}
          className={cn(
            "truncate flex items-center",
            compact ? "px-2 py-1" : "px-4 py-2"
          )}
        >
          {compact && column.compact 
            ? column.compact(item, index)
            : column.render 
              ? column.render(item, index) 
              : item[column.key]
          }
        </div>
      ))}
      
      {showActions && (
        <div 
          style={{ width: compact ? 60 : 80 }}
          className={cn(
            "flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
            compact ? "px-1" : "px-2"
          )}
        >
          {actionItems && actionItems.length > 1 ? (
            <Button
              variant="ghost"
              size={compact ? "sm" : "default"}
              className={cn("h-6 w-6 p-0", compact && "h-4 w-4")}
              onClick={(e) => {
                e.stopPropagation();
                // Aquí se podría abrir un dropdown con las acciones
              }}
            >
              <MoreHorizontal className={cn("h-3 w-3", compact && "h-2 w-2")} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size={compact ? "sm" : "default"}
              className={cn("h-6 w-6 p-0", compact && "h-4 w-4")}
              onClick={(e) => {
                e.stopPropagation();
                onItemAction?.('view', item, index);
              }}
            >
              <Eye className={cn("h-3 w-3", compact && "h-2 w-2")} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export function CompactTable({
  data,
  columns,
  itemHeight = 32,
  height = 400,
  onItemClick,
  onItemAction,
  className,
  compact = false,
  showActions = true,
  actionItems
}: CompactTableProps) {
  const itemData = useMemo(() => ({
    items: data,
    columns,
    compact,
    showActions,
    actionItems,
    onItemClick,
    onItemAction
  }), [data, columns, compact, showActions, actionItems, onItemClick, onItemAction]);

  const adjustedItemHeight = compact ? Math.max(itemHeight * 0.7, 24) : itemHeight;
  const headerHeight = compact ? 32 : 40;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <p className={compact ? "text-xs" : "text-sm"}>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div 
        className="flex bg-muted/50 border-b"
        style={{ height: headerHeight }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            style={{ width: column.width, minWidth: column.minWidth }}
            className={cn(
              "flex items-center font-medium text-muted-foreground",
              compact ? "px-2 py-1 text-xs" : "px-4 py-3 text-sm"
            )}
          >
            {column.header}
          </div>
        ))}
        {showActions && (
          <div 
            style={{ width: compact ? 60 : 80 }}
            className={cn(
              "flex items-center justify-center font-medium text-muted-foreground",
              compact ? "px-1 py-1 text-xs" : "px-2 py-3 text-sm"
            )}
          >
            Acciones
          </div>
        )}
      </div>
      
      {/* Virtualized Content */}
      <List
        height={height}
        itemCount={data.length}
        itemSize={adjustedItemHeight}
        itemData={itemData}
        overscanCount={10}
      >
        {CompactRow}
      </List>
    </div>
  );
}
