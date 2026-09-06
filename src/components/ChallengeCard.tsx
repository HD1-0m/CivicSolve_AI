import React from "react";
import { Challenge } from "../types";
import { useAuth } from "../context/AuthContext";
import { StorageService } from "../services/storage";
import { useNotifications } from "../context/NotificationContext";
import { 
  MapPin, 
  Lightbulb, 
  Bookmark, 
  Heart, 
  Sparkles, 
  ArrowRight,
  FolderKanban
} from "lucide-react";

interface ChallengeCardProps {
  challenge: Challenge;
  onSelect: (id: string) => void;
  onUpdate?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onSelect, onUpdate }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const isSupported = user ? challenge.supporters?.includes(user.id) : false;
  const isSaved = user ? challenge.savedBy?.includes(user.id) : false;

  const handleSupport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast("Please select a persona to endorse challenges.", "info");
      return;
    }
    const result = StorageService.toggleSupportChallenge(challenge.id, user.id);
    showToast(result.supported ? "Endorsed this societal challenge." : "Endorsement removed.", "success");
    if (onUpdate) onUpdate();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast("Please sign in to save challenges.", "info");
      return;
    }
    const saved = StorageService.toggleSaveChallenge(challenge.id, user.id);
    showToast(saved ? "Challenge saved to bookmarks." : "Removed from bookmarks.", "info");
    if (onUpdate) onUpdate();
  };

  const refCode = (challenge.id || "").replace("ch-", "CS-2026-");

  return (
    <div
      onClick={() => onSelect(challenge.id)}
      className="bg-white rounded-sm border editorial-border p-6 hover:shadow-sm transition-all duration-150 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Top Header: Category & Ref */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
            {challenge.category}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-stone-400 uppercase">
              Ref: #{refCode}
            </span>
            <button
              onClick={handleSave}
              className="p-1 text-stone-400 hover:text-stone-700 transition"
              title="Save Challenge"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-stone-800 text-stone-800" : ""}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-xl text-[#1A1A1A] group-hover:text-emerald-800 transition line-clamp-2 leading-snug mb-2">
          {challenge.title}
        </h3>

        {/* Location & Stakeholder */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{challenge.location?.district || "India"}, {challenge.location?.state || ""}</span>
          <span className="text-stone-300">•</span>
          <span className="truncate text-stone-700 font-medium">{challenge.creatorOrg || challenge.creatorName}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4 font-sans">
          {challenge.description}
        </p>

        {/* AI Insight Box */}
        {challenge.aiAnalysis && (
          <div className="bg-[#F9FAFB] rounded-sm p-3 border editorial-border mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
              <span className="text-stone-600 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                AI Severity Index
              </span>
              <span className="font-bold text-stone-900">{challenge.aiAnalysis.severity || 0}/100</span>
            </div>
            <div className="w-full bg-stone-200 h-1 overflow-hidden">
              <div 
                className={`h-full ${
                  (challenge.aiAnalysis.severity || 0) > 80 ? "bg-rose-700" :
                  (challenge.aiAnalysis.severity || 0) > 65 ? "bg-amber-600" : "bg-emerald-700"
                }`}
                style={{ width: `${challenge.aiAnalysis.severity || 0}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-stone-500 truncate font-mono">
              Primary: {challenge.aiAnalysis.sdgGoals?.[0] || "SDG 11: Cities"}
            </div>
          </div>
        )}
      </div>

      {/* Footer stats & Action */}
      <div className="border-t editorial-border pt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-stone-600">
          <button
            onClick={handleSupport}
            className={`flex items-center gap-1.5 py-0.5 transition ${
              isSupported ? "text-rose-700 font-bold" : "hover:text-rose-700"
            }`}
            title="Endorse this challenge"
          >
            <Heart className={`w-3.5 h-3.5 ${isSupported ? "fill-rose-700 text-rose-700" : ""}`} />
            <span className="font-mono text-[11px]">{challenge.supportCount}</span>
          </button>

          <div className="flex items-center gap-1 text-stone-600" title="Proposed Solutions">
            <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-mono text-[11px]">{challenge.solutionCount}</span>
          </div>

          {challenge.projectCount > 0 && (
            <div className="flex items-center gap-1 text-indigo-700" title="Active Project Workspaces">
              <FolderKanban className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">{challenge.projectCount}</span>
            </div>
          )}
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900 group-hover:text-emerald-800 flex items-center gap-1">
          Dossier <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
