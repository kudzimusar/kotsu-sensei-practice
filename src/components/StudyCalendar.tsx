import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Edit2, Car, BookOpen, FileCheck, MapPin, Bell, CalendarDays, Grid3x3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isToday, isSameWeek, addWeeks, subWeeks } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/supabase/events";
import { getMonthEvents, getWeekEvents, getDayEvents, getCombinedEvents, type CombinedCalendarEvent } from "@/lib/supabase/calendar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type EventType = 'lesson' | 'test' | 'class' | 'practice';

interface StudyEvent {
  id: string;
  date: Date;
  title: string;
  type: EventType;
  time?: string;
  description?: string;
  location?: string;
  instructor?: string;
}

const eventTypes = [
  { 
    value: 'lesson' as EventType, 
    label: 'Driving Lesson', 
    icon: Car,
    color: 'bg-blue-100 border-blue-500 text-blue-900',
    badgeColor: 'bg-blue-500'
  },
  { 
    value: 'test' as EventType, 
    label: 'Driving Test', 
    icon: FileCheck,
    color: 'bg-red-100 border-red-500 text-red-900',
    badgeColor: 'bg-red-500'
  },
  { 
    value: 'class' as EventType, 
    label: 'Theory Class', 
    icon: BookOpen,
    color: 'bg-purple-100 border-purple-500 text-purple-900',
    badgeColor: 'bg-purple-500'
  },
  { 
    value: 'practice' as EventType, 
    label: 'Practice Session', 
    icon: Car,
    color: 'bg-green-100 border-green-500 text-green-900',
    badgeColor: 'bg-green-500'
  },
];

const getEventTypeConfig = (type: EventType) => {
  return eventTypes.find(t => t.value === type) || eventTypes[0];
};

// Time slots for week view
const TIME_SLOTS = [
  "08:40", "09:40", "10:40", "11:40",
  "12:30", "13:30", "14:30", "15:30",
  "16:30", "17:30", "17:40", "18:40", "19:40"
];

const StudyCalendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  // Get month/year from URL params or default to current month
  const urlMonth = searchParams.get('month');
  const urlYear = searchParams.get('year');
  const initialDate = urlYear && urlMonth 
    ? new Date(parseInt(urlYear), parseInt(urlMonth) - 1, 1)
    : new Date();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Update URL params when date changes
  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const currentMonth = searchParams.get('month');
      const currentYear = searchParams.get('year');
      
      if (currentMonth !== month.toString() || currentYear !== year.toString()) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('month', month.toString());
        newParams.set('year', year.toString());
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [selectedDate, searchParams, setSearchParams]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'lesson' as EventType,
    time: '',
    description: '',
    location: '',
    instructor: ''
  });

  // Get combined events based on view mode
  const currentDate = selectedDate || new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  // Determine query key and function based on view mode
  const getQueryKey = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return ["combinedEvents", user?.id, "week", weekStart.toISOString().split('T')[0]];
    } else if (viewMode === 'day') {
      return ["combinedEvents", user?.id, "day", currentDate.toISOString().split('T')[0]];
    } else {
      return ["combinedEvents", user?.id, year, month];
    }
  };

  const getQueryFn = () => {
    if (viewMode === 'week') {
      return () => getWeekEvents(user!.id, currentDate);
    } else if (viewMode === 'day') {
      return () => getDayEvents(user!.id, currentDate);
    } else {
      return () => getMonthEvents(user!.id, year, month);
    }
  };
  
  const { data: combinedEvents = [], isLoading: isLoadingEvents } = useQuery<CombinedCalendarEvent[]>({
    queryKey: getQueryKey(),
    queryFn: getQueryFn(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer (formerly cacheTime in v4)
  });

  // Separate study_events and driving_school_schedule for backward compatibility
  const events = combinedEvents.filter(e => e.source === 'study_events');
  const drivingEvents = combinedEvents.filter(e => e.source === 'driving_school_schedule');

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      // Invalidate both individual and combined queries
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["combinedEvents", user?.id] });
      toast.success("Event added successfully!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateEvent(id, updates),
    onSuccess: () => {
      // Invalidate both individual and combined queries
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["combinedEvents", user?.id] });
      toast.success("Event updated successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      // Invalidate both individual and combined queries
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["combinedEvents", user?.id] });
      toast.success("Event deleted successfully!");
    },
  });

  const handleSaveEvent = async () => {
    if (!selectedDate || !newEvent.title || !user) return;

    if (editingEvent) {
      await updateMutation.mutateAsync({
        id: editingEvent.id,
        updates: {
          title: newEvent.title,
          type: newEvent.type,
          time: newEvent.time || null,
          description: newEvent.description || null,
          location: newEvent.location || null,
          instructor: newEvent.instructor || null,
        },
      });
      setEditingEvent(null);
    } else {
      await createMutation.mutateAsync({
        user_id: user.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        title: newEvent.title,
        type: newEvent.type,
        time: newEvent.time || null,
        description: newEvent.description || null,
        location: newEvent.location || null,
        instructor: newEvent.instructor || null,
      });
    }

    setNewEvent({ title: '', type: 'lesson', time: '', description: '', location: '', instructor: '' });
    setIsDialogOpen(false);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      type: event.type as EventType,
      time: event.time || '',
      description: event.description || '',
      location: event.location || '',
      instructor: event.instructor || ''
    });
    setSelectedDate(parseISO(event.date));
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingEvent(null);
      setNewEvent({ title: '', type: 'lesson', time: '', description: '', location: '', instructor: '' });
    }
  };

  // Filter events for selected date (already sorted by combined API)
  const allEventsOnSelectedDate = combinedEvents.filter(
    e => selectedDate && isSameDay(parseISO(e.date), selectedDate)
  ).map(e => ({
    ...e,
    isDrivingSchedule: e.source === 'driving_school_schedule',
  }));

  // Get upcoming events (already sorted by combined API)
  const allUpcomingEvents = combinedEvents
    .filter(e => {
      const eventDate = parseISO(e.date);
      return eventDate >= new Date() && e.status !== 'completed';
    })
    .slice(0, 3)
    .map(e => ({
      ...e,
      isDrivingSchedule: e.source === 'driving_school_schedule',
    }));

  // Get dates that have events for visual indicators
  const eventDates = combinedEvents.map(e => parseISO(e.date));
  
  // Helper to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return combinedEvents.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Enhanced modifiers for better visual indicators
  const modifiers = {
    hasEvent: eventDates,
    hasMultipleEvents: eventDates.filter(date => {
      const events = getEventsForDate(date);
      return events.length > 1;
    }),
    hasTest: eventDates.filter(date => {
      const events = getEventsForDate(date);
      return events.some(e => {
        const eventType = (e as any).type || (e as any).event_type;
        return eventType === 'test';
      });
    }),
    hasDriving: eventDates.filter(date => {
      const events = getEventsForDate(date);
      return events.some(e => {
        const eventType = (e as any).type || (e as any).event_type;
        return eventType === 'lesson' || eventType === 'driving';
      });
    }),
    isToday: [new Date()],
  };

  const modifiersClassNames = {
    hasEvent: cn(
      'relative',
      'after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2',
      isMobile 
        ? 'after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full' 
        : 'after:w-2 after:h-2 after:bg-primary after:rounded-full'
    ),
    hasMultipleEvents: cn(
      'relative',
      'after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2',
      isMobile 
        ? 'after:w-2 after:h-2 after:bg-primary after:rounded-full' 
        : 'after:w-2.5 after:h-2.5 after:bg-primary after:rounded-full'
    ),
    hasTest: 'bg-red-50/70 border-red-300/60 border',
    hasDriving: 'bg-blue-50/70 border-blue-300/60 border',
    isToday: 'ring-2 ring-primary ring-offset-2 font-bold bg-primary/10',
  };

  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    // Update URL params immediately
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('month', month.toString());
    newParams.set('year', year.toString());
    setSearchParams(newParams, { replace: true });
  };

  // Week navigation
  const goToNextWeek = () => {
    if (selectedDate) {
      const nextWeek = addWeeks(selectedDate, 1);
      setSelectedDate(nextWeek);
      const year = nextWeek.getFullYear();
      const month = nextWeek.getMonth() + 1;
      const newParams = new URLSearchParams(searchParams);
      newParams.set('month', month.toString());
      newParams.set('year', year.toString());
      setSearchParams(newParams, { replace: true });
    }
  };

  const goToPreviousWeek = () => {
    if (selectedDate) {
      const prevWeek = subWeeks(selectedDate, 1);
      setSelectedDate(prevWeek);
      const year = prevWeek.getFullYear();
      const month = prevWeek.getMonth() + 1;
      const newParams = new URLSearchParams(searchParams);
      newParams.set('month', month.toString());
      newParams.set('year', year.toString());
      setSearchParams(newParams, { replace: true });
    }
  };

  // Day navigation
  const goToNextDay = () => {
    if (selectedDate) {
      const nextDay = addDays(selectedDate, 1);
      setSelectedDate(nextDay);
      const year = nextDay.getFullYear();
      const month = nextDay.getMonth() + 1;
      const newParams = new URLSearchParams(searchParams);
      newParams.set('month', month.toString());
      newParams.set('year', year.toString());
      setSearchParams(newParams, { replace: true });
    }
  };

  const goToPreviousDay = () => {
    if (selectedDate) {
      const prevDay = addDays(selectedDate, -1);
      setSelectedDate(prevDay);
      const year = prevDay.getFullYear();
      const month = prevDay.getMonth() + 1;
      const newParams = new URLSearchParams(searchParams);
      newParams.set('month', month.toString());
      newParams.set('year', year.toString());
      setSearchParams(newParams, { replace: true });
    }
  };

  // Get week dates for week view
  const getWeekDates = () => {
    if (!selectedDate) return [];
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  // Render event form (used in both Dialog and Sheet)
  const renderEventForm = () => (
    <div className="space-y-4 py-4">
      <div>
        <Label htmlFor="type">Event Type</Label>
        <Select
          value={newEvent.type}
          onValueChange={(value) => setNewEvent({ ...newEvent, type: value as EventType })}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map(type => {
              const Icon = type.icon;
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Highway driving practice"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="time">Time</Label>
        <Input
          id="time"
          type="time"
          value={newEvent.time}
          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g., Driving School HQ"
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="instructor">Instructor/Contact</Label>
        <Input
          id="instructor"
          placeholder="e.g., John Smith"
          value={newEvent.instructor}
          onChange={(e) => setNewEvent({ ...newEvent, instructor: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Notes</Label>
        <Textarea
          id="description"
          placeholder="Additional details..."
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => handleDialogChange(false)} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSaveEvent} className="flex-1">
          {editingEvent ? 'Update Event' : 'Add Event'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Navigation Header - Compact on Mobile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 w-full sm:w-auto">
          {/* Navigation arrows for week and day views */}
          {(viewMode === 'week' || viewMode === 'day') && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={viewMode === 'week' ? goToPreviousWeek : goToPreviousDay}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={viewMode === 'week' ? goToNextWeek : goToNextDay}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          <h2 className="text-base sm:text-lg font-bold truncate">
            {selectedDate && (() => {
              if (viewMode === 'week') {
                const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
                const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
                if (weekStart.getMonth() === weekEnd.getMonth()) {
                  return format(weekStart, isMobile ? 'MMM d' : 'MMM d') + ' - ' + format(weekEnd, isMobile ? 'd, yyyy' : 'd, yyyy');
                } else {
                  return format(weekStart, isMobile ? 'MMM d' : 'MMM d') + ' - ' + format(weekEnd, isMobile ? 'MMM d, yyyy' : 'MMM d, yyyy');
                }
              } else if (viewMode === 'day') {
                return format(selectedDate, isMobile ? 'MMM d, yyyy' : 'EEEE, MMMM d, yyyy');
              } else {
                return format(selectedDate, isMobile ? 'MMM yyyy' : 'MMMM yyyy');
              }
            })()}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday} className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0">
            <span className="hidden sm:inline">Today</span>
            <span className="sm:hidden">Now</span>
          </Button>
        </div>
        
        {/* View Switcher */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="flex rounded-md border p-0.5 bg-muted/50 flex-1 sm:flex-none">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-7 px-2 sm:px-3 text-xs flex-1 sm:flex-none"
            >
              <CalendarDays className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Month</span>
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-7 px-2 sm:px-3 text-xs flex-1 sm:flex-none"
            >
              <Grid3x3 className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Week</span>
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="h-7 px-2 sm:px-3 text-xs flex-1 sm:flex-none"
            >
              <List className="w-3 h-3 sm:mr-1" />
              <span className="hidden sm:inline">Day</span>
            </Button>
          </div>
          <Link to={`/planner?${searchParams.toString()}`} className="shrink-0">
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-7 sm:h-8 px-2 sm:px-3">
              <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Upcoming Events Summary - Compact on Mobile */}
      {allUpcomingEvents.length > 0 && (
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <h3 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            <span className="hidden sm:inline">Upcoming Events</span>
            <span className="sm:hidden">Upcoming</span>
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {allUpcomingEvents.map(event => {
              const config = getEventTypeConfig(event.type as EventType);
              const Icon = config.icon;
              const isDriving = 'isDrivingSchedule' in event && event.isDrivingSchedule;
              return (
                <div key={event.id} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm bg-white/80 rounded-lg p-1.5 sm:p-2">
                  <Badge className={cn(`${config.badgeColor} text-white text-[10px] sm:text-xs px-1.5 sm:px-2 shrink-0`)}>
                    {format(parseISO(event.date), isMobile ? 'M/d' : 'MMM d')}
                  </Badge>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 font-medium truncate min-w-0">{event.title}</span>
                  {isDriving && <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 shrink-0 hidden sm:inline-flex">Schedule</Badge>}
                  {event.time && <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold shrink-0">{event.time}</span>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Calendar Views - Conditional Rendering */}
      {viewMode === 'month' && (
        <Card className="p-2 sm:p-3 w-full max-w-full overflow-hidden">
          {isLoadingEvents ? (
            <div className="space-y-2 sm:space-y-4 w-full">
              <Skeleton className="h-8 sm:h-10 w-full" />
              <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 sm:h-10 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-hidden">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleMonthChange}
                onMonthChange={handleMonthChange}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className={cn(
                  "rounded-md border w-full max-w-full",
                  isMobile && "text-xs [&_.rdp-head_cell]:text-[10px] [&_.rdp-cell]:h-8 [&_.rdp-day]:h-8 [&_.rdp-day]:text-xs [&_.rdp-nav_button]:h-6 [&_.rdp-nav_button]:w-6"
                )}
                classNames={
                  isMobile
                    ? {
                        head_cell: "text-[10px] h-7 p-1 font-medium",
                        cell: "h-8 p-0.5",
                        day: "h-8 text-xs p-0 font-normal touch-manipulation",
                        nav_button: "h-6 w-6 p-0",
                        caption_label: "text-xs",
                      }
                    : undefined
                }
              />
            </div>
          )}
        </Card>
      )}

      {viewMode === 'week' && (
        <Card className="p-2 sm:p-3 w-full max-w-full overflow-hidden">
          {isLoadingEvents ? (
            <div className="space-y-2">
              <div className="grid grid-cols-8 gap-1">
                <Skeleton className="h-8 w-full" />
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-1">
                  <Skeleton className="h-12 w-full" />
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Week header */}
                <div className="grid grid-cols-8 gap-1 mb-1 border-b pb-2">
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground p-2"></div>
                  {getWeekDates().map((date, idx) => {
                    const dayEvents = combinedEvents.filter(e => isSameDay(parseISO(e.date), date));
                    const isCurrentDay = isToday(date);
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "text-center p-2 rounded-md",
                          isCurrentDay && "bg-primary/10 ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                          {format(date, 'EEE')}
                        </div>
                        <div className={cn(
                          "text-xs sm:text-sm font-bold mt-1",
                          isCurrentDay && "text-primary"
                        )}>
                          {format(date, 'd')}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="mt-1 flex justify-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            {dayEvents.length > 1 && (
                              <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 1}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Time slots */}
                <div className="space-y-1">
                  {TIME_SLOTS.map((timeSlot, timeIdx) => (
                    <div key={timeIdx} className="grid grid-cols-8 gap-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground p-2 font-medium text-right">
                        {timeSlot}
                      </div>
                      {getWeekDates().map((date, dayIdx) => {
                        const dayEvents = combinedEvents.filter(e => {
                          const eventDate = parseISO(e.date);
                          if (!isSameDay(eventDate, date)) return false;
                          if (!e.time) return false;
                          // Extract start time from event time (e.g., "08:40-09:40" -> "08:40", or "08:40" -> "08:40")
                          const eventTime = e.time.includes('-') 
                            ? e.time.split('-')[0].trim() 
                            : e.time.trim();
                          // Match exact time slot
                          return eventTime === timeSlot || eventTime.substring(0, 5) === timeSlot.substring(0, 5);
                        });
                        return (
                          <div
                            key={dayIdx}
                            className={cn(
                              "min-h-[3rem] sm:min-h-[4rem] border rounded-md p-1 sm:p-2 cursor-pointer transition-colors",
                              dayEvents.length > 0 
                                ? "bg-blue-50/50 border-blue-300/50 hover:bg-blue-50" 
                                : "border-gray-200 hover:bg-gray-50/50"
                            )}
                                onClick={() => {
                              setSelectedDate(date);
                              if (!editingEvent) {
                                if (dayEvents.length === 0) {
                                  setIsDialogOpen(true);
                                }
                              }
                            }}
                          >
                            {dayEvents.map((event, eventIdx) => {
                              const config = getEventTypeConfig(event.type as EventType);
                              const Icon = config.icon;
                              const isDriving = event.source === 'driving_school_schedule';
                              return (
                                <div
                                  key={eventIdx}
                                  className={cn(
                                    "text-[9px] sm:text-xs p-1 rounded mb-1 truncate",
                                    config.color,
                                    isDriving && "opacity-80"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDriving) {
                                      handleEditEvent(event);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-1">
                                    <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                    <span className="truncate font-medium">{event.title}</span>
                                  </div>
                                  {event.location && (
                                    <div className="text-[8px] opacity-75 truncate mt-0.5">
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {viewMode === 'day' && (
        <Card className="p-3 sm:p-4 w-full max-w-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {selectedDate && (() => {
                  const dayEvents = combinedEvents.filter(e => isSameDay(parseISO(e.date), selectedDate));
                  return `${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}`;
                })()}
              </p>
            </div>
            {isMobile ? (
              <Sheet open={isDialogOpen} onOpenChange={handleDialogChange}>
                <SheetTrigger asChild>
                  <Button size="sm" className="h-8 px-2 shrink-0">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline ml-1">Add</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    {renderEventForm()}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <Button size="sm" className="shrink-0">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? 'Edit Event' : 'Add New Event'}
                    </DialogTitle>
                  </DialogHeader>
                  {renderEventForm()}
                </DialogContent>
              </Dialog>
            )}
          </div>
          {isLoadingEvents ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {selectedDate && (() => {
                const dayEvents = combinedEvents
                  .filter(e => isSameDay(parseISO(e.date), selectedDate))
                  .sort((a, b) => {
                    if (a.time && b.time) {
                      const aTime = a.time.split('-')[0] || a.time;
                      const bTime = b.time.split('-')[0] || b.time;
                      return aTime.localeCompare(bTime);
                    }
                    if (a.time) return -1;
                    if (b.time) return 1;
                    return 0;
                  });
                
                if (dayEvents.length === 0) {
                  return (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No events scheduled</p>
                      <p className="text-xs mt-1">Click "Add Event" to schedule something</p>
                    </div>
                  );
                }
                
                return dayEvents.map((event) => {
                  const config = getEventTypeConfig(event.type as EventType);
                  const Icon = config.icon;
                  const isDrivingSchedule = event.source === 'driving_school_schedule';
                  const isCompleted = event.status === 'completed';
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "p-3 sm:p-4 rounded-lg border-l-4 shadow-sm",
                        config.color,
                        isCompleted && "opacity-70"
                      )}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg shrink-0 bg-white/80 border flex items-center justify-center">
                            <Icon className={cn(
                              "w-4 h-4 sm:w-5 sm:h-5",
                              config.badgeColor === 'bg-blue-500' && 'text-blue-600',
                              config.badgeColor === 'bg-red-500' && 'text-red-600',
                              config.badgeColor === 'bg-purple-500' && 'text-purple-600',
                              config.badgeColor === 'bg-green-500' && 'text-green-600'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h4 className="font-bold text-sm sm:text-base truncate">{event.title}</h4>
                              {isDrivingSchedule && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                                  Schedule
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs bg-green-50 shrink-0">
                                  ✓ Completed
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              {event.time && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                  <span className="font-semibold">🕐</span>
                                  <span>{event.time}</span>
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                              {event.instructor && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                  <span>👤</span>
                                  <span className="truncate">{event.instructor}</span>
                                </div>
                              )}
                              {event.description && (
                                <div className="mt-2 text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isDrivingSchedule && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Selected Date Events - Only show in month view */}
      {selectedDate && viewMode === 'month' && (
        <Card className="p-3 sm:p-5">
          <div className="flex justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-lg truncate">
                {format(selectedDate, isMobile ? 'MMM d, yyyy' : 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {allEventsOnSelectedDate.length} event{allEventsOnSelectedDate.length !== 1 ? 's' : ''}
              </p>
            </div>
            {isMobile ? (
              <Sheet open={isDialogOpen} onOpenChange={handleDialogChange}>
                <SheetTrigger asChild>
                  <Button size="sm" className="h-8 px-2 shrink-0">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline ml-1">Add</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    {renderEventForm()}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <Button size="sm" className="shrink-0">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Event
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </DialogTitle>
                </DialogHeader>
                {renderEventForm()}
              </DialogContent>
            </Dialog>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {allEventsOnSelectedDate.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                No events scheduled for this day
              </p>
            ) : (
              allEventsOnSelectedDate.map(event => {
                const config = getEventTypeConfig(event.type as EventType);
                const Icon = config.icon;
                const isDrivingSchedule = 'isDrivingSchedule' in event && event.isDrivingSchedule;
                const isCompleted = 'status' in event && event.status === 'completed';
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "p-2.5 sm:p-4 rounded-lg border-l-4",
                      config.color,
                      isCompleted && "opacity-70"
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <p className="font-semibold text-xs sm:text-sm truncate">{event.title}</p>
                            {isDrivingSchedule && (
                              <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 shrink-0">Schedule</Badge>
                            )}
                            {isCompleted && (
                              <Badge variant="outline" className="text-[9px] sm:text-[10px] bg-green-50 shrink-0">✓</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                            {event.time && (
                              <span className="text-[10px] sm:text-xs opacity-75 flex items-center gap-0.5 sm:gap-1">
                                🕐 {event.time}
                              </span>
                            )}
                            {event.location && (
                              <span className="text-[10px] sm:text-xs opacity-75 flex items-center gap-0.5 sm:gap-1 truncate max-w-full">
                                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </span>
                            )}
                          </div>
                          {event.instructor && (
                            <p className="text-[10px] sm:text-xs opacity-75 mt-1 truncate">
                              👤 {event.instructor}
                            </p>
                          )}
                          {event.description && !isMobile && (
                            <p className="text-xs opacity-75 mt-2 whitespace-pre-wrap line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {!isDrivingSchedule && (
                        <div className="flex gap-0.5 sm:gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudyCalendar;
