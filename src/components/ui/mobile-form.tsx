
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
          "flex w-full rounded-xl border border-gray-20 bg-gray-05 px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-50 focus-visible:outline-none focus:bg-pure-white focus:border-blue-interconecta focus:ring-2 focus:ring-blue-interconecta focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          // Estilos específicos para móvil
          isMobile && "h-12 text-base py-3 px-4 rounded-xl touch-manipulation",
          // Estilos para desktop
          !isMobile && "h-11 md:text-sm py-2.5 px-3",
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
        "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-90",
        // Estilos específicos para móvil
        isMobile && "text-base font-semibold mb-2 block",
        // Estilos para desktop
        !isMobile && "text-sm mb-1.5",
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
          "flex w-full rounded-xl border border-gray-20 bg-gray-05 px-4 py-3 text-base ring-offset-background placeholder:text-gray-50 focus-visible:outline-none focus:bg-pure-white focus:border-blue-interconecta focus:ring-2 focus:ring-blue-interconecta focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-200",
          // Estilos específicos para móvil
          isMobile && "min-h-[120px] text-base py-3 px-4 rounded-xl touch-manipulation",
          // Estilos para desktop
          !isMobile && "min-h-[100px] text-sm py-2.5 px-3",
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
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
          // Estilos específicos para móvil
          isMobile && "h-12 px-6 py-3 text-base font-semibold rounded-xl min-w-[140px]",
          // Estilos para desktop
          !isMobile && "h-10 px-4 py-2 text-sm",
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
        isMobile && "space-y-2 mb-6",
        // Espaciado para desktop
        !isMobile && "space-y-1.5 mb-4",
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
        "font-bold text-gray-90 border-b border-gray-10 pb-3 mb-6",
        // Estilos específicos para móvil
        isMobile && "text-xl pb-4 mb-8",
        // Estilos para desktop
        !isMobile && "text-lg pb-3 mb-6",
        className
      )} 
      {...props} 
    />
  )
})
MobileSectionTitle.displayName = "MobileSectionTitle"

// Select optimizado para móvil
const MobileSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => {
    const isMobile = useIsMobile();
    
    return (
      <select
        className={cn(
          "flex w-full rounded-xl border border-gray-20 bg-gray-05 px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus:bg-pure-white focus:border-blue-interconecta focus:ring-2 focus:ring-blue-interconecta focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          // Estilos específicos para móvil
          isMobile && "h-12 text-base py-3 px-4 rounded-xl touch-manipulation",
          // Estilos para desktop
          !isMobile && "h-11 text-sm py-2.5 px-3",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileSelect.displayName = "MobileSelect"

export {
  MobileInput,
  MobileLabel, 
  MobileTextarea,
  MobileButton,
  MobileFormItem,
  MobileSectionTitle,
  MobileSelect
}
