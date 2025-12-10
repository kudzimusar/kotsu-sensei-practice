import React, { useEffect, useMemo, useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, isSameDay, isBefore, startOfToday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvailableTimeSlots, type TimeSlot } from '@/lib/supabase/bookings';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface DateTimePickerProps {
  instructorId: string;
  sessionType: 'video' | 'in_person';
  durationMinutes: 30 | 60 | 90;
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  disabled?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  instructorId,
  sessionType,
  durationMinutes,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  disabled = false,
}) => {
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date())
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Fetch available time slots when a date is selected
  const { data: timeSlots = [], isLoading: slotsLoading, error: slotsError } = useQuery({
    queryKey: ['available-slots', instructorId, selectedDate, sessionType, durationMinutes],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      return getAvailableTimeSlots(instructorId, dateStr, sessionType, durationMinutes);
    },
    enabled: !!selectedDate && !!instructorId && !disabled,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Reset time when date changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      // Check if selected time is still available
      const isStillAvailable = timeSlots.some(slot => slot.time === selectedTime && slot.available);
      if (!isStillAvailable && timeSlots.length > 0) {
        onTimeSelect(''); // Clear selection if time is no longer available
      }
    } else if (!selectedDate) {
      onTimeSelect(''); // Clear time when date is cleared
    }
  }, [selectedDate, timeSlots, selectedTime, onTimeSelect]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const newMonth = direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
      return startOfMonth(newMonth);
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    onDateSelect(date);
    setIsCalendarOpen(false);
  };

  const disabledDates = (date: Date) => {
    return isBefore(date, startOfToday());
  };

  const availableTimeSlots = useMemo(() => {
    return timeSlots.filter(slot => slot.available);
  }, [timeSlots]);

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Select Date</label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="bottom">
            <div className="p-3">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleMonthChange('prev')}
                  type="button"
                >
                  <span className="sr-only">Previous month</span>
                  <svg className="h-4 w-4" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64038 12.0535 8.32397 12.0433 8.13511 11.8419L4.38511 7.84188C4.20408 7.64955 4.20408 7.35027 4.38511 7.15794L8.13511 3.15794C8.32397 2.9565 8.64038 2.94629 8.84182 3.13514Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
                <div className="text-sm font-medium">
                  {format(calendarMonth, 'MMMM yyyy')}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleMonthChange('next')}
                  type="button"
                >
                  <span className="sr-only">Next month</span>
                  <svg className="h-4 w-4" viewBox="0 0 15 15" fill="none">
                    <path
                      d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7961 7.3502 10.7961 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64038 5.95694 3.32396 6.1584 3.13508Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                defaultMonth={calendarMonth}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                disabled={disabledDates}
                className="rounded-md border-0"
                fixedWeeks={true}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Picker */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Select Time</label>
        <div className="min-h-[120px]">
          {!selectedDate && (
            <div className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted bg-muted/50">
              <div className="text-center space-y-2">
                <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Please select a date to view available time slots
                </p>
              </div>
            </div>
          )}

          {selectedDate && slotsLoading && (
            <div className="flex items-center justify-center p-8 rounded-lg border bg-muted/50">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Loading available slots...</span>
            </div>
          )}

          {selectedDate && !slotsLoading && slotsError && (
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Error loading time slots
                  </p>
                  <p className="text-xs text-destructive/80">
                    {slotsError instanceof Error ? slotsError.message : 'Failed to fetch availability. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedDate && !slotsLoading && !slotsError && availableTimeSlots.length === 0 && (
            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    No available time slots for this date
                  </p>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    <p>Possible reasons:</p>
                    <ul className="list-disc ml-5 space-y-0.5">
                      <li>The instructor has not configured availability for this day</li>
                      <li>All available slots for this day are already booked</li>
                      <li>The selected session type or duration is not available on this day</li>
                    </ul>
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    Please select another date or contact the instructor directly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedDate && !slotsLoading && !slotsError && availableTimeSlots.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableTimeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => onTimeSelect(slot.time)}
                      disabled={disabled}
                      className={cn(
                        "py-2.5 px-3 text-sm font-medium rounded-lg border transition-all",
                        "hover:bg-accent hover:border-primary/50",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-foreground border-border"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{slot.time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center pt-1">
                {availableTimeSlots.length} slot{availableTimeSlots.length !== 1 ? 's' : ''} available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </span>
            <span className="text-muted-foreground">•</span>
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{selectedTime}</span>
          </div>
        </div>
      )}
    </div>
  );
};

