import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface StudyEvent {
  id: string;
  date: Date;
  title: string;
  color: 'blue' | 'purple' | 'green' | 'amber' | 'red';
  time?: string;
}

const colorOptions = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
];

const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 border-blue-500 text-blue-900',
    purple: 'bg-purple-100 border-purple-500 text-purple-900',
    green: 'bg-green-100 border-green-500 text-green-900',
    amber: 'bg-amber-100 border-amber-500 text-amber-900',
    red: 'bg-red-100 border-red-500 text-red-900',
  };
  return colorMap[color] || colorMap.blue;
};

const StudyCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<StudyEvent[]>([
    {
      id: '1',
      date: new Date(),
      title: 'Practice road signs',
      color: 'blue',
      time: '10:00 AM'
    },
    {
      id: '2',
      date: new Date(Date.now() + 86400000), // Tomorrow
      title: 'Full practice test',
      color: 'green',
      time: '2:00 PM'
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    color: 'blue' as StudyEvent['color'],
    time: ''
  });

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title) return;

    const event: StudyEvent = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newEvent.title,
      color: newEvent.color,
      time: newEvent.time || undefined
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', color: 'blue', time: '' });
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const eventsOnSelectedDate = events.filter(
    e => selectedDate && format(e.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const getDatesWithEvents = () => {
    return events.map(e => e.date);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border w-full pointer-events-auto"
        />
      </Card>

      {selectedDate && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {eventsOnSelectedDate.length} event(s) scheduled
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Study Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Practice road signs"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time (optional)</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color Label</Label>
                    <Select
                      value={newEvent.color}
                      onValueChange={(value) => setNewEvent({ ...newEvent, color: value as StudyEvent['color'] })}
                    >
                      <SelectTrigger id="color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${option.class}`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddEvent} className="w-full">
                    Add Event
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
              eventsOnSelectedDate.map(event => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border-l-4 flex justify-between items-center ${getColorClass(event.color)}`}
                >
                  <div>
                    <p className="font-semibold text-sm">{event.title}</p>
                    {event.time && (
                      <p className="text-xs opacity-75">{event.time}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudyCalendar;
