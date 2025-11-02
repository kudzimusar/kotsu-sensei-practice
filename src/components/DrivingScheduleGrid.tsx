import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, BookOpen, Car, ClipboardCheck, Brain, Compass, CheckCircle2, Calendar, RefreshCw } from "lucide-react";
import { ScheduleEventModal } from "./ScheduleEventModal";
import { useAuth } from "@/hooks/useAuth";
import { 
  getMonthSchedule, 
  getHolidays, 
  createScheduleEvent, 
  updateScheduleEvent, 
  deleteScheduleEvent,
  type DrivingScheduleEvent,
  type Holiday
} from "@/lib/supabase/drivingSchedule";
import { resetUserSchedule } from "@/lib/supabase/scheduleReset";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScheduleTemplateLoader } from "./ScheduleTemplateLoader";

const TIME_SLOTS = [
  "08:40", "09:40", "10:40", "11:40",
  "13:40", "14:50", "16:30", "17:30",
  "18:30", "19:40"
];

const EVENT_ICONS = {
  theory: BookOpen,
  driving: Car,
  test: ClipboardCheck,
  aptitude: Brain,
  orientation: Compass,
};

const EVENT_COLORS = {
  theory: "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300",
  driving: "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300",
  test: "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300",
  aptitude: "bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-300",
  orientation: "bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-300",
};

export function DrivingScheduleGrid() {
  const { user } = useAuth();
  const isOfficialUser = user?.id === '63908300-f3df-4fff-ab25-cc268e00a45b';
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // November 2025
  const [events, setEvents] = useState<DrivingScheduleEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DrivingScheduleEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  useEffect(() => {
    if (user) {
      loadSchedule();
    }
  }, [user, currentDate]);

  const loadSchedule = async () => {
    if (!user) {
      console.log("No user logged in");
      setLoading(false);
      return;
    }
    
    console.log("Loading schedule for user:", user.id, "Month:", month, "Year:", year);
    setLoading(true);
    try {
      const [scheduleData, holidaysData] = await Promise.all([
        getMonthSchedule(user.id, year, month),
        getHolidays(year, month),
      ]);
      console.log("Schedule loaded:", scheduleData.length, "events");
      setEvents(scheduleData as DrivingScheduleEvent[]);
      setHolidays(holidaysData as Holiday[]);
    } catch (error) {
      console.error("Error loading schedule:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast.error(`Failed to load schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const isHoliday = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.some(h => h.date === dateStr);
  };

  const getDayOfWeek = (day: number) => {
    const date = new Date(year, month - 1, day);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const isWeekend = (day: number) => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isLastSaturdayAfter1630 = (day: number, timeSlot: string) => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const isLastSaturday = dayOfWeek === 6 && day + 7 > daysInMonth;
    const slotHour = parseInt(timeSlot.split(':')[0]);
    return isLastSaturday && slotHour >= 16;
  };

  const isBlocked = (day: number, timeSlot: string) => {
    if (isHoliday(day)) return true;
    if (isWeekend(day) && !isLastSaturdayAfter1630(day, timeSlot)) return true;
    return false;
  };

  const getEventsForCell = (day: number, timeSlot: string) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr && e.time_slot.startsWith(timeSlot));
  };

  const handleCellClick = (day: number, timeSlot: string) => {
    if (isBlocked(day, timeSlot)) return;
    
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cellEvents = getEventsForCell(day, timeSlot);
    
    if (cellEvents.length > 0) {
      setSelectedEvent(cellEvents[0]);
    } else {
      setSelectedEvent(null);
    }
    
    setSelectedDate(dateStr);
    setSelectedTimeSlot(timeSlot + "-" + (parseInt(timeSlot.split(':')[0]) + 1) + ":30");
    setModalOpen(true);
  };

  const handleSave = async (eventData: Partial<DrivingScheduleEvent>) => {
    if (!user) return;

    try {
      if (selectedEvent?.id) {
        await updateScheduleEvent(selectedEvent.id, eventData);
        toast.success("Event updated successfully");
      } else {
        await createScheduleEvent({ ...eventData, user_id: user.id } as any);
        toast.success("Event created successfully");
      }
      await loadSchedule();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScheduleEvent(id);
      toast.success("Event deleted successfully");
      await loadSchedule();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleResetSchedule = async () => {
    if (!isOfficialUser) return;
    
    if (!confirm("This will reset your schedule to the official template. Continue?")) return;
    
    setResetting(true);
    try {
      await resetUserSchedule();
      toast.success("Schedule reset successfully");
      await loadSchedule();
    } catch (error) {
      console.error("Error resetting schedule:", error);
      toast.error("Failed to reset schedule");
    } finally {
      setResetting(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
        <p className="text-muted-foreground mb-4">Please sign in to access your driving school schedule.</p>
        <p className="text-xs text-muted-foreground">
          Official users (kudzimusar@gmail.com) will see their pre-populated schedule automatically.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template Loader for Non-Official Users */}
      {events.length === 0 && !loading && !isOfficialUser && (
        <ScheduleTemplateLoader onLoadComplete={loadSchedule} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          {events.length > 0 && (
            <Badge variant={isOfficialUser ? "default" : "outline"} className="text-xs w-fit">
              {isOfficialUser ? "📅 Official" : "📅 Custom"} ({events.length})
            </Badge>
          )}
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          {isOfficialUser && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetSchedule}
              disabled={resetting}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              <RefreshCw className={cn("w-3 h-3 sm:w-4 sm:h-4 sm:mr-2", resetting && "animate-spin")} />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 sm:h-9 sm:w-9 p-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 sm:h-9 sm:w-9 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-muted rounded border" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-muted/50 rounded border border-dashed" />
          <span className="hidden sm:inline">Blocked (Holiday/Weekend)</span>
          <span className="sm:hidden">Blocked</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
          <span>Completed</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[60px_repeat(10,1fr)] sm:grid-cols-[80px_repeat(10,1fr)] gap-1">
            <div className="sticky left-0 bg-background z-10 font-semibold p-1 sm:p-2 text-xs sm:text-sm">Day</div>
            {TIME_SLOTS.map(slot => (
              <div key={slot} className="text-[10px] sm:text-xs font-semibold p-1 sm:p-2 text-center">{slot}</div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <>
                <div key={`day-${day}`} className="sticky left-0 bg-background z-10 p-1 sm:p-2 font-medium border-r text-xs sm:text-sm">
                  <div className="leading-tight">{day}<span className="hidden sm:inline"> {getDayOfWeek(day)}</span></div>
                  <div className="sm:hidden text-[9px] opacity-70">{getDayOfWeek(day).slice(0, 3)}</div>
                  {isHoliday(day) && <div className="text-[9px] sm:text-[10px] text-red-500">Holiday</div>}
                </div>
                {TIME_SLOTS.map(slot => {
                  const blocked = isBlocked(day, slot);
                  const cellEvents = getEventsForCell(day, slot);
                  const hasEvent = cellEvents.length > 0;
                  const event = cellEvents[0];

                  return (
                    <div
                      key={`${day}-${slot}`}
                      onClick={() => handleCellClick(day, slot)}
                      className={cn(
                        "min-h-[50px] sm:min-h-[60px] p-0.5 sm:p-1 border rounded cursor-pointer transition-colors",
                        blocked && "bg-muted/50 border-dashed cursor-not-allowed",
                        !blocked && !hasEvent && "hover:bg-accent",
                        hasEvent && EVENT_COLORS[event.event_type],
                        event?.status === 'completed' && "opacity-70"
                      )}
                    >
                      {hasEvent && (
                        <div className="flex flex-col items-center justify-center h-full gap-0.5 sm:gap-1">
                          {event.status === 'completed' && (
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          )}
                          {event.symbol && (
                            <Badge variant="outline" className="text-[8px] sm:text-[10px] px-0.5 sm:px-1 py-0 leading-tight">
                              {event.symbol}
                            </Badge>
                          )}
                          <div className="text-[8px] sm:text-[10px] text-center font-medium leading-tight px-0.5">
                            {event.custom_label || (event.event_type === 'theory' ? `学科${event.lecture_number}` : event.event_type)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <ScheduleEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={selectedEvent}
        date={selectedDate}
        timeSlot={selectedTimeSlot}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
