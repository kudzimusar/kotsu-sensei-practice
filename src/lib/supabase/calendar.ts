import { getEvents, type StudyEvent } from "./events";
import { getMonthSchedule, type DrivingScheduleEvent } from "./drivingSchedule";

export interface CombinedCalendarEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  time?: string | null;
  description?: string | null;
  location?: string | null;
  instructor?: string | null;
  source: 'study_events' | 'driving_school_schedule';
  status?: 'scheduled' | 'completed' | 'cancelled';
  time_slot?: string;
  event_type?: string;
  lecture_number?: number;
  custom_label?: string;
}

/**
 * Fetch combined events from both study_events and driving_school_schedule
 * This is the unified data source for Calendar and Planner components
 */
export const getCombinedEvents = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<CombinedCalendarEvent[]> => {
  // Fetch both sources in parallel for better performance
  const [studyEvents, drivingEvents] = await Promise.all([
    getEvents(userId, { startDate, endDate }),
    getMonthSchedule(userId, 
      new Date(startDate).getFullYear(),
      new Date(startDate).getMonth() + 1
    ),
  ]);

  // Normalize study_events
  const normalizedStudyEvents: CombinedCalendarEvent[] = studyEvents.map(event => ({
    id: event.id,
    date: event.date,
    title: event.title,
    type: event.type,
    time: event.time,
    description: event.description,
    location: event.location,
    instructor: event.instructor,
    source: 'study_events' as const,
  }));

  // Normalize driving_school_schedule events
  const normalizedDrivingEvents: CombinedCalendarEvent[] = drivingEvents
    .filter(event => {
      const eventDate = new Date(event.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    })
    .map(event => ({
      id: event.id,
      date: event.date,
      title: event.custom_label || (event.event_type === 'theory' ? `学科${event.lecture_number}` : event.event_type),
      type: event.event_type,
      time: event.time_slot?.split('-')[0] || null,
      description: event.notes || null,
      location: event.location || null,
      instructor: event.instructor || null,
      source: 'driving_school_schedule' as const,
      status: event.status,
      time_slot: event.time_slot,
      event_type: event.event_type,
      lecture_number: event.lecture_number,
      custom_label: event.custom_label,
    }));

  // Combine and sort by date, then by time
  return [...normalizedStudyEvents, ...normalizedDrivingEvents].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // Sort by time if dates are the same
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });
};

/**
 * Get events for a specific month (optimized for calendar views)
 */
export const getMonthEvents = async (
  userId: string,
  year: number,
  month: number
): Promise<CombinedCalendarEvent[]> => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  return getCombinedEvents(userId, startDate, endDate);
};

/**
 * Get upcoming events (optimized for quick views)
 */
export const getUpcomingEvents = async (
  userId: string,
  limit: number = 10
): Promise<CombinedCalendarEvent[]> => {
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3); // Next 3 months
  const endDate = futureDate.toISOString().split('T')[0];

  const events = await getCombinedEvents(userId, today, endDate);
  
  return events
    .filter(event => {
      const eventDate = new Date(event.date);
      const todayDate = new Date(today);
      return eventDate >= todayDate && event.status !== 'completed';
    })
    .slice(0, limit);
};

