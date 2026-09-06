import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { UserRole } from "../types";
import { 
  Bell, 
  ChevronDown, 
  Menu, 
  X,
  Compass,
  PlusCircle,
  MapPin,
  FolderKanban,
  LayoutDashboard,
  Building2,
  BarChart3,
  Sparkles
} from "lucide-react";

interface NavbarProps {
  currentTab?: string;
  setCurrentTab?: (tab: string) => void;
  onNavigate?: (tab: string, param?: string) => void;
  onOpenNotifications: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: "Citizen Reporter",
  student: "Student Researcher",
  university: "University Faculty",
  industry: "Industry CSR Lead",
  ngo: "Grassroots NGO",
  expert: "Domain Expert",
  admin: "Platform Moderator",
};

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab = "home", 
  setCurrentTab, 
  onNavigate, 
  onOpenNotifications 
}) => {
  const { user, role, loginAs, availableSeedUsers } = useAuth();
  const { unreadCount } = useNotifications();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (tab: string) => {
    if (onNavigate) onNavigate(tab);
    else if (setCurrentTab) setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF9]/95 backdrop-blur border-b editorial-border">
      {/* Top Editorial micro-ticker */}
      <div className="accent-bg text-emerald-100 text-[10px] sm:text-[11px] py-1.5 px-4 font-mono tracking-widest uppercase flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Statement 43: Societal Challenges & University-Industry Innovation</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-emerald-200">
          <span>Gemini AI Service Layer: Active</span>
          <span>•</span>
          <span>Regional Hub: Maharashtra Node</span>
        </div>
      </div>

      {/* Main Editorial Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Left: Brand & Editorial Separator */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigateTo("home")} 
            className="text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-sm accent-bg flex items-center justify-center text-white shadow-2xs group-hover:bg-[#122828] transition">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
              CivicSolve <span className="text-emerald-800 italic font-serif font-normal">AI</span>
            </span>
          </button>

          <div className="hidden lg:block h-6 w-[1px] bg-stone-300"></div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest text-stone-600">
            <button
              onClick={() => navigateTo("explore")}
              className={`py-1 transition hover:text-[#1A1A1A] ${
                currentTab === "explore" ? "text-[#1A3636] border-b-2 border-[#1A3636] font-bold" : ""
              }`}
            >
              Challenges
            </button>
            <button
              onClick={() => navigateTo("submit")}
              className={`py-1 transition hover:text-[#1A1A1A] flex items-center gap-1 ${
                currentTab === "submit" ? "text-[#1A3636] border-b-2 border-[#1A3636] font-bold" : ""
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
              Submit
            </button>
            <button
              onClick={() => navigateTo("map")}
              className={`py-1 transition hover:text-[#1A1A1A] ${
                currentTab === "map" ? "text-[#1A3636] border-b-2 border-[#1A3636] font-bold" : ""
              }`}
            >
              Map
            </button>
            <button
              onClick={() => navigateTo("organizations")}
              className={`py-1 transition hover:text-[#1A1A1A] ${
                currentTab === "organizations" ? "text-[#1A3636] border-b-2 border-[#1A3636] font-bold" : ""
              }`}
            >
              Partners
            </button>
            <button
              onClick={() => navigateTo("workspace")}
              className={`py-1 transition hover:text-[#1A1A1A] ${
                currentTab === "workspace" ? "text-[#1A3636] border-b-2 border-[#1A3636] font-bold" : ""
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => navigateTo("analytics")}
              className={`py-1 transition hover:text-[#1A1A1A] ${
                currentTab === "analytics" ? "text-[#1A3636] border-b-2 border-[#1A3636] font-bold" : ""
              }`}
            >
              Impact
            </button>
            <button
              onClick={() => navigateTo("dashboard")}
              className={`py-1 transition hover:text-[#1A1A1A] ${
                currentTab === "dashboard" ? "text-[#1A3636] border-b-2 border-[#1A3636] font-bold" : ""
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>

        {/* Right: Persona Switcher, Notifications & User */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Active Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm border editorial-border bg-white text-xs hover:bg-stone-50 transition shadow-2xs"
              title="Switch role persona"
            >
              <div className="text-left hidden sm:block">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block leading-none">Role</span>
                <span className="font-serif font-medium text-stone-900 text-xs">{ROLE_LABELS[role]}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border editorial-border rounded shadow-lg p-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-stone-400 border-b editorial-border mb-1">
                  Simulate Stakeholder Persona
                </div>
                {(availableSeedUsers || []).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      loginAs(u.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition ${
                      user?.id === u.id ? "bg-stone-100 font-bold" : "hover:bg-stone-50"
                    }`}
                  >
                    <div>
                      <div className="font-serif text-stone-900 font-semibold">{u.name}</div>
                      <div className="text-[11px] text-stone-500">{u.organization || ROLE_LABELS[u.role]}</div>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-stone-600 hover:text-stone-900 rounded border editorial-border bg-white hover:bg-stone-50 transition shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-700 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Editorial Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l editorial-border">
            <span className="hidden md:inline font-serif italic text-xs text-stone-700 max-w-[130px] truncate">
              {user?.name || "Active User"}
            </span>
            <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 overflow-hidden flex items-center justify-center font-bold text-xs text-stone-600 font-mono shadow-2xs">
              {initials}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t editorial-border bg-[#FDFCF9] px-4 py-4 space-y-2 text-xs font-semibold uppercase tracking-widest">
          <button
            onClick={() => navigateTo("explore")}
            className="w-full text-left py-2 px-3 hover:bg-stone-100 rounded"
          >
            Challenges
          </button>
          <button
            onClick={() => navigateTo("submit")}
            className="w-full text-left py-2 px-3 hover:bg-stone-100 rounded text-emerald-800"
          >
            + Submit Challenge
          </button>
          <button
            onClick={() => navigateTo("map")}
            className="w-full text-left py-2 px-3 hover:bg-stone-100 rounded"
          >
            Impact Map
          </button>
          <button
            onClick={() => navigateTo("organizations")}
            className="w-full text-left py-2 px-3 hover:bg-stone-100 rounded"
          >
            Partners Directory
          </button>
          <button
            onClick={() => navigateTo("workspace")}
            className="w-full text-left py-2 px-3 hover:bg-stone-100 rounded"
          >
            Execution Workspaces
          </button>
          <button
            onClick={() => navigateTo("analytics")}
            className="w-full text-left py-2 px-3 hover:bg-stone-100 rounded"
          >
            Impact Telemetry
          </button>
          <button
            onClick={() => navigateTo("dashboard")}
            className="w-full text-left py-2 px-3 hover:bg-stone-100 rounded"
          >
            Dashboard
          </button>
        </div>
      )}
    </header>
  );
};
