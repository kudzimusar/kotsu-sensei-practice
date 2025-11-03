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
  "08:40", "09:40", "10:40", "11:40",
  "12:30", "13:30", "14:30", "15:30",
  "16:30", "17:30", "17:40", "18:40", "19:40"
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(event?.time_slot || timeSlot || TIME_SLOTS[3]);
  const [lectureNumber, setLectureNumber] = useState(event?.lecture_number?.toString() || '1');
  const [customLabel, setCustomLabel] = useState(event?.custom_label || '');
  const [location, setLocation] = useState(event?.location || '');
  const [instructor, setInstructor] = useState(event?.instructor || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [status, setStatus] = useState<DrivingScheduleEvent['status']>(event?.status || 'scheduled');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
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

      await onSave(eventData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsSaving(false);
    }
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
                <SelectItem value="scheduled">📅 Scheduled</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {new Date(date) < new Date() && status === 'scheduled' && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                This date has passed. Consider marking as completed.
              </p>
            )}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              event ? 'Update' : 'Create'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
