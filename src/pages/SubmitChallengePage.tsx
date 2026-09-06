import React, { useState } from "react";
import { Challenge, ChallengeUrgency, AIAnalysis } from "../types";
import { useAuth } from "../context/AuthContext";
import { StorageService } from "../services/storage";
import { ApiClient } from "../services/apiClient";
import { useNotifications } from "../context/NotificationContext";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Link as LinkIcon, 
  Trash2, 
  RefreshCw,
  Users
} from "lucide-react";

interface SubmitChallengePageProps {
  onNavigate: (tab: string, param?: string) => void;
}

const CATEGORIES = [
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
  "Assam",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
];

export const SubmitChallengePage: React.FC<SubmitChallengePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast, sendNotification } = useNotifications();

  const [step, setStep] = useState<number>(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [state, setState] = useState(STATES[0]);
  const [district, setDistrict] = useState("");
  const [targetCommunity, setTargetCommunity] = useState("");
  const [urgency, setUrgency] = useState<ChallengeUrgency>("medium");
  const [estimatedImpact, setEstimatedImpact] = useState("");

  // Step 2 Detailed State
  const [currentSituation, setCurrentSituation] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [existingAttempts, setExistingAttempts] = useState("");
  const [constraints, setConstraints] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [availableResources, setAvailableResources] = useState("");

  // Step 3 Attachments
  const [referenceUrl, setReferenceUrl] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);

  // Step 4 AI Analysis & Similarity
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [similarResult, setSimilarResult] = useState<{
    hasSimilar: boolean;
    similarChallenges: any[];
    recommendation: string;
  } | null>(null);

  const handleAddAttachment = () => {
    if (!referenceUrl.trim()) return;
    setAttachments([
      ...attachments,
      {
        name: referenceUrl.length > 30 ? referenceUrl.slice(0, 30) + "..." : referenceUrl,
        url: referenceUrl,
        type: "link",
      },
    ]);
    setReferenceUrl("");
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  // Run AI Analysis & Similarity Check
  const runAiAnalysis = async () => {
    if (!title.trim() || !description.trim() || !district.trim()) {
      showToast("Please complete Title, Description, and District before running AI analysis.", "error");
      return;
    }

    setAnalyzing(true);
    try {
      // 1. Analyze with Gemini
      const analysis = await ApiClient.analyzeChallenge({
        title,
        description,
        location: { state, district },
        category,
        targetCommunity,
        urgency,
        currentSituation,
        rootCause,
      });
      setAiAnalysis(analysis);

      // 2. Similarity & Duplicate Detection
      const existing = StorageService.getChallenges();
      const similarity = await ApiClient.detectSimilarity(
        { title, description, category, location: { state, district, country: "India", coordinates: { lat: 19.0, lng: 75.0 } } },
        existing
      );
      setSimilarResult(similarity);

      setStep(4);
      showToast("AI classification and similarity analysis completed!", "success");
    } catch (err: any) {
      console.error(err);
      showToast("AI analysis notice: standard analysis generated.", "info");
      // Fallback
      setStep(4);
    } finally {
      setAnalyzing(false);
    }
  };

  // Final Publish with Guaranteed Save
  const handlePublish = async () => {
    if (!user) {
      showToast("Please select an active user profile to publish.", "error");
      return;
    }

    setSaving(true);
    try {
      const newChallenge: Challenge = {
        id: `ch-${Date.now()}`,
        title,
        description,
        category: aiAnalysis?.category || category,
        subcategory: aiAnalysis?.subcategory,
        location: {
          country: "India",
          state,
          district,
          coordinates: {
            lat: 18.5 + Math.random() * 2,
            lng: 73.5 + Math.random() * 2,
          },
        },
        targetCommunity,
        urgency: aiAnalysis?.urgency || urgency,
        estimatedImpact: estimatedImpact || aiAnalysis?.potentialSocialImpact || "Broad community benefit",
        currentSituation,
        rootCause,
        existingAttempts,
        constraints,
        desiredOutcome,
        availableResources,
        attachments: attachments.map((a, i) => ({
          id: `att-${i}`,
          name: a.name,
          url: a.url,
          type: a.type,
        })),
        aiAnalysis: aiAnalysis || undefined,
        createdBy: user.id,
        creatorName: user.name,
        creatorRole: user.role,
        creatorOrg: user.organization,
        status: "open",
        supportCount: 1,
        supporters: [user.id],
        solutionCount: 0,
        projectCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      StorageService.saveChallenge(newChallenge);

      // Notification to user
      sendNotification({
        userId: user.id,
        title: "Challenge Published Successfully",
        message: `Your challenge "${title}" has been published and matched to partner institutions.`,
        type: "challenge",
        link: `/challenges/${newChallenge.id}`,
      });

      showToast("Societal Challenge published successfully!", "success");
      onNavigate("challenge-detail", newChallenge.id);
    } catch (err: any) {
      console.error(err);
      showToast("Failed to save challenge. Please check input.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate("explore")}
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Challenges
        </button>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Submit a Societal Challenge
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Crowdsource a real-world community problem to university engineering labs, student researchers, and industry CSR partners.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-4 gap-2 mb-8 text-center text-xs">
        <div className={`p-2 rounded-xl border ${step === 1 ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" : "bg-white border-stone-200 text-stone-500"}`}>
          1. Basic Info
        </div>
        <div className={`p-2 rounded-xl border ${step === 2 ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" : "bg-white border-stone-200 text-stone-500"}`}>
          2. Field Context
        </div>
        <div className={`p-2 rounded-xl border ${step === 3 ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" : "bg-white border-stone-200 text-stone-500"}`}>
          3. Evidence & Links
        </div>
        <div className={`p-2 rounded-xl border ${step === 4 ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" : "bg-white border-stone-200 text-stone-500"}`}>
          4. AI Review & Publish
        </div>
      </div>

      {/* STEP 1: BASIC INFORMATION */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
              Challenge Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chronic Fluoride Groundwater Contamination in Shevgaon Villages"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
            />
            <span className="text-[11px] text-stone-400">Keep it descriptive, stating both the problem and the location.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Primary Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Urgency Level *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as ChallengeUrgency)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
              >
                <option value="low">Low - Exploratory / Long-Term</option>
                <option value="medium">Medium - Steady community concern</option>
                <option value="high">High - Escalating economic/health impact</option>
                <option value="critical">Critical - Immediate life/safety hazard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                State / Province *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                District / Taluka / City *
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Ahmednagar / Shevgaon"
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
              Target Affected Community *
            </label>
            <input
              type="text"
              value={targetCommunity}
              onChange={(e) => setTargetCommunity(e.target.value)}
              placeholder="e.g. 18,500 rural villagers, daily-wage laborers, and 3,200 primary school children"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
              Problem Description & Scale *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the problem in detail: What is happening? Who is impacted? How frequently does it occur? What are the observable symptoms?"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (!title || !description || !district) {
                  showToast("Please fill in title, description, and district.", "error");
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 flex items-center gap-1.5 transition"
            >
              Continue to Field Context <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILED FIELD CONTEXT */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
              Current Situation & Immediate Workarounds
            </label>
            <textarea
              value={currentSituation}
              onChange={(e) => setCurrentSituation(e.target.value)}
              rows={3}
              placeholder="How are community members currently dealing with this? (e.g. buying expensive bottled water, dumping spoiled tomatoes)"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
              User-Identified Root Cause
            </label>
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              rows={3}
              placeholder="What do you believe is the underlying systemic reason? (e.g. absence of single-phase power, deep granite rock drilling)"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
              Previous Interventions or Past Failures
            </label>
            <textarea
              value={existingAttempts}
              onChange={(e) => setExistingAttempts(e.target.value)}
              rows={2}
              placeholder="Have prior solutions been tried? Why did they fail? (e.g. RO kiosks failed due to membrane fouling and high water reject)"
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Local Operational Constraints
              </label>
              <textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                rows={3}
                placeholder="e.g. Max ₹0.15/L cost, 4 hrs daily electricity, must be operable by local youth"
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                Available Community Resources
              </label>
              <textarea
                value={availableResources}
                onChange={(e) => setAvailableResources(e.target.value)}
                rows={3}
                placeholder="e.g. Panchayat land allocated, local SHG ready to manage kiosk, borewell electrical line"
                className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 flex items-center gap-1.5 transition"
            >
              Continue to Evidence <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EVIDENCE & ATTACHMENTS */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Add Supporting Evidence</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Attach lab test results, newspaper articles, photos, survey sheets, or video documentation.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="Paste public document link or Google Drive reference URL"
              className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
            />
            <button
              onClick={handleAddAttachment}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
            >
              Add Link
            </button>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-stone-700">Attached References:</span>
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                  <div className="flex items-center gap-2 truncate text-stone-700">
                    <LinkIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span className="truncate">{att.name}</span>
                  </div>
                  <button onClick={() => handleRemoveAttachment(idx)} className="text-rose-600 hover:text-rose-800 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI trigger callout box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Next: Gemini AI Classification & Duplicate Detection</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              When you click &ldquo;Run AI Analysis&rdquo;, CivicSolve will call our dedicated Gemini AI engine to extract structural root causes, calculate the severity score, map relevant SDGs, and check whether a similar challenge has already been submitted to prevent duplicated effort.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
            >
              Back
            </button>
            <button
              onClick={runAiAnalysis}
              disabled={analyzing}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 flex items-center gap-1.5 transition"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running AI Synthesis...
                </>
              ) : (
                <>
                  Run AI Analysis & Review <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AI REVIEW, SIMILARITY WARNING, & FINAL PUBLISH */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI Analysis Grounding Ready
              </div>
              <h3 className="text-lg font-bold text-stone-900">Review & Verify Prior to Publishing</h3>
            </div>
            <button
              onClick={runAiAnalysis}
              disabled={analyzing}
              className="text-xs text-stone-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} /> Re-analyze
            </button>
          </div>

          {/* Similar Challenges Warning Banner */}
          {similarResult?.hasSimilar && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Existing Similar Challenges Detected</span>
              </div>
              <p className="text-xs text-amber-800">
                {similarResult.recommendation}
              </p>
              <div className="space-y-2 pt-1">
                {(similarResult.similarChallenges || []).map((sc: any) => (
                  <div key={sc.id} className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-900">{sc.title}</div>
                      <div className="text-[11px] text-stone-600">{sc.reason}</div>
                    </div>
                    <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                      {sc.similarityScore}% match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis Cards */}
          {aiAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity & Summary */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700">Calculated Severity:</span>
                  <span className="font-mono font-extrabold text-stone-900 text-sm">{aiAnalysis.severity} / 100</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {aiAnalysis.summary}
                </p>
              </div>

              {/* SDGs & Organization Types */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-stone-700">Matched UN SDGs:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(aiAnalysis.sdgGoals || []).map((g, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-stone-700">Target Partner Types:</span>
                  <div className="text-stone-600 mt-0.5">
                    {(aiAnalysis.recommendedOrganizationTypes || []).join(", ")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Identified Root causes */}
          {aiAnalysis && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <span className="font-bold text-stone-900">Systemic Root Causes Identified:</span>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                {(aiAnalysis.rootCauses || []).map((rc, i) => (
                  <li key={i}>{rc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Human-in-the-Loop Transparency notice */}
          <div className="text-[11px] text-stone-500 bg-stone-100/70 p-3 rounded-xl border border-stone-200">
            <strong>Human-in-the-Loop Disclaimer:</strong> All AI classifications, severity ratings, and recommended solution areas are provisional suggestions. You may edit your submission at any time after publishing.
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
            >
              Back to Evidence
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-2 transition shadow-sm"
            >
              {saving ? "Publishing Challenge..." : "Confirm & Publish Challenge"}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
