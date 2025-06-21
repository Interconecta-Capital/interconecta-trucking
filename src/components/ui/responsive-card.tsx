
import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const ResponsiveCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      ref={ref}
      className={cn(
        "bg-pure-white border border-gray-20 shadow-sm transition-all duration-200 hover:shadow-md",
        // Mobile optimizations
        isMobile ? "rounded-2xl p-4" : "rounded-xl p-6",
        className
      )}
      {...props}
    />
  )
})
ResponsiveCard.displayName = "ResponsiveCard"

const ResponsiveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        isMobile ? "pb-4" : "pb-3",
        className
      )}
      {...props}
    />
  )
})
ResponsiveCardHeader.displayName = "ResponsiveCardHeader"

const ResponsiveCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <h3
      ref={ref}
      className={cn(
        "font-bold leading-none tracking-tight text-gray-90",
        isMobile ? "text-lg" : "text-base",
        className
      )}
      {...props}
    />
  )
})
ResponsiveCardTitle.displayName = "ResponsiveCardTitle"

const ResponsiveCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-60", className)}
    {...props}
  />
))
ResponsiveCardDescription.displayName = "ResponsiveCardDescription"

const ResponsiveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
ResponsiveCardContent.displayName = "ResponsiveCardContent"

const ResponsiveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-t border-gray-10",
        isMobile ? "pt-4 mt-4" : "pt-3 mt-3",
        className
      )}
      {...props}
    />
  )
})
ResponsiveCardFooter.displayName = "ResponsiveCardFooter"

export { ResponsiveCard, ResponsiveCardHeader, ResponsiveCardFooter, ResponsiveCardTitle, ResponsiveCardDescription, ResponsiveCardContent }
