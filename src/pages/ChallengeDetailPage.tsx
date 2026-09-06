import React, { useState, useEffect } from "react";
import { Challenge, Solution, Comment, OrganizationMatch, UserRole } from "../types";
import { StorageService } from "../services/storage";
import { ApiClient } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { ReportModal } from "../components/ReportModal";
import { 
  MapPin, 
  Users, 
  Sparkles, 
  Heart, 
  Bookmark, 
  Lightbulb, 
  MessageSquare, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Send, 
  ThumbsUp, 
  Share2, 
  PlusCircle, 
  ChevronRight,
  ShieldAlert,
  FileCheck,
  RefreshCw,
  Clock
} from "lucide-react";

interface ChallengeDetailPageProps {
  challengeId: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const ChallengeDetailPage: React.FC<ChallengeDetailPageProps> = ({
  challengeId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { showToast, sendNotification } = useNotifications();

  const [challenge, setChallenge] = useState<Challenge | null>(() => StorageService.getChallengeById(challengeId) || null);
  const [solutions, setSolutions] = useState<Solution[]>(() => StorageService.getSolutions(challengeId));
  const [comments, setComments] = useState<Comment[]>(() => StorageService.getComments(challengeId));
  
  // Organization matching state
  const [orgMatches, setOrgMatches] = useState<OrganizationMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Discussion summary state
  const [discussionSummary, setDiscussionSummary] = useState<any | null>(null);
  const [summarizingDiscussion, setSummarizingDiscussion] = useState(false);

  // Solution proposal modal
  const [proposingSolution, setProposingSolution] = useState(false);
  const [evaluatingSolution, setEvaluatingSolution] = useState(false);
  const [solTitle, setSolTitle] = useState("");
  const [solDescription, setSolDescription] = useState("");
  const [solApproach, setSolApproach] = useState("");
  const [solTech, setSolTech] = useState("");
  const [solResources, setSolResources] = useState("");
  const [solImpact, setSolImpact] = useState("");
  const [solTime, setSolTime] = useState("");
  const [solCost, setSolCost] = useState("");

  // Comment input
  const [commentText, setCommentText] = useState("");

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const ch = StorageService.getChallengeById(challengeId);
    if (ch) {
      setChallenge(ch);
      setSolutions(StorageService.getSolutions(challengeId));
      setComments(StorageService.getComments(challengeId));
      fetchMatches(ch);
    }
  }, [challengeId]);

  const fetchMatches = async (ch: Challenge) => {
    setLoadingMatches(true);
    try {
      const matches = await ApiClient.matchOrganizations(ch);
      setOrgMatches(matches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSupport = () => {
    if (!user || !challenge) {
      showToast("Please sign in or select an active persona.", "info");
      return;
    }
    const res = StorageService.toggleSupportChallenge(challenge.id, user.id);
    setChallenge({ ...challenge, supportCount: res.count });
    showToast(res.supported ? "You supported this challenge!" : "Support removed.", "success");
  };

  const handleSave = () => {
    if (!user || !challenge) return;
    const saved = StorageService.toggleSaveChallenge(challenge.id, user.id);
    showToast(saved ? "Challenge bookmarked." : "Removed from bookmarks.", "info");
  };

  // Add a discussion comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !challenge || !user) return;

    const newComm: Comment = {
      id: `comm-${Date.now()}`,
      challengeId: challenge.id,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userOrg: user.organization,
      content: commentText.trim(),
      likesCount: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    StorageService.saveComment(newComm);
    setComments(StorageService.getComments(challenge.id));
    setCommentText("");
    showToast("Comment published to public discussion.", "success");
  };

  // Run AI discussion summarization
  const handleSummarizeDiscussion = async () => {
    if (!challenge) return;
    setSummarizingDiscussion(true);
    try {
      const summary = await ApiClient.summarizeDiscussion(comments, challenge.title);
      setDiscussionSummary(summary);
      showToast("Discussion summarized by Gemini AI!", "success");
    } catch (err) {
      showToast("Could not generate discussion summary.", "error");
    } finally {
      setSummarizingDiscussion(false);
    }
  };

  // Submit Solution with AI Evaluation
  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !user) return;
    if (!solTitle.trim() || !solDescription.trim()) {
      showToast("Please provide solution title and description.", "error");
      return;
    }

    setEvaluatingSolution(true);
    try {
      // 1. AI 7-dimension evaluation
      const evaluation = await ApiClient.evaluateSolution({
        challengeTitle: challenge.title,
        challengeDescription: challenge.description,
        solutionTitle: solTitle,
        description: solDescription,
        proposedApproach: solApproach,
        technology: solTech,
        requiredResources: solResources,
        expectedImpact: solImpact,
        estimatedImplementationTime: solTime,
        estimatedCostRange: solCost,
      });

      // 2. Save solution
      const newSol: Solution = {
        id: `sol-${Date.now()}`,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        title: solTitle,
        description: solDescription,
        proposedApproach: solApproach,
        technology: solTech,
        requiredResources: solResources,
        expectedImpact: solImpact,
        estimatedImplementationTime: solTime,
        estimatedCostRange: solCost,
        teamMembers: [`${user.name} (${user.role})`],
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        authorOrg: user.organization,
        status: "submitted",
        evaluation,
        votesCount: 1,
        votedBy: [user.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      StorageService.saveSolution(newSol);
      setSolutions(StorageService.getSolutions(challenge.id));
      setProposingSolution(false);

      // Reset fields
      setSolTitle("");
      setSolDescription("");
      setSolApproach("");
      setSolTech("");
      setSolResources("");
      setSolImpact("");
      setSolTime("");
      setSolCost("");

      sendNotification({
        userId: user.id,
        title: "Solution Evaluated & Submitted",
        message: `Your solution '${newSol.title}' scored ${evaluation.overallScore}/100 across 7 feasibility dimensions.`,
        type: "solution",
      });

      showToast(`Solution evaluated by AI (${evaluation.overallScore}/100) and published!`, "success");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to evaluate solution.", "error");
    } finally {
      setEvaluatingSolution(false);
    }
  };

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900">Challenge Not Found</h2>
        <button onClick={() => onNavigate("explore")} className="mt-4 text-emerald-600 font-semibold underline text-xs">
          Return to directory
        </button>
      </div>
    );
  }

  const isSupported = user ? challenge.supporters?.includes(user.id) : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <button
          onClick={() => onNavigate("explore")}
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Challenges
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSupport}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isSupported ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSupported ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{challenge.supportCount} Support</span>
          </button>

          <button
            onClick={handleSave}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-amber-600 transition"
            title="Save Challenge"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-400 hover:text-rose-600 transition"
            title="Report or flag content"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          <button
            onClick={() => setProposingSolution(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Propose Solution
          </button>
        </div>
      </div>

      {/* Hero Problem Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {challenge.category}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                challenge.urgency === "critical" ? "bg-rose-100 text-rose-800" :
                challenge.urgency === "high" ? "bg-amber-100 text-amber-800" :
                "bg-stone-100 text-stone-700"
              }`}>
                {challenge.urgency} Urgency
              </span>
              <span className="text-xs text-stone-500 font-medium">
                Reported by {challenge.creatorName} ({challenge.creatorOrg || challenge.creatorRole})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
              {challenge.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{challenge.location.district}, {challenge.location.state}, India</span>
              <span className="text-stone-300">•</span>
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Logged {new Date(challenge.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Core Problem Narrative */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Problem Statement</h3>
              <p className="text-sm text-stone-800 leading-relaxed font-normal">
                {challenge.description}
              </p>
            </div>

            {challenge.targetCommunity && (
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 space-y-1">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Target Affected Community
                </div>
                <div className="text-xs text-stone-700">{challenge.targetCommunity}</div>
              </div>
            )}

            {/* Field Context Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
              {challenge.currentSituation && (
                <div>
                  <span className="font-bold text-stone-900 block mb-1">Current Workarounds:</span>
                  <span className="text-stone-600 leading-relaxed">{challenge.currentSituation}</span>
                </div>
              )}
              {challenge.rootCause && (
                <div>
                  <span className="font-bold text-stone-900 block mb-1">Local Perspective on Cause:</span>
                  <span className="text-stone-600 leading-relaxed">{challenge.rootCause}</span>
                </div>
              )}
              {challenge.constraints && (
                <div>
                  <span className="font-bold text-stone-900 block mb-1">Operating Constraints:</span>
                  <span className="text-stone-600 leading-relaxed">{challenge.constraints}</span>
                </div>
              )}
              {challenge.desiredOutcome && (
                <div>
                  <span className="font-bold text-stone-900 block mb-1">Desired Outcome:</span>
                  <span className="text-stone-600 leading-relaxed">{challenge.desiredOutcome}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Structured Analysis Box */}
          {challenge.aiAnalysis && (
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl border border-emerald-200/80 p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Gemini AI Synthesis & Diagnostic</h3>
                    <span className="text-[10px] text-emerald-800 font-medium">Model: {challenge.aiAnalysis.modelVersion || "gemini-3.8-flash"}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-stone-500">Severity Rating</div>
                  <div className="font-mono font-extrabold text-stone-900 text-base">{challenge.aiAnalysis.severity}/100</div>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                {challenge.aiAnalysis.summary}
              </p>

              {/* Identified Root Causes */}
              <div>
                <span className="text-xs font-bold text-stone-900 block mb-1.5">Structural Root Causes:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(challenge.aiAnalysis.rootCauses || []).map((rc, i) => (
                    <div key={i} className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60 text-xs text-stone-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                      <span>{rc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Solution Interventions */}
              <div>
                <span className="text-xs font-bold text-stone-900 block mb-1.5">Recommended Co-Design Interventions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(challenge.aiAnalysis.suggestedSolutionAreas || []).map((sa, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200 text-xs text-emerald-900 font-medium shadow-2xs">
                      {sa}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mandatory Responsible AI Safety Label */}
              <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>AI-generated recommendation — verify with field stakeholders before making deployment decisions.</span>
              </div>
            </div>
          )}

          {/* PROPOSED SOLUTIONS SECTION */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-emerald-600" />
                  Proposed Solutions ({solutions.length})
                </h3>
                <p className="text-xs text-stone-500">Evaluated solutions and academic prototypes.</p>
              </div>

              <button
                onClick={() => setProposingSolution(true)}
                className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Submit Proposal
              </button>
            </div>

            {solutions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3">
                <Lightbulb className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500">No solutions submitted yet. Be the first university, student, or industry team to propose an intervention.</p>
                <button
                  onClick={() => setProposingSolution(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Propose a Solution
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {solutions.map((sol) => (
                  <div key={sol.id} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {sol.status}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">By {sol.authorName} ({sol.authorOrg || sol.authorRole})</span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-base">{sol.title}</h4>
                      </div>

                      {sol.evaluation && (
                        <div className="text-right shrink-0 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Overall Viability</div>
                          <div className="font-mono font-extrabold text-emerald-700 text-base">{sol.evaluation.overallScore} / 100</div>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">{sol.description}</p>

                    {/* Approach & Tech */}
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs space-y-1">
                      <div><strong className="text-stone-900">Technical Approach:</strong> {sol.proposedApproach}</div>
                      <div><strong className="text-stone-900">Tech Stack / Hardware:</strong> {sol.technology}</div>
                      <div><strong className="text-stone-900">Estimated Cost Range:</strong> {sol.estimatedCostRange}</div>
                    </div>

                    {/* AI Evaluation Metrics Breakdown */}
                    {sol.evaluation && (
                      <div className="pt-2 border-t border-stone-100 space-y-2">
                        <div className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            AI 7-Dimension Viability Benchmark
                          </span>
                          <span className="text-stone-400 font-normal text-[10px]">AI-assisted evaluation</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <span className="text-[10px] text-stone-500 block">Feasibility</span>
                            <span className="font-mono font-bold text-stone-900">{sol.evaluation.feasibility}%</span>
                          </div>
                          <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <span className="text-[10px] text-stone-500 block">Social Impact</span>
                            <span className="font-mono font-bold text-stone-900">{sol.evaluation.socialImpact}%</span>
                          </div>
                          <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <span className="text-[10px] text-stone-500 block">Scalability</span>
                            <span className="font-mono font-bold text-stone-900">{sol.evaluation.scalability}%</span>
                          </div>
                          <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <span className="text-[10px] text-stone-500 block">Cost Effective</span>
                            <span className="font-mono font-bold text-stone-900">{sol.evaluation.costEffectiveness}%</span>
                          </div>
                        </div>

                        {/* Strengths & Risks bullet chips */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                            <span className="font-bold text-emerald-900 block mb-1">Key Strengths:</span>
                            <ul className="list-disc list-inside text-emerald-800 space-y-0.5 text-[11px]">
                              {(sol.evaluation.strengths || []).slice(0, 2).map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                            <span className="font-bold text-amber-900 block mb-1">Critical Risks & Mitigations:</span>
                            <ul className="list-disc list-inside text-amber-800 space-y-0.5 text-[11px]">
                              {(sol.evaluation.risks || []).slice(0, 2).map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PUBLIC DISCUSSION & AI SUMMARIZER */}
          <div className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Community Dialogue & Feedback ({comments.length})
                </h3>
                <p className="text-xs text-stone-500">Citizens, faculty, and industry discussing field implementation.</p>
              </div>

              <button
                onClick={handleSummarizeDiscussion}
                disabled={summarizingDiscussion || comments.length === 0}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1.5 self-start sm:self-auto transition"
              >
                <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${summarizingDiscussion ? "animate-spin" : ""}`} />
                {summarizingDiscussion ? "Synthesizing..." : "Summarize Dialogue with AI"}
              </button>
            </div>

            {/* AI Discussion Summary Box */}
            {discussionSummary && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-3 text-xs animate-in fade-in">
                <div className="flex items-center justify-between text-indigo-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Intelligence Synthesis from Dialogue
                  </span>
                  <button onClick={() => setDiscussionSummary(null)} className="text-stone-400 hover:text-stone-700">
                    Dismiss
                  </button>
                </div>
                <p className="text-stone-700 leading-relaxed">{discussionSummary.summary}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/80 p-3 rounded-xl border border-indigo-100">
                    <span className="font-bold text-stone-900 block mb-1">Key Action Items:</span>
                    <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                      {(discussionSummary.actionItems || []).map((ai: string, i: number) => (
                        <li key={i}>{ai}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-indigo-100">
                    <span className="font-bold text-stone-900 block mb-1">Recurring Suggestions:</span>
                    <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                      {(discussionSummary.recurringSuggestions || []).map((rs: string, i: number) => (
                        <li key={i}>{rs}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comm) => (
                <div key={comm.id} className="bg-white rounded-xl border border-stone-200 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-stone-800 text-white font-bold flex items-center justify-center text-[10px]">
                        {comm.userName.charAt(0)}
                      </div>
                      <span className="font-bold text-stone-900">{comm.userName}</span>
                      <span className="text-[10px] text-stone-400">({comm.userOrg || comm.userRole})</span>
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed pl-8">{comm.content}</p>
                  <div className="pl-8 pt-1 flex items-center gap-4 text-stone-500 text-[11px]">
                    <button
                      onClick={() => {
                        if (!user) return;
                        StorageService.toggleLikeComment(comm.id, user.id);
                        setComments(StorageService.getComments(challenge.id));
                      }}
                      className="flex items-center gap-1 hover:text-stone-900"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comm.likesCount || 0}</span>
                    </button>
                    {comm.isActionItem && (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        Action Item
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Box */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add perspective, local data, or technical question..."
                className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: AI Partner Matching & Details (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Partner Matching Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-sm">Recommended Partner Institutions</h3>
              </div>
              <button onClick={() => fetchMatches(challenge)} title="Re-match partners" className="text-stone-400 hover:text-emerald-600">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMatches ? "animate-spin" : ""}`} />
              </button>
            </div>

            <p className="text-[11px] text-stone-500 leading-snug">
              Gemini analyzed faculty domains, patents, and corporate CSR mandates to identify prime institutional matches.
            </p>

            {loadingMatches ? (
              <div className="py-8 text-center text-xs text-stone-400 space-y-2">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-emerald-600" />
                <span>Matching universities & industry...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {(orgMatches || []).map((om, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-stone-900 text-xs">{om.organizationName}</div>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px] shrink-0">
                        {om.matchScore}% Match
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">{om.type}</div>
                    <p className="text-[11px] text-stone-600 leading-snug">{om.reason}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(om.relevantCapabilities || []).map((rc, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[9px] text-stone-600">
                          {rc}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Workspace Banner */}
          {challenge.projectCount > 0 && (
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-5 space-y-3 text-xs">
              <div className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Active Collaboration Workspace
              </div>
              <p className="text-indigo-800 leading-relaxed">
                An inter-disciplinary team is currently executing a field pilot for this challenge.
              </p>
              <button
                onClick={() => onNavigate("workspace", "proj-301")}
                className="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs hover:bg-indigo-700 transition"
              >
                Open Project Workspace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PROPOSE SOLUTION MODAL */}
      {proposingSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-lg">Propose an Engineered Solution</h3>
                <p className="text-xs text-stone-500">For: {challenge.title}</p>
              </div>
              <button onClick={() => setProposingSolution(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">Solution Title *</label>
                <input
                  type="text"
                  value={solTitle}
                  onChange={(e) => setSolTitle(e.target.value)}
                  placeholder="e.g. Solar-Assisted Alumina & Bio-Char Adsorption Kiosk"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">Executive Summary *</label>
                <textarea
                  value={solDescription}
                  onChange={(e) => setSolDescription(e.target.value)}
                  rows={3}
                  placeholder="Summarize the core innovation, how it works in the field, and expected outcomes..."
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">Proposed Technical Approach</label>
                  <textarea
                    value={solApproach}
                    onChange={(e) => setSolApproach(e.target.value)}
                    rows={2}
                    placeholder="Step-by-step engineering or operational method..."
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">Technologies & Components</label>
                  <textarea
                    value={solTech}
                    onChange={(e) => setSolTech(e.target.value)}
                    rows={2}
                    placeholder="Hardware, software, sensors, materials..."
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">Estimated Cost Range</label>
                  <input
                    type="text"
                    value={solCost}
                    onChange={(e) => setSolCost(e.target.value)}
                    placeholder="e.g. ₹2,50,000 - ₹3,00,000"
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">Implementation Timeline</label>
                  <input
                    type="text"
                    value={solTime}
                    onChange={(e) => setSolTime(e.target.value)}
                    placeholder="e.g. 3 months to field prototype"
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* AI Benchmarking callout */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Gemini Automated 7-Dimension Feasibility Scoring
                </div>
                <div>Submitting will instantly evaluate Feasibility, Scalability, Social Impact, Cost Effectiveness, Sustainability, and Complexity.</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProposingSolution(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={evaluatingSolution}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-2"
                >
                  {evaluatingSolution ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Evaluating via Gemini...
                    </>
                  ) : (
                    <>Submit & Run AI Evaluation</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT CONTENT MODAL */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="challenge"
        targetId={challenge.id}
        targetTitle={challenge.title}
      />
    </div>
  );
};
