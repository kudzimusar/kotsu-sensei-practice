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
import { Trash2, Plus, Edit2, Car, BookOpen, FileCheck, MapPin, Bell } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/supabase/events";
import { getMonthEvents, getCombinedEvents, type CombinedCalendarEvent } from "@/lib/supabase/calendar";
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

  // Get combined events for current month using unified API (parallel fetching)
  const currentMonth = selectedDate || new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  
  const { data: combinedEvents = [], isLoading: isLoadingEvents } = useQuery<CombinedCalendarEvent[]>({
    queryKey: ["combinedEvents", user?.id, year, month],
    queryFn: () => getMonthEvents(user!.id, year, month),
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
  
  // Custom day content to show event indicators
  const modifiers = {
    hasEvent: eventDates,
  };

  const modifiersClassNames = {
    hasEvent: cn(
      'relative after:content-[""] after:absolute after:bottom-0.5 sm:after:bottom-1 after:left-1/2 after:-translate-x-1/2',
      isMobile 
        ? 'after:w-1 after:h-1 after:bg-primary after:rounded-full' 
        : 'after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full'
    ),
  };

  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
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
    <div className="space-y-3 sm:space-y-6">
      {/* Navigation Header - Compact on Mobile */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold truncate">
            {selectedDate && format(selectedDate, isMobile ? 'MMM yyyy' : 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday} className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0">
            <span className="hidden sm:inline">Today</span>
            <span className="sm:hidden">Now</span>
          </Button>
        </div>
        <Link to={`/planner?${searchParams.toString()}`} className="shrink-0">
          <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-7 sm:h-8 px-2 sm:px-3">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
        </Link>
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

      {/* Calendar - Compact on Mobile */}
      <Card className="p-2 sm:p-4">
        {isLoadingEvents ? (
          <div className="space-y-2 sm:space-y-4">
            <Skeleton className="h-8 sm:h-10 w-full" />
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-8 sm:h-10 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleMonthChange}
            onMonthChange={handleMonthChange}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className={cn(
              "rounded-md border w-full pointer-events-auto",
              isMobile && "text-sm [&_td]:p-1 [&_th]:p-1.5 [&_button]:h-8 [&_button]:text-xs"
            )}
          />
        )}
      </Card>

      {/* Selected Date Events - Compact on Mobile */}
      {selectedDate && (
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
