import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Edit2, Car, BookOpen, FileCheck, MapPin, Bell } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/supabase/events";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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

  const { data: events = [] } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: () => getEvents(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event added successfully!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateEvent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
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

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    setNewEvent({ title: '', type: 'lesson', time: '', description: '', location: '', instructor: '' });
  };

  const eventsOnSelectedDate = events.filter(
    e => selectedDate && isSameDay(parseISO(e.date), selectedDate)
  ).sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const upcomingEvents = events
    .filter(e => parseISO(e.date) >= new Date())
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 3);

  // Get dates that have events for visual indicators
  const eventDates = events.map(e => parseISO(e.date));
  
  // Custom day content to show event indicators
  const modifiers = {
    hasEvent: eventDates,
  };

  const modifiersClassNames = {
    hasEvent: 'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full',
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Events Summary */}
      {upcomingEvents.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Upcoming Events
          </h3>
          <div className="space-y-2">
            {upcomingEvents.map(event => {
              const config = getEventTypeConfig(event.type as EventType);
              const Icon = config.icon;
              return (
                <div key={event.id} className="flex items-center gap-3 text-sm bg-white/80 rounded-lg p-2">
                  <Badge className={`${config.badgeColor} text-white`}>
                    {format(parseISO(event.date), 'MMM d')}
                  </Badge>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 font-medium">{event.title}</span>
                  {event.time && <span className="text-xs text-muted-foreground font-semibold">{event.time}</span>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          className="rounded-md border w-full pointer-events-auto"
        />
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {eventsOnSelectedDate.length} event(s) scheduled
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
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

                  <Button onClick={handleSaveEvent} className="w-full">
                    {editingEvent ? 'Update Event' : 'Add Event'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {eventsOnSelectedDate.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events scheduled for this day
              </p>
            ) : (
              eventsOnSelectedDate.map(event => {
                const config = getEventTypeConfig(event.type as EventType);
                const Icon = config.icon;
                return (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border-l-4 ${config.color}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{event.title}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {event.time && (
                              <span className="text-xs opacity-75 flex items-center gap-1">
                                🕐 {event.time}
                              </span>
                            )}
                            {event.location && (
                              <span className="text-xs opacity-75 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                          {event.instructor && (
                            <p className="text-xs opacity-75 mt-1">
                              👤 {event.instructor}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs opacity-75 mt-2 whitespace-pre-wrap">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
