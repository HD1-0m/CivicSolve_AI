import React, { useState } from "react";
import { Challenge, Project, Solution, Report } from "../types";
import { useAuth } from "../context/AuthContext";
import { StorageService } from "../services/storage";
import { useNotifications } from "../context/NotificationContext";
import { 
  Users, 
  FolderKanban, 
  Lightbulb, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Heart, 
  Bookmark, 
  Building2, 
  GraduationCap, 
  PlusCircle, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, switchPersona, personaList, availableSeedUsers, loginAs } = useAuth();
  const { showToast } = useNotifications();

  const [challenges, setChallenges] = useState<Challenge[]>(() => StorageService.getChallenges() || []);
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects() || []);
  const [solutions, setSolutions] = useState<Solution[]>(() => StorageService.getSolutions() || []);
  const [reports, setReports] = useState<Report[]>(() => StorageService.getReports() || []);

  const userRole = user?.role || "citizen";
  const effectivePersonaList = personaList || availableSeedUsers || [];
  const onSwitch = switchPersona || loginAs;

  // Filtered lists for the active user
  const mySubmittedChallenges = (challenges || []).filter((c) => c.createdBy === user?.id);
  const mySupportedChallenges = (challenges || []).filter((c) => user && c.supporters?.includes(user.id));
  const mySavedChallenges = (challenges || []).filter((c) => user && c.savedBy?.includes(user.id));
  const mySolutions = (solutions || []).filter((s) => s.authorId === user?.id);
  const myProjects = (projects || []).filter((p) => p.members?.some((m) => m.name === user?.name || m.role === user?.role));

  // Admin moderation handler
  const handleResolveReport = (reportId: string, status: 'resolved' | 'dismissed') => {
    StorageService.resolveReport(reportId, status);
    setReports(StorageService.getReports() || []);
    showToast(`Report marked as ${status}.`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Persona Switcher */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Role: {user?.role.toUpperCase()}
            </span>
            <span className="text-xs text-stone-400 font-medium">Logged in via CivicSolve Auth</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {user?.organization ? `${user.organization} • ` : ""}
            {userRole === "admin" ? "Community Oversight & Council Moderation Deck" :
             userRole === "university_faculty" ? "Academic Co-Design & Lab Research Center" :
             userRole === "industry_partner" ? "Corporate Social Responsibility (CSR) Portfolio" :
             userRole === "student_researcher" ? "Student Innovation & Prototyping Hub" :
             "Grassroots Societal Challenges Tracker"}
          </p>
        </div>

        {/* Quick Role Switcher */}
        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-2">
          <span className="font-bold text-stone-700 block">Switch Active Perspective:</span>
          <div className="flex flex-wrap gap-1.5">
            {(effectivePersonaList || []).map((p) => (
              <button
                key={p.id}
                onClick={() => onSwitch(p.id)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition ${
                  user?.id === p.id 
                    ? "bg-stone-900 text-white font-bold" 
                    : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
                }`}
              >
                {p.name?.split(" ")[0]} ({p.role?.slice(0, 7)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ADMIN DECK (IF ROLE === ADMIN) */}
      {userRole === "admin" && (
        <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Council Moderation Queue ({reports.filter(r => r.status === "pending").length} Pending)</span>
            </div>
            <span className="text-xs text-rose-700 font-medium">Council Review Privilege</span>
          </div>

          <p className="text-xs text-rose-800">
            CivicSolve Community Trust safeguards: Review reported spam, harassment, or inaccurate problem declarations.
          </p>

          <div className="space-y-3 pt-2">
            {(reports || []).length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-rose-200 text-center text-xs text-stone-500">
                No active moderation flags. The platform is healthy.
              </div>
            ) : (
              (reports || []).map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-xl border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                        {r.reason.replace("_", " ")}
                      </span>
                      <span className="text-stone-500 font-medium">Target: {r.targetType} {r.targetTitle ? `"${r.targetTitle}"` : ""}</span>
                    </div>
                    <p className="text-stone-700">{r.description}</p>
                    <div className="text-[10px] text-stone-400">Reported by: {r.reporterName} • Status: {r.status}</div>
                  </div>

                  {r.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(r.id, "dismissed")}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, "resolved")}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold"
                      >
                        Take Down & Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUICK STATS METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 space-y-1 shadow-2xs">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Submitted Challenges</div>
          <div className="text-2xl font-extrabold text-stone-900">{mySubmittedChallenges.length}</div>
          <div className="text-[11px] text-stone-500">Problems crowdsourced by you</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 space-y-1 shadow-2xs">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Workspaces</div>
          <div className="text-2xl font-extrabold text-indigo-700">{myProjects.length}</div>
          <div className="text-[11px] text-stone-500">Collaborative co-design projects</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 space-y-1 shadow-2xs">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Solutions Proposed</div>
          <div className="text-2xl font-extrabold text-emerald-700">{mySolutions.length}</div>
          <div className="text-[11px] text-stone-500">Evaluated solutions on platform</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 space-y-1 shadow-2xs">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Saved Bookmarks</div>
          <div className="text-2xl font-extrabold text-amber-700">{mySavedChallenges.length}</div>
          <div className="text-[11px] text-stone-500">Challenges tracked for reference</div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Challenges & Solutions (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Submitted Challenges */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-base">Your Submitted Challenges</h3>
              <button
                onClick={() => onNavigate("submit")}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Submit New
              </button>
            </div>

            {(mySubmittedChallenges || []).length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-400">
                You have not submitted any challenges yet. Use the Submit button to log a ground-reality issue.
              </div>
            ) : (
              <div className="space-y-3">
                {(mySubmittedChallenges || []).map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => onNavigate("challenge-detail", ch.id)}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-bold text-stone-900 group-hover:text-emerald-700">{ch.title}</div>
                      <div className="text-stone-500 text-[11px]">{ch.location?.district || "India"}, {ch.location?.state || ""} • {ch.supportCount || 0} supporters</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked / Supported Challenges */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-stone-900 text-base">Supported & Bookmarked Challenges</h3>
            {(mySupportedChallenges || []).length === 0 && (mySavedChallenges || []).length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-400">
                You have not supported or saved challenges yet. Explore challenges to follow updates.
              </div>
            ) : (
              <div className="space-y-2">
                {(mySupportedChallenges || []).map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => onNavigate("challenge-detail", ch.id)}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                      <span className="font-semibold text-stone-800 truncate">{ch.title}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium shrink-0">{ch.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Projects & Tools (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Workspaces */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              Active Project Workspaces
            </h3>

            <div className="space-y-3">
              {(myProjects || []).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate("workspace", p.id)}
                  className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 transition cursor-pointer text-xs space-y-1.5"
                >
                  <div className="font-bold text-stone-900">{p.title}</div>
                  <div className="text-[11px] text-stone-600">Stage: {p.stage || "Active"} • {p.tasks?.length || 0} tasks</div>
                  <div className="text-[10px] text-indigo-700 font-semibold flex items-center gap-1">
                    Open Workspace <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Persona guidance callout */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-xs space-y-2">
            <span className="font-bold text-stone-800">Persona Role Simulation</span>
            <p className="text-stone-600 leading-relaxed">
              CivicSolve allows seamlessly switching roles between Grassroots Citizens, IIT Faculty, CSR Sponsors, and Council Admins to inspect the full co-design lifecycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
