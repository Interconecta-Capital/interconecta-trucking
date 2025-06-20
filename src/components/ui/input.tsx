
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-apple border border-primary bg-elevated px-3 py-2 text-sm transition-apple file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-quaternary focus-visible:outline-none focus-visible:bg-primary focus-visible:border-focus focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
