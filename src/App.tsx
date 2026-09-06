import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { LandingPage } from "./pages/LandingPage";
import { ExplorePage } from "./pages/ExplorePage";
import { SubmitChallengePage } from "./pages/SubmitChallengePage";
import { ChallengeDetailPage } from "./pages/ChallengeDetailPage";
import { ProjectWorkspacePage } from "./pages/ProjectWorkspacePage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { InteractiveMap } from "./components/InteractiveMap";
import { StorageService } from "./services/storage";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContainer: React.FC = () => {
  const { toast, dismissToast } = useNotifications();
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs max-w-sm ${
        toast.type === "success" ? "bg-emerald-900 text-white border-emerald-800" :
        toast.type === "error" ? "bg-rose-900 text-white border-rose-800" :
        "bg-stone-900 text-white border-stone-800"
      }`}>
        {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
        {toast.type === "info" && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
        <p className="leading-snug flex-1 font-medium">{toast.message}</p>
        <button onClick={dismissToast} className="text-stone-400 hover:text-white p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  useEffect(() => {
    StorageService.initCloudSync().then((res) => {
      if (res.isOnline) {
        console.log(`[CivicSolve Cloud] Connected to Firestore (${res.challengesSynced} items synced)`);
      }
    });
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setRouteParam(param);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-[#1A1A1A] selection:bg-emerald-100 selection:text-[#1A3636]">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />

      {/* Main Routed Content View */}
      <main className="flex-1">
        {currentTab === "home" && <LandingPage onNavigate={handleNavigate} />}
        {currentTab === "explore" && <ExplorePage onNavigate={handleNavigate} />}
        {currentTab === "submit" && <SubmitChallengePage onNavigate={handleNavigate} />}
        {currentTab === "dashboard" && <DashboardPage onNavigate={handleNavigate} />}
        {currentTab === "analytics" && <AnalyticsPage onNavigate={handleNavigate} />}
        {currentTab === "organizations" && <OrganizationsPage onNavigate={handleNavigate} />}
        {currentTab === "workspace" && (
          <ProjectWorkspacePage
            projectId={routeParam || "proj-301"}
            onNavigate={handleNavigate}
          />
        )}
        {currentTab === "challenge-detail" && routeParam && (
          <ChallengeDetailPage
            challengeId={routeParam}
            onNavigate={handleNavigate}
          />
        )}
        {currentTab === "map" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                Societal Challenges Geographic Map
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Explore crowdsourced community issues by state, district, and field priority coordinates.
              </p>
            </div>
            <InteractiveMap
              challenges={StorageService.getChallenges()}
              onSelectChallenge={(id) => handleNavigate("challenge-detail", id)}
            />
          </div>
        )}
      </main>

      {/* In-App Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Active Toast Notification */}
      <ToastContainer />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
