import { DrivingScheduleGrid } from "@/components/DrivingScheduleGrid";
import BottomNav from "@/components/BottomNav";

const Planner = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-lg font-bold">Schedule</h1>
        </div>
      </header>
      
      <main className="px-5 py-6">
        <DrivingScheduleGrid />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Planner;
