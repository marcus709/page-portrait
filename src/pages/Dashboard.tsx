import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { StoryProvider } from "@/contexts/StoryContext";

type View = "story" | "characters" | "plot" | "flow" | "ideas";

function DashboardContent() {
  const [currentView, setCurrentView] = useState<View>("story");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardSidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="ml-64 pt-16">
        <DashboardContent currentView={currentView} />
      </div>
    </div>
  );
}

export const Dashboard = () => {
  return (
    <StoryProvider>
      <DashboardContent />
    </StoryProvider>
  );
};

export default Dashboard;