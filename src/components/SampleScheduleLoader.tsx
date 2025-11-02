import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { bulkImportSchedule } from "@/lib/supabase/drivingSchedule";
import { toast } from "sonner";

// Sample schedule data based on uploaded images
const sampleScheduleData = [
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

export function SampleScheduleLoader() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLoadSample = async () => {
    if (!user) {
      toast.error("Please sign in to load sample schedule");
      return;
    }

    setLoading(true);
    try {
      await bulkImportSchedule(user.id, sampleScheduleData as any);
      toast.success("Sample schedule loaded! Refresh the page to see events.");
    } catch (error) {
      console.error("Error loading sample:", error);
      toast.error("Failed to load sample schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-sm text-purple-900 mb-1">
            Try Sample Schedule
          </h3>
          <p className="text-xs text-purple-700 mb-3">
            Load a complete driving school schedule (Nov-Dec 2025) based on real data. 
            Includes 26 theory lectures, AT driving sessions, and completion tests.
          </p>
          <Button
            size="sm"
            onClick={handleLoadSample}
            disabled={loading || !user}
            className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Load Sample Schedule
              </>
            )}
          </Button>
          {!user && (
            <p className="text-xs text-purple-600 mt-2">
              Sign in to load sample data
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
