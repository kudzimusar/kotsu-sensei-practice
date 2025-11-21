import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, numberOfMonths = 1, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      numberOfMonths={numberOfMonths}
      className={cn("p-3 sm:p-4 w-full max-w-full", className)}
      classNames={{
        months: "flex flex-col w-full",
        month: "space-y-3 sm:space-y-4 w-full",
        caption: "flex justify-center pt-2 pb-3 relative items-center mb-2",
        caption_label: "text-base sm:text-lg font-semibold",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 border-border hover:border-primary",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full mb-2",
        head_cell: "text-muted-foreground rounded-md font-semibold text-xs sm:text-sm flex-1 min-w-0 text-center py-2",
        row: "flex w-full mt-1",
        cell: "h-10 sm:h-12 flex-1 min-w-0 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-10 sm:h-12 w-full p-0 font-normal aria-selected:opacity-100 text-sm sm:text-base rounded-md hover:bg-accent hover:text-accent-foreground"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold",
        day_today: "bg-accent text-accent-foreground font-semibold border-2 border-primary",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => 
          orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
