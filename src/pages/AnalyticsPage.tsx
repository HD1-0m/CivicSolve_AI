import React, { useState } from "react";
import { StorageService } from "../services/storage";
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  GraduationCap, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Award,
  Users,
  Droplet,
  HeartPulse,
  Sun,
  Wheat,
  BookOpen,
  ArrowUpRight
} from "lucide-react";

interface AnalyticsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const stats = StorageService.getPlatformStats();
  const [activeMetric, setActiveMetric] = useState<"quarterly" | "monthly">("quarterly");

  // Sector distribution data
  const sectorData = [
    { name: "Water & Sanitation", count: 18, pct: 32, color: "bg-sky-500", text: "text-sky-700" },
    { name: "Agriculture & Cold Chain", count: 14, pct: 25, color: "bg-emerald-500", text: "text-emerald-700" },
    { name: "Healthcare & Public Health", count: 10, pct: 18, color: "bg-rose-500", text: "text-rose-700" },
    { name: "Clean Energy & Solar", count: 8, pct: 14, color: "bg-amber-500", text: "text-amber-700" },
    { name: "Rural Infra & Education", count: 6, pct: 11, color: "bg-indigo-500", text: "text-indigo-700" },
  ];

  // University participation leaderboard
  const universityRankings = [
    { name: "IIT Bombay (CTARA)", solutions: 12, pilots: 4, funding: "₹24.5L", rating: 96 },
    { name: "Anna University Chennai", solutions: 9, pilots: 3, funding: "₹18.0L", rating: 92 },
    { name: "National Institute of Technology Trichy", solutions: 8, pilots: 2, funding: "₹14.2L", rating: 89 },
    { name: "Vellore Institute of Technology (VIT)", solutions: 6, pilots: 2, funding: "₹11.0L", rating: 87 },
    { name: "College of Engineering Pune (COEP)", solutions: 5, pilots: 1, funding: "₹9.5L", rating: 85 },
  ];

  // Industry CSR Impact Leaders
  const csrSponsors = [
    { name: "Tata Sustainability Group", sector: "Clean Water & Climate", deployed: "₹18.5 Lakhs", pilots: 3 },
    { name: "Infosys Foundation", sector: "Vernacular EdTech & Labs", deployed: "₹14.0 Lakhs", pilots: 2 },
    { name: "Mahindra & Mahindra CSR", sector: "Rural Solar Ag-Tech", deployed: "₹12.0 Lakhs", pilots: 2 },
    { name: "ITC Rural Development Trust", sector: "Soil & Watershed", deployed: "₹9.5 Lakhs", pilots: 1 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-World Societal Impact Dashboard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Impact Telemetry & Platform Analytics
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Measurable outcomes from crowdsourced problem ingestion to active field deployment and verified community benefit.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Logged</span>
          <div className="font-mono font-extrabold text-2xl text-stone-900">{stats.challengesSubmitted}</div>
          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
            +18% this quarter
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Under Co-Design</span>
          <div className="font-mono font-extrabold text-2xl text-indigo-700">{stats.activeChallenges}</div>
          <span className="text-[10px] text-stone-500">Active university labs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Solutions Evaluated</span>
          <div className="font-mono font-extrabold text-2xl text-emerald-700">{stats.solutionsProposed}</div>
          <span className="text-[10px] text-stone-500">AI 7-dim scored</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Field Pilots Deployed</span>
          <div className="font-mono font-extrabold text-2xl text-rose-700">{stats.problemsSolved}</div>
          <span className="text-[10px] text-rose-600 font-semibold">18,500 beneficiaries</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Avg Time to Pilot</span>
          <div className="font-mono font-extrabold text-2xl text-amber-700">68 Days</div>
          <span className="text-[10px] text-stone-500">42% faster than baseline</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">CSR Capital Pooled</span>
          <div className="font-mono font-extrabold text-2xl text-stone-900">₹54.0L</div>
          <span className="text-[10px] text-emerald-700 font-semibold">100% disbursed to labs</span>
        </div>
      </div>

      {/* Main Visuals Row: Submission Trends & Sector Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trend Bar Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Societal Challenges Ingestion Velocity</h3>
              <p className="text-xs text-stone-500">Monthly breakdown of crowdsourced problems vs validated solutions.</p>
            </div>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-white shadow-2xs text-stone-900">2026</span>
            </div>
          </div>

          {/* Clean Vector Visual Bar Chart */}
          <div className="space-y-4 pt-2">
            {[
              { month: "Jan 2026", challenges: 14, solutions: 9, max: 25 },
              { month: "Feb 2026", challenges: 19, solutions: 15, max: 25 },
              { month: "Mar 2026", challenges: 23, solutions: 18, max: 25 },
              { month: "Apr 2026", challenges: 28, solutions: 22, max: 25 },
              { month: "May 2026", challenges: 32, solutions: 27, max: 25 },
              { month: "Jun 2026", challenges: 36, solutions: 31, max: 25 },
            ].map((d) => (
              <div key={d.month} className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px] font-semibold text-stone-600">
                  <span>{d.month}</span>
                  <span>{d.challenges} problems / {d.solutions} solutions</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3 flex overflow-hidden gap-0.5">
                  <div 
                    className="bg-emerald-600 rounded-l-full" 
                    style={{ width: `${(d.challenges / 40) * 100}%` }}
                    title={`${d.challenges} Challenges`}
                  ></div>
                  <div 
                    className="bg-sky-500 rounded-r-full" 
                    style={{ width: `${(d.solutions / 40) * 100}%` }}
                    title={`${d.solutions} Solutions`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-medium text-stone-600 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-600"></span>
              <span>Challenges Ingested</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500"></span>
              <span>Co-Designed Solutions</span>
            </div>
          </div>
        </div>

        {/* Sector Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 space-y-6 shadow-2xs">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Impact Domain Distribution</h3>
            <p className="text-xs text-stone-500">Proportion of problems categorized across UN SDG focus areas.</p>
          </div>

          <div className="space-y-3 pt-2">
            {sectorData.map((s) => (
              <div key={s.name} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">{s.name}</span>
                  <span className="font-mono font-bold text-stone-900">{s.count} ({s.pct}%)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-600 leading-relaxed">
            <strong>Key Insight:</strong> 57% of challenges concentrate in rural water and smallholder agricultural cold chain logistics.
          </div>
        </div>
      </div>

      {/* University Leaderboard & CSR Impact Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* University Research Ranking */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-stone-900 text-base">University Research Leaderboard</h3>
            </div>
            <span className="text-xs text-stone-400 font-medium">Ranked by Field Pilots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2">Institution</th>
                  <th className="py-2 text-center">Solutions</th>
                  <th className="py-2 text-center">Pilots</th>
                  <th className="py-2 text-right">Grant Pooled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {universityRankings.map((u, i) => (
                  <tr key={i} className="hover:bg-stone-50/60">
                    <td className="py-2.5 font-bold text-stone-900 flex items-center gap-2">
                      <span className="w-4 text-stone-400 font-mono text-[11px]">{i + 1}.</span>
                      {u.name}
                    </td>
                    <td className="py-2.5 text-center font-mono">{u.solutions}</td>
                    <td className="py-2.5 text-center font-mono font-bold text-emerald-700">{u.pilots}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-stone-800">{u.funding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Industry CSR Sponsors */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-stone-900 text-base">Corporate CSR Impact Portfolio</h3>
            </div>
            <span className="text-xs text-stone-400 font-medium">Secured Grant Commitments</span>
          </div>

          <div className="space-y-3 pt-1">
            {csrSponsors.map((c, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">{c.name}</div>
                  <div className="text-[11px] text-stone-500">Domain: {c.sector}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-extrabold text-stone-900">{c.deployed}</div>
                  <div className="text-[10px] text-emerald-700 font-bold">{c.pilots} Pilots Funded</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Field Pilot Success Story Case Study */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-8 text-white space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-700 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Verified Pilot Case Study</span>
          </div>
          <span className="text-xs text-stone-400">Deployed January 2026 • Ahmednagar, Maharashtra</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold">
            Solar-Assisted Alumina Adsorption Kiosk for Shevgaon Fluoride Mitigation
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
            Submitted as a grassroots challenge by local panchayat members. Matched with IIT Bombay CTARA and funded with ₹3.2L from Tata Sustainability Group. Provides 4,000 liters/day of pure drinking water at ₹0.15/liter, maintained by a village Self-Help Group (SHG).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-emerald-300">
          <div>Beneficiaries: <strong>18,500 villagers</strong></div>
          <div>Fluoride Reduction: <strong>3.8 ppm → 0.6 ppm</strong></div>
          <div>Solar Autonomy: <strong>6.5 hours/day</strong></div>
        </div>
      </div>
    </div>
  );
};
