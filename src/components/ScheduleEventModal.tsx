import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, BookOpen, Car, ClipboardCheck, Brain, Compass, Trophy } from "lucide-react";
import type { DrivingScheduleEvent } from "@/lib/supabase/drivingSchedule";

const TIME_SLOTS = [
  "08:40-09:30", "09:40-10:30", "10:40-11:30", "11:40-12:30",
  "13:40-14:30", "14:50-16:20", "16:30-17:20", "17:30-18:20",
  "18:30-19:20", "19:40-20:30"
];

const EVENT_TYPES = [
  { value: 'theory', label: '学科 (Theory Lecture)', icon: BookOpen, color: 'bg-green-500' },
  { value: 'driving', label: 'AT所内 (Driving Practice)', icon: Car, color: 'bg-blue-500' },
  { value: 'test', label: '(P) Test', icon: ClipboardCheck, color: 'bg-red-500' },
  { value: 'orientation', label: 'オリエンテーション', icon: Compass, color: 'bg-orange-500' },
  { value: 'aptitude', label: '適性検査 (Aptitude)', icon: Brain, color: 'bg-purple-500' },
];

interface ScheduleEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: DrivingScheduleEvent | null;
  date: string;
  timeSlot?: string;
  onSave: (event: Partial<DrivingScheduleEvent>) => void;
  onDelete?: (id: string) => void;
}

export function ScheduleEventModal({
  open,
  onOpenChange,
  event,
  date,
  timeSlot,
  onSave,
  onDelete,
}: ScheduleEventModalProps) {
  const [eventType, setEventType] = useState<DrivingScheduleEvent['event_type']>(event?.event_type || 'theory');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlot || event?.time_slot || TIME_SLOTS[5]);
  const [lectureNumber, setLectureNumber] = useState(event?.lecture_number?.toString() || '1');
  const [customLabel, setCustomLabel] = useState(event?.custom_label || '');
  const [location, setLocation] = useState(event?.location || '');
  const [instructor, setInstructor] = useState(event?.instructor || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [status, setStatus] = useState<DrivingScheduleEvent['status']>(event?.status || 'scheduled');

  const handleSave = () => {
    const eventData: Partial<DrivingScheduleEvent> = {
      date,
      time_slot: selectedTimeSlot,
      event_type: eventType as DrivingScheduleEvent['event_type'],
      lecture_number: eventType === 'theory' ? parseInt(lectureNumber) : undefined,
      custom_label: customLabel || undefined,
      location: location || undefined,
      instructor: instructor || undefined,
      notes: notes || undefined,
      status: status as DrivingScheduleEvent['status'],
    };

    if (event?.id) {
      eventData.id = event.id;
    }

    onSave(eventData);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (event?.id && onDelete) {
      onDelete(event.id);
      onOpenChange(false);
    }
  };

  const selectedType = EVENT_TYPES.find(t => t.value === eventType);
  const Icon = selectedType?.icon || BookOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {event ? 'Edit Schedule Event' : 'Add Schedule Event'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as DrivingScheduleEvent['event_type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {eventType === 'theory' && (
            <div className="space-y-2">
              <Label>Lecture Number (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={lectureNumber}
                onChange={(e) => setLectureNumber(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Slot
            </Label>
            <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(slot => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custom Label (Optional)</Label>
            <Input
              placeholder="e.g., 修了検定, AT所内"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location (Optional)
            </Label>
            <Input
              placeholder="e.g., Driving School Campus"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Instructor (Optional)
            </Label>
            <Input
              placeholder="e.g., Yamada-sensei"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DrivingScheduleEvent['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {event?.id && onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {event ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
