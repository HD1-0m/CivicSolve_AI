import React, { useState, useMemo } from "react";
import { Challenge } from "../types";
import { StorageService } from "../services/storage";
import { ApiClient } from "../services/apiClient";
import { ChallengeCard } from "../components/ChallengeCard";
import { InteractiveMap } from "../components/InteractiveMap";
import { useNotifications } from "../context/NotificationContext";
import { 
  Search, 
  Sparkles, 
  LayoutGrid, 
  MapPin, 
  PlusCircle,
  X
} from "lucide-react";

interface ExplorePageProps {
  onNavigate: (tab: string, param?: string) => void;
}

const CATEGORIES = [
  "All",
  "Water & Sanitation",
  "Healthcare & Public Health",
  "Agriculture & Food Security",
  "Clean Energy & Climate",
  "Education & Skill Development",
  "Rural Infrastructure",
  "Urban Mobility & Planning",
  "Waste Management & Circular Economy",
  "Digital Inclusion & Governance",
];

const STATES = [
  "All",
  "Maharashtra",
  "Tamil Nadu",
  "Delhi",
  "Kerala",
  "Odisha",
  "Karnataka",
  "Telangana",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "Bihar",
  "West Bengal",
];

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate }) => {
  const { showToast } = useNotifications();
  const [challenges, setChallenges] = useState<Challenge[]>(() => StorageService.getChallenges());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "support" | "severity">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Natural Language Search state
  const [nlSearching, setNlSearching] = useState(false);
  const [nlExplanation, setNlExplanation] = useState<string | null>(null);

  const refreshChallenges = () => {
    setChallenges(StorageService.getChallenges());
  };

  // AI Natural Language Search trigger
  const handleNaturalSearch = async () => {
    if (!searchQuery.trim()) {
      showToast("Please enter a question or query to search with AI.", "info");
      return;
    }
    setNlSearching(true);
    try {
      const parsed = await ApiClient.parseNaturalSearch(searchQuery);
      setNlExplanation(parsed.explanation);

      if (parsed.category && CATEGORIES.includes(parsed.category)) {
        setSelectedCategory(parsed.category);
      }
      if (parsed.state && STATES.includes(parsed.state)) {
        setSelectedState(parsed.state);
      }
      if (parsed.urgency) {
        setSelectedUrgency(parsed.urgency);
      }
      showToast("Applied Gemini semantic search filters.", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Standard keyword search applied.", "info");
    } finally {
      setNlSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedState("All");
    setSelectedUrgency("All");
    setSelectedStatus("All");
    setNlExplanation(null);
  };

  // Filtered and sorted challenges
  const filteredChallenges = useMemo(() => {
    return (challenges || [])
      .filter((c) => {
        if (!c) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (c.title || "").toLowerCase().includes(q);
          const matchDesc = (c.description || "").toLowerCase().includes(q);
          const matchCat = (c.category || "").toLowerCase().includes(q);
          const matchState = (c.location?.state || "").toLowerCase().includes(q);
          const matchDistrict = (c.location?.district || "").toLowerCase().includes(q);
          const matchKeywords = (c.aiAnalysis?.keywords || []).some((k) => (k || "").toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCat && !matchState && !matchDistrict && !matchKeywords) {
            return false;
          }
        }

        if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
        if (selectedState !== "All" && c.location?.state !== selectedState) return false;
        if (selectedUrgency !== "All" && c.urgency !== selectedUrgency) return false;
        if (selectedStatus !== "All" && c.status !== selectedStatus) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "support") return (b?.supportCount || 0) - (a?.supportCount || 0);
        if (sortBy === "severity") return (b?.aiAnalysis?.severity || 0) - (a?.aiAnalysis?.severity || 0);
        return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
      });
  }, [challenges, searchQuery, selectedCategory, selectedState, selectedUrgency, selectedStatus, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar */}
      <div className="border-b editorial-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-800 mb-2">
            Central Challenge Dossier
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1A1A1A] tracking-tight">
            Societal Challenges Registry
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 font-normal">
            Crowdsourced community priorities seeking academic co-design and catalytic corporate sponsorship.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-white border editorial-border p-1 rounded-sm flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-xs font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 transition ${
                viewMode === "grid" ? "accent-bg text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Registry Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-xs font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 transition ${
                viewMode === "map" ? "accent-bg text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Impact Map
            </button>
          </div>

          <button
            onClick={() => onNavigate("submit")}
            className="accent-bg text-white px-4 py-2 font-bold uppercase tracking-wider text-xs rounded-sm shadow-2xs flex items-center gap-1.5 hover:bg-[#122828] transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
            Submit
          </button>
        </div>
      </div>

      {/* Search & Query Bar */}
      <div className="bg-white border editorial-border rounded-sm p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNaturalSearch()}
              placeholder="Search by keywords, geographic district, or query: 'e.g. clean drinking water in Maharashtra'..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border editorial-border rounded-sm text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-500 font-sans"
            />
          </div>

          <button
            onClick={handleNaturalSearch}
            disabled={nlSearching}
            className="accent-bg text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#122828] transition shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            {nlSearching ? "Analyzing..." : "Gemini Search"}
          </button>
        </div>

        {/* AI Explanation Banner */}
        {nlExplanation && (
          <div className="ai-gradient border border-emerald-200/80 rounded-sm p-3.5 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-serif italic font-bold text-emerald-950">Gemini Semantic Interpretation: </span>
                <span className="text-stone-700 font-sans">{nlExplanation}</span>
              </div>
            </div>
            <button onClick={() => setNlExplanation(null)} className="text-stone-400 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t editorial-border text-xs">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Sector Domain
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50 border editorial-border rounded-sm py-1.5 px-2 text-xs text-stone-800 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              State / Territory
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-stone-50 border editorial-border rounded-sm py-1.5 px-2 text-xs text-stone-800 focus:outline-none"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Field Urgency
            </label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full bg-stone-50 border editorial-border rounded-sm py-1.5 px-2 text-xs text-stone-800 focus:outline-none"
            >
              <option value="All">All Urgencies</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
              Sort Criteria
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-stone-50 border editorial-border rounded-sm py-1.5 px-2 text-xs text-stone-800 focus:outline-none"
            >
              <option value="newest">Most Recent</option>
              <option value="severity">AI Severity (High to Low)</option>
              <option value="support">Community Endorsements</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full py-1.5 px-3 border editorial-border bg-white text-stone-600 hover:text-stone-900 rounded-sm text-xs font-mono uppercase tracking-wider transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Results Body */}
      {viewMode === "grid" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 uppercase tracking-wider">
            <span>Showing {filteredChallenges.length} Documented Challenges</span>
            <span>Live Archive</span>
          </div>

          {filteredChallenges.length === 0 ? (
            <div className="bg-white border editorial-border rounded-sm p-12 text-center space-y-3">
              <h3 className="font-serif text-xl text-stone-800">No matching challenges found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No entries matched your current criteria. Try resetting filters or using a broader query.
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 accent-bg text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((ch) => (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                  onSelect={(id) => onNavigate("challenge-detail", id)}
                  onUpdate={refreshChallenges}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 uppercase tracking-wider">
            <span>Geographic Distribution Map</span>
            <span>Pins: {filteredChallenges.length}</span>
          </div>
          <InteractiveMap
            challenges={filteredChallenges}
            onSelectChallenge={(id) => onNavigate("challenge-detail", id)}
          />
        </div>
      )}
    </div>
  );
};
