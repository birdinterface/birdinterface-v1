"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-1 [&_.rdp-nav_button>svg]:h-3 [&_.rdp-nav_button>svg]:w-3 [&_.rdp-nav_button>svg]:text-foreground",
        className
      )}
      classNames={{
        months: "flex flex-col space-y-1",
        month: "space-y-1",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-xs font-medium",
        nav: "space-x-1 flex items-center",
        nav_button:
          "h-1 w-1 bg-transparent p-0 text-foreground hover:text-foreground disabled:opacity-50",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground/50 w-6 font-normal text-[0.5rem]",
        row: "flex w-full mt-1",
        cell: "h-6 w-6 text-center p-0 relative focus-within:relative focus-within:z-20",
        day: "h-6 w-6 p-0 font-normal text-[0.65rem] hover:bg-transparent focus:bg-transparent text-muted-foreground hover:text-foreground focus:text-foreground",
        day_selected:
          "text-foreground font-medium bg-transparent hover:bg-transparent focus:bg-transparent",
        day_today: "text-muted-foreground font-normal bg-transparent",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
