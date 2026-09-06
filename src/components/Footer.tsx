import React from "react";
import { Sparkles, Shield, HeartHandshake, Layers } from "lucide-react";

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#F9FAFB] text-[#1A1A1A] border-t editorial-border pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b editorial-border">
          {/* Col 1: Project Identity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A]">
                CivicSolve <span className="text-emerald-800 italic">AI</span>
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-xs font-sans">
              Statement 43: A Digital Platform to Crowdsource Societal Challenges and Facilitate Collaborative Problem Solving through Universities and Industry Partnerships.
            </p>
            <div className="text-[10px] font-mono tracking-wider uppercase text-stone-400">
              Powered by Google Gemini AI • Cloud Run
            </div>
          </div>

          {/* Col 2: Platform Portals */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              Navigation Desks
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><button onClick={() => onNavigate("explore")} className="hover:text-stone-900 transition">Browse Challenges</button></li>
              <li><button onClick={() => onNavigate("map")} className="hover:text-stone-900 transition">Geographic Map</button></li>
              <li><button onClick={() => onNavigate("organizations")} className="hover:text-stone-900 transition">Partner Directory</button></li>
              <li><button onClick={() => onNavigate("workspace")} className="hover:text-stone-900 transition">Execution Workspaces</button></li>
              <li><button onClick={() => onNavigate("analytics")} className="hover:text-stone-900 transition">Impact Telemetry</button></li>
            </ul>
          </div>

          {/* Col 3: Stakeholders & Roles */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800 mb-3 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
              Partner Networks
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><strong className="text-stone-800 font-medium">Universities:</strong> Capstones & faculty research</li>
              <li><strong className="text-stone-800 font-medium">Industry CSR:</strong> Catalytic capital & mentoring</li>
              <li><strong className="text-stone-800 font-medium">Grassroots NGOs:</strong> Ground truth & beneficiaries</li>
              <li><strong className="text-stone-800 font-medium">Citizens:</strong> Community-reported priorities</li>
            </ul>
          </div>

          {/* Col 4: AI Governance & Ethics */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800 mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              Advisory Governance
            </h4>
            <div className="bg-white p-3.5 border editorial-border rounded shadow-2xs text-xs text-stone-600 space-y-1.5">
              <div className="text-stone-900 font-serif font-semibold text-xs">Human-in-the-Loop Protocol</div>
              <p className="text-[11px] leading-relaxed text-stone-500">
                All Gemini AI suggestions, feasibility ratings, and duplicate detections act strictly as analytical guidance. Community stakeholders maintain final authority.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Status Bar (Matches Design HTML) */}
      <div className="h-14 flex items-center justify-between px-6 sm:px-10 text-[10px] font-mono text-stone-500 uppercase tracking-widest bg-[#FDFCF9]">
        <div className="truncate">Platform v2.4.1 — Regional Node: Maharashtra-South</div>
        <div className="flex items-center gap-6 shrink-0">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Systems Operational
          </span>
          <span className="hidden sm:inline">Cloud Run: Stable</span>
        </div>
      </div>
    </footer>
  );
};
