
import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface DateTimePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  required?: boolean
  minDate?: Date
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Selecciona fecha y hora",
  disabled = false,
  className,
  label,
  required = false,
  minDate
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState(() => {
    if (date) {
      return format(date, "HH:mm")
    }
    return "08:00"
  })

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Combinar la fecha seleccionada con la hora actual
      const [hours, minutes] = timeValue.split(':').map(Number)
      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)
      onDateChange?.(newDate)
    } else {
      onDateChange?.(undefined)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (date) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      onDateChange?.(newDate)
    }
  }

  React.useEffect(() => {
    if (date) {
      setTimeValue(format(date, "HH:mm"))
    }
  }, [date])

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 z-50" 
            align="start"
            style={{ zIndex: 9999 }}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                return false
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={disabled}
            className="w-24"
          />
        </div>
      </div>
    </div>
  )
}
