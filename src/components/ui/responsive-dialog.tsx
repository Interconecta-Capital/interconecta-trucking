
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const ResponsiveDialog = DialogPrimitive.Root

const ResponsiveDialogTrigger = DialogPrimitive.Trigger

const ResponsiveDialogPortal = DialogPrimitive.Portal

const ResponsiveDialogClose = DialogPrimitive.Close

const ResponsiveDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ResponsiveDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const ResponsiveDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <ResponsiveDialogPortal>
      <ResponsiveDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-pure-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          // Mobile: Full screen optimizado
          isMobile ? [
            "inset-0", // Pantalla completa en móvil
            "rounded-none border-0",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "max-h-screen overflow-y-auto",
            "p-4 pb-safe-area-inset-bottom" // Respeta el área segura
          ] : [
            // Desktop: Modal centrado y grande
            "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
            "rounded-2xl border border-gray-20",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto", // Más grande en desktop
            "p-6"
          ],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={cn(
          "absolute rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10",
          isMobile ? "right-3 top-3 h-10 w-10 bg-white/80 backdrop-blur-sm" : "right-6 top-6 h-8 w-8"
        )}>
          <X className={cn("text-gray-600", isMobile ? "h-5 w-5" : "h-4 w-4")} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </ResponsiveDialogPortal>
  )
})
ResponsiveDialogContent.displayName = DialogPrimitive.Content.displayName

const ResponsiveDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-2 text-left",
        isMobile ? "mb-6 pt-2" : "mb-4", // Más espacio superior en móvil
        className
      )}
      {...props}
    />
  )
})
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader"

const ResponsiveDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-3",
        isMobile ? [
          "flex-col-reverse pt-6 mt-6 border-t border-gray-10 pb-safe-area-inset-bottom",
          "[&>button]:w-full [&>button]:h-12 [&>button]:text-base"
        ] : [
          "flex-row justify-end pt-4 mt-4",
          "[&>button]:min-w-[100px]"
        ],
        className
      )}
      {...props}
    />
  )
})
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter"

const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "font-bold leading-none tracking-tight text-gray-90",
        isMobile ? "text-xl pr-12" : "text-lg pr-10", // Más espacio para el botón cerrar
        className
      )}
      {...props}
    />
  )
})
ResponsiveDialogTitle.displayName = DialogPrimitive.Title.displayName

const ResponsiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-gray-60 text-sm", className)}
    {...props}
  />
))
ResponsiveDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  ResponsiveDialog,
  ResponsiveDialogPortal,
  ResponsiveDialogOverlay,
  ResponsiveDialogClose,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
}
