
import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

// Input optimizado para móvil
const MobileInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Estilos específicos para móvil
          isMobile && "h-12 text-base py-3 px-4 rounded-lg",
          // Estilos para desktop
          !isMobile && "h-10 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileInput.displayName = "MobileInput"

// Label optimizado para móvil
const MobileLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        // Estilos específicos para móvil
        isMobile && "text-base font-semibold mb-2 block",
        // Estilos para desktop
        !isMobile && "text-sm",
        className
      )}
      {...props}
    />
  )
})
MobileLabel.displayName = "MobileLabel"

// Textarea optimizado para móvil
const MobileTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Estilos específicos para móvil
          isMobile && "min-h-[120px] text-base py-3 px-4 rounded-lg",
          // Estilos para desktop
          !isMobile && "min-h-[80px] text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileTextarea.displayName = "MobileTextarea"

// Botón optimizado para móvil
const MobileButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          // Estilos específicos para móvil
          isMobile && "h-12 px-6 py-3 text-base font-semibold rounded-lg min-w-[120px]",
          // Estilos para desktop
          !isMobile && "h-10 px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileButton.displayName = "MobileButton"

// FormItem con espaciado optimizado para móvil
const MobileFormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      ref={ref} 
      className={cn(
        // Espaciado específico para móvil
        isMobile && "space-y-3 mb-6",
        // Espaciado para desktop
        !isMobile && "space-y-2 mb-4",
        className
      )} 
      {...props} 
    />
  )
})
MobileFormItem.displayName = "MobileFormItem"

// Título de sección optimizado para móvil
const MobileSectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <h3 
      ref={ref} 
      className={cn(
        "font-semibold text-gray-900 border-b pb-2 mb-4",
        // Estilos específicos para móvil
        isMobile && "text-xl mb-6 pb-3",
        // Estilos para desktop
        !isMobile && "text-lg mb-4",
        className
      )} 
      {...props} 
    />
  )
})
MobileSectionTitle.displayName = "MobileSectionTitle"

export {
  MobileInput,
  MobileLabel, 
  MobileTextarea,
  MobileButton,
  MobileFormItem,
  MobileSectionTitle
}
