import React, { useState } from "react";
import { Organization } from "../types";
import { StorageService } from "../services/storage";
import { useNotifications } from "../context/NotificationContext";
import { 
  Building2, 
  GraduationCap, 
  HeartHandshake, 
  Search, 
  MapPin, 
  Filter, 
  ExternalLink,
  CheckCircle2,
  Cpu,
  Mail
} from "lucide-react";

interface OrganizationsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const OrganizationsPage: React.FC<OrganizationsPageProps> = ({ onNavigate }) => {
  const { showToast } = useNotifications();
  const [organizations] = useState<Organization[]>(() => StorageService.getOrganizations());
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrgs = (organizations || []).filter((org) => {
    if (!org) return false;
    if (selectedType !== "All" && org.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (org.name || "").toLowerCase().includes(q) ||
        (org.location || "").toLowerCase().includes(q) ||
        (org.focusAreas || []).some((fa) => (fa || "").toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleConnect = (orgName: string) => {
    showToast(`Partnership inquiry sent to ${orgName}!`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Stakeholder Innovation Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Partner Institutions & Organizations
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Universities, research labs, industry CSR divisions, and grassroots NGOs collaborating to engineer solutions.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search universities, industry labs, capabilities, or focus domains..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-medium text-stone-700"
          >
            <option value="All">All Organization Types</option>
            <option value="university">Universities & Institutes</option>
            <option value="industry">Industry Partners & CSR</option>
            <option value="ngo">Grassroots NGOs & Trusts</option>
            <option value="research_institute">Research Labs & NIH</option>
          </select>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <div
            key={org.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:shadow-md transition shadow-2xs space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  org.type === "university" ? "bg-indigo-50 text-indigo-800 border border-indigo-200" :
                  org.type === "industry" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                  org.type === "ngo" ? "bg-teal-50 text-teal-800 border border-teal-200" :
                  "bg-stone-100 text-stone-700"
                }`}>
                  {org.type.replace("_", " ")}
                </span>
                {org.verified && (
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Partner
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-stone-900 text-base">{org.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{org.location}</span>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {org.description}
              </p>

              {/* Focus Areas */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Focus Domains:
                </span>
                <div className="flex flex-wrap gap-1">
                  {(org.focusAreas || []).map((fa, i) => (
                    <span key={i} className="px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-700 rounded text-[10px] font-medium">
                      {fa}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Capabilities */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                  Key Capabilities & Labs:
                </span>
                <div className="flex flex-wrap gap-1">
                  {(org.capabilities || []).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50/60 border border-indigo-100 text-indigo-800 rounded text-[10px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">
                {org.activeProjects} active projects
              </span>
              <button
                onClick={() => handleConnect(org.name)}
                className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 flex items-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
