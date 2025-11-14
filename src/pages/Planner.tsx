import { DrivingScheduleGrid } from "@/components/DrivingScheduleGrid";
import BottomNav from "@/components/BottomNav";
import { useSearchParams, Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Planner = () => {
  const [searchParams] = useSearchParams();
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Schedule</h1>
          <Link to={`/study?tab=calendar${month ? `&month=${month}` : ''}${year ? `&year=${year}` : ''}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar View</span>
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="px-5 py-6">
        <DrivingScheduleGrid initialMonth={month ? parseInt(month) : undefined} initialYear={year ? parseInt(year) : undefined} />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Planner;
