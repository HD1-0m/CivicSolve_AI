import React from "react";
import { StorageService } from "../services/storage";
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  PlusCircle, 
  GraduationCap, 
  Building2, 
  HeartHandshake, 
  CheckCircle2, 
  Cpu, 
  Users, 
  Droplet, 
  Wheat, 
  HeartPulse, 
  Sun, 
  BookOpen,
  MapPin
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const stats = StorageService.getPlatformStats();
  const challenges = StorageService.getChallenges() || [];
  const featured = challenges[0] || {
    id: "ch-101",
    title: "Urban Heat Island Mitigation & Reflective Cooling in High-Density Informal Settlements",
    description: "Implementing scalable vertical gardens and reflective cooling systems in high-density informal settlements to reduce ambient surface temperatures.",
    category: "Clean Energy & Climate",
    location: { district: "Mumbai", state: "Maharashtra" },
    supportCount: 342,
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. EDITORIAL HERO & AI ANALYSIS GRID (Matches Design HTML) */}
      <section className="border-b editorial-border bg-[#FDFCF9]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Hero Headline & Featured Challenge */}
            <div className="lg:col-span-7 lg:border-r editorial-border p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div className="mb-10 sm:mb-12">
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-800 mb-4">
                  Societal Impact Platform
                </p>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tighter text-[#1A1A1A] mb-6">
                  Turn Real <span className="italic text-stone-400">Problems</span> Into Real Solutions.
                </h1>
                <p className="text-base sm:text-lg text-stone-600 max-w-lg leading-relaxed font-normal">
                  Connecting communities, universities, and industry to solve urgent societal challenges through AI-assisted collaboration and verified field execution.
                </p>

                {/* Hero CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigate("submit")}
                    className="accent-bg text-white px-6 py-3.5 font-bold uppercase tracking-widest text-xs rounded-sm shadow-sm transition flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-300" />
                    Submit Challenge
                  </button>
                  <button
                    onClick={() => onNavigate("explore")}
                    className="bg-white border editorial-border text-[#1A1A1A] px-6 py-3.5 font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-stone-50 transition flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-stone-500" />
                    Explore Registry
                  </button>
                  <button
                    onClick={() => onNavigate("map")}
                    className="bg-stone-100 text-stone-800 px-5 py-3.5 font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-stone-200 transition flex items-center gap-1.5"
                  >
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Map
                  </button>
                </div>
              </div>

              {/* Featured Challenge Card (Broadsheet Style) */}
              <div 
                onClick={() => onNavigate("challenge-detail", featured.id)}
                className="mt-6 border editorial-border rounded-sm p-6 sm:p-8 bg-white shadow-2xs hover:shadow-sm transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
                    Featured Challenge
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    Ref: #CS-2026-089
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 mb-3 hover:text-emerald-800 transition">
                  {featured.title}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mb-6 line-clamp-2 leading-relaxed">
                  {featured.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t editorial-border">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-600">IB</div>
                      <div className="w-7 h-7 rounded-full bg-stone-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-700">TG</div>
                      <div className="w-7 h-7 rounded-full bg-emerald-800 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">+14</div>
                    </div>
                    <span className="text-xs text-stone-500">
                      Supported by <strong className="text-stone-800 font-medium">IIT Bombay</strong> & <strong className="text-stone-800 font-medium">Tata Group</strong>
                    </span>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    View Dossier <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: AI Analysis Layer & Stats */}
            <div className="lg:col-span-5 flex flex-col bg-[#F9FAFB]">
              {/* AI Service Layer Interface */}
              <div className="p-6 sm:p-8 lg:p-10 border-b editorial-border ai-gradient">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-900">
                    Gemini AI Service Layer
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/90 backdrop-blur p-5 border border-emerald-200/80 rounded-sm shadow-2xs">
                    <p className="text-xs font-serif italic mb-1.5 text-emerald-900 font-semibold">
                      Contextual Field Insight:
                    </p>
                    <p className="text-xs sm:text-sm leading-relaxed text-stone-700">
                      "I have indexed <strong className="font-bold text-stone-900">3 similar water filtration challenges</strong> across the Ahmednagar & Solapur agricultural belt. Merging university testing protocols could increase catalytic CSR co-funding by 48%."
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white border editorial-border rounded-sm shadow-2xs">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                        SDG Alignment
                      </p>
                      <p className="text-xs sm:text-sm font-serif font-bold text-stone-800">
                        Goal 6 & 11: Clean Water
                      </p>
                    </div>
                    <div className="p-3.5 bg-white border editorial-border rounded-sm shadow-2xs">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1">
                        Severity Score
                      </p>
                      <p className="text-xs sm:text-sm font-serif font-bold text-stone-800">
                        8.8 / 10 (Critical)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section with Editorial Dividers */}
              <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <div className="space-y-6">
                  <div>
                    <span className="text-4xl sm:text-5xl font-serif font-bold block text-stone-900">
                      {stats.challengesSubmitted}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400">
                      Societal Challenges Logged
                    </span>
                  </div>

                  <div className="h-[1px] w-full bg-stone-200"></div>

                  <div>
                    <span className="text-4xl sm:text-5xl font-serif font-bold block text-stone-900">
                      {stats.organizationsConnected}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400">
                      Partner Universities & Labs
                    </span>
                  </div>

                  <div className="h-[1px] w-full bg-stone-200"></div>

                  <div>
                    <span className="text-4xl sm:text-5xl font-serif font-bold block text-stone-900">
                      ₹18.4M+
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400">
                      CSR & Research Capital Mobilized
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("submit")}
                  className="mt-8 sm:mt-10 w-full accent-bg text-white py-4 font-bold uppercase tracking-widest text-xs rounded-sm shadow-sm transition hover:bg-[#122828]"
                >
                  Submit a Community Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS: THE 4-STEP EDITORIAL ENGINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-12 border-b editorial-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-800 mb-2">
              Collaborative Methodology
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 tracking-tight">
              Bridging the Valley from Problem to Verified Solution
            </h2>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-stone-400 shrink-0">
            Four-Stage Framework
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 border editorial-border rounded-sm shadow-2xs space-y-3">
            <span className="font-serif text-3xl font-bold text-stone-300 block">
              01
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Grassroots Crowdsourcing
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Panchayats, citizens, and field NGOs submit real problems with geocodes, photos, and affected community numbers.
            </p>
          </div>

          <div className="bg-white p-6 border editorial-border rounded-sm shadow-2xs space-y-3">
            <span className="font-serif text-3xl font-bold text-emerald-800 block">
              02
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Gemini AI Structuring
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              AI maps root causes, detects duplicate issues to pool resources, aligns UN SDGs, and matches research labs.
            </p>
          </div>

          <div className="bg-white p-6 border editorial-border rounded-sm shadow-2xs space-y-3">
            <span className="font-serif text-3xl font-bold text-stone-300 block">
              03
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              University & Industry Co-Design
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Faculty labs and student researchers prototype hardware and software. Corporate CSR allocates milestone grants.
            </p>
          </div>

          <div className="bg-white p-6 border editorial-border rounded-sm shadow-2xs space-y-3">
            <span className="font-serif text-3xl font-bold text-stone-300 block">
              04
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Transparent Field Rollout
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Shared Kanban execution workspaces, milestone tracking, and Gemini project assistants verify public outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SOCIETAL CHALLENGE DOMAINS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F9FAFB] border editorial-border p-8 rounded-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b editorial-border pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-800 mb-1">
                Priority Sectors
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-stone-900">
                Societal Focus Domains
              </h2>
            </div>
            <button
              onClick={() => onNavigate("explore")}
              className="text-xs font-bold uppercase tracking-widest text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5"
            >
              Browse All Domains <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Water & Sanitation", icon: Droplet, count: "14 Challenges" },
              { label: "Agriculture & Food", icon: Wheat, count: "18 Challenges" },
              { label: "Public Health", icon: HeartPulse, count: "11 Challenges" },
              { label: "Clean Energy", icon: Sun, count: "9 Challenges" },
              { label: "Vernacular EdTech", icon: BookOpen, count: "8 Challenges" },
              { label: "Rural Infrastructure", icon: Building2, count: "12 Challenges" },
            ].map((sector) => {
              const Icon = sector.icon;
              return (
                <div
                  key={sector.label}
                  onClick={() => onNavigate("explore")}
                  className="bg-white p-4 border editorial-border rounded-sm hover:border-stone-400 hover:shadow-2xs transition cursor-pointer text-center space-y-2 group"
                >
                  <div className="w-10 h-10 mx-auto rounded-sm bg-stone-50 border editorial-border flex items-center justify-center text-stone-700 group-hover:bg-[#1A3636] group-hover:text-white transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-stone-900">{sector.label}</div>
                  <div className="text-[10px] font-mono text-stone-400">{sector.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED CHALLENGES IN BROADSHEET GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 border-b editorial-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-800 mb-1">
              Live Registry
            </p>
            <h2 className="font-serif text-3xl text-stone-900">
              Urgent Community Challenges Awaiting Co-Design
            </h2>
          </div>
          <button
            onClick={() => onNavigate("explore")}
            className="text-xs font-bold uppercase tracking-widest text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5"
          >
            Full Registry ({stats.challengesSubmitted}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(challenges || []).slice(0, 3).map((ch) => (
            <div
              key={ch.id}
              onClick={() => onNavigate("challenge-detail", ch.id)}
              className="bg-white border editorial-border rounded-sm p-6 flex flex-col justify-between hover:shadow-sm transition cursor-pointer space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    {ch.category}
                  </span>
                  <span className="text-stone-400 uppercase">
                    {ch.location?.state || "India"}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-stone-900 leading-snug hover:text-emerald-800 transition">
                  {ch.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {ch.description}
                </p>
              </div>

              <div className="pt-4 border-t editorial-border flex items-center justify-between text-xs text-stone-500">
                <span className="font-mono text-[11px]">{ch.supportCount || 0} community endorsements</span>
                <span className="font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1">
                  Examine <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ACADEMIC & CORPORATE PARTNERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border editorial-border rounded-sm p-8 bg-white text-center">
          <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-6">
            Partner Institutions & Research Networks
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-stone-800 font-serif font-bold text-base sm:text-lg">
            <span>IIT Bombay (CTARA)</span>
            <span className="text-stone-300 font-sans font-normal">•</span>
            <span>Tata Sustainability Group</span>
            <span className="text-stone-300 font-sans font-normal">•</span>
            <span>National Institute of Hydrology</span>
            <span className="text-stone-300 font-sans font-normal">•</span>
            <span>Jal Seva Rural Trust</span>
            <span className="text-stone-300 font-sans font-normal">•</span>
            <span>Anna University Rural Tech Hub</span>
          </div>
        </div>
      </section>
    </div>
  );
};
