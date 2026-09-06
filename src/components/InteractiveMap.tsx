import React, { useState } from "react";
import { Challenge } from "../types";
import { MapPin, AlertCircle, Users, Lightbulb, ExternalLink, Sparkles, Filter } from "lucide-react";

interface InteractiveMapProps {
  challenges: Challenge[];
  onSelectChallenge: (id: string) => void;
}

// Representative coordinates bounding box for India
// Lat: ~8.0N to ~37.0N, Lng: ~68.0E to ~97.5E
function projectCoords(lat: number, lng: number, width: number, height: number) {
  const minLat = 7.0;
  const maxLat = 36.5;
  const minLng = 68.0;
  const maxLng = 97.0;

  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return { x, y };
}

const CATEGORY_COLORS: Record<string, { pin: string; badge: string; text: string }> = {
  "Water & Sanitation": { pin: "#0284c7", badge: "bg-sky-100 text-sky-800 border-sky-200", text: "text-sky-600" },
  "Healthcare & Public Health": { pin: "#e11d48", badge: "bg-rose-100 text-rose-800 border-rose-200", text: "text-rose-600" },
  "Agriculture & Food Security": { pin: "#16a34a", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", text: "text-emerald-600" },
  "Education & Skill Development": { pin: "#d97706", badge: "bg-amber-100 text-amber-800 border-amber-200", text: "text-amber-600" },
  "Clean Energy & Climate": { pin: "#059669", badge: "bg-teal-100 text-teal-800 border-teal-200", text: "text-teal-600" },
  "Rural Infrastructure": { pin: "#4f46e5", badge: "bg-indigo-100 text-indigo-800 border-indigo-200", text: "text-indigo-600" },
  "Urban Mobility & Planning": { pin: "#9333ea", badge: "bg-purple-100 text-purple-800 border-purple-200", text: "text-purple-600" },
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ challenges = [], onSelectChallenge }) => {
  const safeChallenges = challenges || [];
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [activeChallengeId, setActiveChallengeId] = useState<string>(safeChallenges[0]?.id || "");

  const categories = ["All", ...Array.from(new Set(safeChallenges.map(c => c?.category).filter(Boolean)))];
  const states = ["All", ...Array.from(new Set(safeChallenges.map(c => c?.location?.state).filter(Boolean)))];

  const filtered = safeChallenges.filter(c => {
    if (!c) return false;
    if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
    if (selectedState !== "All" && c.location?.state !== selectedState) return false;
    return true;
  });

  const activeChallenge = safeChallenges.find(c => c?.id === activeChallengeId) || filtered[0] || safeChallenges[0];

  const mapWidth = 640;
  const mapHeight = 600;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header bar with controls */}
      <div className="p-4 sm:p-6 border-b border-stone-200 bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-stone-900 text-lg">National Geographic Impact Map</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Geolocated societal challenges crowdsourced from districts across India
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>State:</span>
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-700 shadow-2xs focus:outline-emerald-600"
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium ml-2">
            <span>Sector:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-700 shadow-2xs focus:outline-emerald-600"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Main Map + Side Drawer layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[560px]">
        {/* Map Vector Canvas */}
        <div className="lg:col-span-8 bg-stone-900/95 relative flex items-center justify-center p-4 overflow-hidden select-none">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>

          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-auto max-h-[540px] drop-shadow-md"
          >
            {/* Abstract Stylized Geographic Outline of Indian Subcontinent */}
            <path
              d="M 280,35 
                 L 330,50 350,90 385,115 410,95 440,115 450,150 490,165 520,180 540,195 560,190 580,215 540,240 500,245 465,245 440,260 410,250 390,270 380,310 395,350 405,400 385,450 360,490 340,540 325,565 310,540 290,480 270,430 250,390 230,350 200,320 180,290 160,260 170,240 200,225 215,200 230,160 250,110 265,70 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="2"
              className="transition-all duration-300 hover:fill-[#24334a]"
            />
            {/* Coastal & State Guideline accents */}
            <path
              d="M 230,225 Q 310,260 380,310"
              fill="none"
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <path
              d="M 200,320 Q 300,360 395,350"
              fill="none"
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth="1"
            />

            {/* Latitude/Longitude grid markers */}
            <text x="20" y="30" fill="#64748b" fontSize="10" fontFamily="monospace">8°N - 36°N Lat</text>
            <text x="20" y="580" fill="#64748b" fontSize="10" fontFamily="monospace">Indian Subcontinent Impact Radar</text>

            {/* Render Challenge Pins */}
            {filtered.map(ch => {
              const { x, y } = projectCoords(
                ch.location.coordinates.lat,
                ch.location.coordinates.lng,
                mapWidth,
                mapHeight
              );
              const isSelected = ch.id === activeChallengeId;
              const catColor = CATEGORY_COLORS[ch.category]?.pin || "#10b981";

              return (
                <g
                  key={ch.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  onClick={() => setActiveChallengeId(ch.id)}
                >
                  {/* Outer pulse ring for active or critical */}
                  {(isSelected || ch.urgency === "critical") && (
                    <circle
                      r={isSelected ? "18" : "14"}
                      fill={catColor}
                      opacity={isSelected ? "0.3" : "0.2"}
                      className="animate-ping"
                    />
                  )}

                  {/* Marker glow shadow */}
                  <circle
                    r={isSelected ? "14" : "10"}
                    fill={catColor}
                    opacity="0.4"
                  />

                  {/* Center pin circle */}
                  <circle
                    r={isSelected ? "9" : "7"}
                    fill={catColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />

                  {/* Location label */}
                  <text
                    y={isSelected ? "-16" : "-12"}
                    x="0"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize={isSelected ? "11" : "9"}
                    fontWeight="bold"
                    className="pointer-events-none drop-shadow-md"
                  >
                    {ch.location.district}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Legend at bottom */}
          <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur border border-stone-800 rounded-xl px-3 py-2 text-[10px] text-stone-300 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-stone-400">Categories:</span>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Water</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Agriculture</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Climate</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Health</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Education</div>
          </div>
        </div>

        {/* Selected Challenge Interactive Preview Drawer */}
        <div className="lg:col-span-4 border-l border-stone-200 bg-white p-6 flex flex-col justify-between">
          {activeChallenge ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[activeChallenge.category]?.badge || "bg-stone-100 text-stone-700 border-stone-200"}`}>
                  {activeChallenge.category}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                  activeChallenge.urgency === "critical" ? "bg-rose-100 text-rose-700" :
                  activeChallenge.urgency === "high" ? "bg-amber-100 text-amber-800" :
                  "bg-stone-100 text-stone-700"
                }`}>
                  {activeChallenge.urgency} Urgency
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-stone-900 leading-snug">
                  {activeChallenge.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{activeChallenge.location?.district || "India"}, {activeChallenge.location?.state || ""}</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 line-clamp-4 leading-relaxed">
                {activeChallenge.description}
              </p>

              {/* Target Community Callout */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs text-stone-700 space-y-1">
                <div className="font-semibold text-stone-900 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Target Community:
                </div>
                <div className="text-stone-600">{activeChallenge.targetCommunity}</div>
              </div>

              {/* AI Severity & SDGs */}
              {activeChallenge.aiAnalysis && (
                <div className="space-y-2 border-t border-stone-100 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      AI Severity Index:
                    </span>
                    <span className="font-mono font-bold text-stone-900">{activeChallenge.aiAnalysis.severity}/100</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        activeChallenge.aiAnalysis.severity > 85 ? "bg-rose-600" :
                        activeChallenge.aiAnalysis.severity > 70 ? "bg-amber-500" : "bg-emerald-600"
                      }`}
                      style={{ width: `${activeChallenge.aiAnalysis.severity}%` }}
                    ></div>
                  </div>

                  <div className="text-[11px] text-stone-500 pt-1">
                    <span className="font-semibold text-stone-700">SDG Alignment:</span>{" "}
                    {activeChallenge.aiAnalysis.sdgGoals.slice(0, 2).join(", ")}
                  </div>
                </div>
              )}

              {/* Engagement metrics */}
              <div className="flex items-center gap-4 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-semibold text-stone-900">{activeChallenge.supportCount}</span> supporters
                </div>
                <div className="flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-stone-900">{activeChallenge.solutionCount}</span> solutions
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-stone-500">
              Select a pin on the radar map to inspect community challenge specifics.
            </div>
          )}

          {activeChallenge && (
            <div className="pt-4 border-t border-stone-200 mt-4">
              <button
                id="view-full-challenge-btn"
                onClick={() => onSelectChallenge(activeChallenge.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 text-white font-medium text-xs hover:bg-stone-800 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                View Full Challenge & Solutions
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
