
import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const ResponsiveTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn("relative w-full", isMobile && "overflow-x-auto")}>
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm border-separate border-spacing-0",
          className
        )}
        {...props}
      />
    </div>
  )
})
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn("bg-gray-05", className)} 
    {...props} 
  />
))
ResponsiveTableHeader.displayName = "ResponsiveTableHeader"

const ResponsiveTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
ResponsiveTableBody.displayName = "ResponsiveTableBody"

const ResponsiveTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-gray-05 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
ResponsiveTableFooter.displayName = "ResponsiveTableFooter"

const ResponsiveTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-gray-10 transition-colors hover:bg-gray-05 data-[state=selected]:bg-gray-05",
      className
    )}
    {...props}
  />
))
ResponsiveTableRow.displayName = "ResponsiveTableRow"

const ResponsiveTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <th
      ref={ref}
      className={cn(
        "text-left align-middle font-semibold text-gray-70 [&:has([role=checkbox])]:pr-0 border-b border-gray-20 bg-gray-05",
        isMobile ? "h-10 px-3 text-xs" : "h-12 px-4 text-sm",
        // First and last cell rounding
        "first:rounded-tl-xl last:rounded-tr-xl",
        className
      )}
      {...props}
    />
  )
})
ResponsiveTableHead.displayName = "ResponsiveTableHead"

const ResponsiveTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <td
      ref={ref}
      className={cn(
        "align-middle [&:has([role=checkbox])]:pr-0 text-gray-90",
        isMobile ? "p-3 text-sm" : "p-4 text-sm",
        className
      )}
      {...props}
    />
  )
})
ResponsiveTableCell.displayName = "ResponsiveTableCell"

const ResponsiveTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-gray-60", className)}
    {...props}
  />
))
ResponsiveTableCaption.displayName = "ResponsiveTableCaption"

// Mobile Card View for tables
const MobileTableCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data: Record<string, any>;
    renderCard: (data: Record<string, any>) => React.ReactNode;
  }
>(({ className, data, renderCard, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-pure-white border border-gray-20 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200",
      className
    )}
    {...props}
  >
    {renderCard(data)}
  </div>
))
MobileTableCard.displayName = "MobileTableCard"

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableFooter,
  ResponsiveTableHead,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableCaption,
  MobileTableCard,
}
