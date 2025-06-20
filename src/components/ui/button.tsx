
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-apple text-sm font-medium transition-apple focus-ring-apple disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-blue-primary text-inverse hover:bg-blue-hover shadow-apple-sm hover:shadow-apple-md",
        destructive: "bg-red-primary text-inverse hover:opacity-90 shadow-apple-sm hover:shadow-apple-md",
        outline: "border border-primary bg-elevated hover:bg-secondary text-primary shadow-apple-sm hover:shadow-apple-md",
        secondary: "bg-secondary text-primary hover:bg-tertiary shadow-apple-sm hover:shadow-apple-md",
        ghost: "text-secondary hover:bg-secondary hover:text-primary rounded-apple",
        link: "text-blue-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-apple px-3",
        lg: "h-12 rounded-apple-lg px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
