import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2, ChevronDown, BookOpen, Car, ClipboardCheck, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { bulkImportSchedule, getMonthSchedule, deleteScheduleEvent } from "@/lib/supabase/drivingSchedule";
import { toast } from "sonner";

// Template schedule data
const templateScheduleData = [
  // November 2025
  { date: "2025-11-17", time_slot: "14:50-16:20", event_type: "orientation", custom_label: "オリエンテーション", symbol: "△★", status: "scheduled" },
  { date: "2025-11-18", time_slot: "14:50-16:20", event_type: "aptitude", custom_label: "適性検査", symbol: "P", status: "scheduled" },
  { date: "2025-11-20", time_slot: "14:50-16:20", event_type: "theory", lecture_number: 1, custom_label: "学科1", symbol: "P", status: "scheduled" },
  { date: "2025-11-08", time_slot: "14:50-16:20", event_type: "theory", lecture_number: 6, custom_label: "学科6", status: "scheduled" },
  { date: "2025-11-08", time_slot: "16:30-18:00", event_type: "theory", lecture_number: 10, custom_label: "学科10", status: "scheduled" },
  { date: "2025-11-09", time_slot: "14:50-16:20", event_type: "theory", lecture_number: 4, custom_label: "学科4", status: "scheduled" },
  { date: "2025-11-10", time_slot: "14:50-16:20", event_type: "theory", lecture_number: 5, custom_label: "学科5", status: "scheduled" },
  { date: "2025-11-15", time_slot: "14:50-16:20", event_type: "theory", lecture_number: 8, custom_label: "学科8", status: "scheduled" },
  { date: "2025-11-15", time_slot: "16:30-18:00", event_type: "theory", lecture_number: 6, custom_label: "学科6", status: "scheduled" },
  { date: "2025-11-16", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-11-22", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-11-22", time_slot: "16:30-18:00", event_type: "theory", lecture_number: 9, custom_label: "学科9", status: "scheduled" },
  { date: "2025-11-23", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-11-23", time_slot: "16:30-18:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-11-24", time_slot: "14:50-16:20", event_type: "theory", lecture_number: 3, custom_label: "学科3", status: "scheduled" },
  { date: "2025-11-29", time_slot: "16:30-18:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-11-29", time_slot: "18:30-20:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", symbol: "P", status: "scheduled" },
  { date: "2025-11-30", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-11-30", time_slot: "16:30-18:00", event_type: "theory", lecture_number: 7, custom_label: "学科7", status: "scheduled" },
  
  // December 2025
  { date: "2025-12-06", time_slot: "14:50-16:20", event_type: "theory", lecture_number: 6, custom_label: "学科6", status: "scheduled" },
  { date: "2025-12-06", time_slot: "16:30-18:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-12-06", time_slot: "18:30-20:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", symbol: "P", status: "scheduled" },
  { date: "2025-12-07", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-12-07", time_slot: "16:30-18:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", symbol: "P", status: "scheduled" },
  { date: "2025-12-13", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-12-13", time_slot: "16:30-18:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", symbol: "P", status: "scheduled" },
  { date: "2025-12-14", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-12-14", time_slot: "16:30-18:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", symbol: "P", status: "scheduled" },
  { date: "2025-12-20", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", symbol: "P", status: "scheduled" },
  { date: "2025-12-20", time_slot: "16:30-18:00", event_type: "theory", lecture_number: 2, custom_label: "学科2", status: "scheduled" },
  { date: "2025-12-20", time_slot: "18:30-20:00", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-12-27", time_slot: "14:50-16:20", event_type: "driving", custom_label: "AT所内", location: "校内コース", status: "scheduled" },
  { date: "2025-12-27", time_slot: "16:30-18:00", event_type: "test", custom_label: "仮免許試験", symbol: "P", status: "scheduled" },
  { date: "2025-12-27", time_slot: "18:30-20:00", event_type: "test", custom_label: "技能検定", symbol: "P", status: "scheduled" },
  { date: "2025-12-28", time_slot: "14:50-16:20", event_type: "test", custom_label: "修了検定", notes: "1st Stage Completion Test", status: "scheduled" },
  { date: "2025-12-28", time_slot: "16:30-18:00", event_type: "test", custom_label: "技能検定", notes: "Driving Test", status: "scheduled" },
  { date: "2025-12-28", time_slot: "18:30-20:00", event_type: "test", custom_label: "学科試験", notes: "Written Test", status: "scheduled" },
];

interface ScheduleTemplateLoaderProps {
  onLoadComplete?: () => void;
}

export function ScheduleTemplateLoader({ onLoadComplete }: ScheduleTemplateLoaderProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingEventCount, setExistingEventCount] = useState(0);
  const [understood, setUnderstood] = useState(false);

  const checkExistingEvents = async () => {
    if (!user) {
      toast.error("Please sign in to load template");
      return;
    }

    try {
      const [nov, dec] = await Promise.all([
        getMonthSchedule(user.id, 2025, 11),
        getMonthSchedule(user.id, 2025, 12),
      ]);
      const count = nov.length + dec.length;
      setExistingEventCount(count);

      if (count > 0) {
        setShowDuplicateDialog(true);
      } else {
        setShowConfirmDialog(true);
      }
    } catch (error) {
      console.error("Error checking events:", error);
      toast.error("Failed to check existing events");
    }
  };

  const handleLoadTemplate = async (replaceAll = false) => {
    if (!user) return;

    setLoading(true);
    try {
      if (replaceAll) {
        const [nov, dec] = await Promise.all([
          getMonthSchedule(user.id, 2025, 11),
          getMonthSchedule(user.id, 2025, 12),
        ]);
        await Promise.all([...nov, ...dec].map(e => deleteScheduleEvent(e.id)));
      }

      await bulkImportSchedule(user.id, templateScheduleData as any);
      toast.success("✅ Added 38 events to your schedule");
      onLoadComplete?.();
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template schedule");
    } finally {
      setLoading(false);
      setShowDuplicateDialog(false);
      setShowConfirmDialog(false);
      setUnderstood(false);
    }
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-base text-blue-900 dark:text-blue-100 mb-1">
                Use Schedule Template
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Load a customizable driving school schedule template (Nov-Dec 2025) with 38 events. 
                All dates and details can be edited after loading.
              </p>
            </div>
          </div>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100">
              <ChevronDown className="w-4 h-4" />
              How to Use This Template
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  What's Included (38 Events):
                </h4>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>10 Theory Lectures (学科1-10)</li>
                  <li>15 AT Driving Sessions (AT所内)</li>
                  <li>3 Tests (修了検定, 技能検定, 学科試験)</li>
                  <li>Orientation & Aptitude Test</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Step-by-Step Guide:
                </h4>
                <ol className="list-decimal list-inside space-y-1 ml-6">
                  <li>Click "Load Schedule Template" below</li>
                  <li>Review the pre-filled events (Nov-Dec 2025)</li>
                  <li>Tap any event to edit dates, times, or details</li>
                  <li>Mark events complete as you progress</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Tips:
                </h4>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  <li>Template dates are Nov-Dec 2025 but fully customizable</li>
                  <li>Delete unwanted events by tapping → Delete</li>
                  <li>Add custom events using the + button in any cell</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-xs">
              📅 38 Events
            </Badge>
            <Badge variant="outline" className="text-xs">
              📚 Nov-Dec 2025
            </Badge>
          </div>

          <Button
            onClick={checkExistingEvents}
            disabled={loading || !user}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Load Schedule Template
              </>
            )}
          </Button>

          {!user && (
            <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
              Sign in to load template
            </p>
          )}
        </div>
      </Card>

      {/* Duplicate Warning Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Existing Events Found</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You already have <strong>{existingEventCount} events</strong> in your schedule.</p>
              <p>Loading the template will add <strong>38 more events</strong> (total: {existingEventCount + 38}).</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={() => {
              setShowDuplicateDialog(false);
              handleLoadTemplate(true);
            }}>
              Replace All
            </Button>
            <AlertDialogAction onClick={() => {
              setShowDuplicateDialog(false);
              handleLoadTemplate(false);
            }}>
              Add Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>📅 Load Schedule Template</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                <p className="font-semibold mb-1">About to add:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>38 events</li>
                  <li>Date range: Nov 8 - Dec 28, 2025</li>
                  <li>Theory lectures, driving sessions, and tests</li>
                </ul>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <Checkbox 
                  id="understand" 
                  checked={understood}
                  onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                />
                <label 
                  htmlFor="understand" 
                  className="text-sm cursor-pointer leading-tight"
                >
                  I understand these dates are templates and can be edited later
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={!understood}
              onClick={() => handleLoadTemplate(false)}
            >
              Load Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
