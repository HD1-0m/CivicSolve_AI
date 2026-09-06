import { 
  AIAnalysis, 
  Challenge, 
  Solution, 
  SolutionEvaluation, 
  Project, 
  Comment, 
  OrganizationMatch 
} from "../types";
import { ChallengeInput } from "./gemini/challengeAnalyzer";
import { SimilarityResult } from "./gemini/similarityDetector";
import { DiscussionSummary } from "./gemini/discussionSummarizer";
import { AssistantResponse } from "./gemini/projectAssistant";
import { StructuredSearchFilters } from "./gemini/naturalLanguageSearch";

export const ApiClient = {
  async analyzeChallenge(input: ChallengeInput): Promise<AIAnalysis> {
    const res = await fetch("/api/ai/analyze-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  async detectSimilarity(newChallenge: Partial<Challenge>, existingChallenges: Challenge[]): Promise<SimilarityResult> {
    const res = await fetch("/api/ai/detect-similarity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challenge: {
          title: newChallenge.title,
          description: newChallenge.description,
          category: newChallenge.category,
          state: newChallenge.location?.state,
        },
        existingChallenges,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  async matchOrganizations(challenge: Challenge): Promise<OrganizationMatch[]> {
    const res = await fetch("/api/ai/match-organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  async evaluateSolution(payload: {
    challengeTitle: string;
    challengeDescription: string;
    solutionTitle: string;
    description: string;
    proposedApproach: string;
    technology: string;
    requiredResources: string;
    expectedImpact: string;
    estimatedImplementationTime: string;
    estimatedCostRange: string;
  }): Promise<SolutionEvaluation> {
    const res = await fetch("/api/ai/evaluate-solution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  async assistSolutionDraft(draft: Partial<Solution>): Promise<{
    suggestedImprovements: string[];
    recommendedTechnologies: string[];
    keyRisks: string[];
    impactOpportunities: string[];
  }> {
    const res = await fetch("/api/ai/assist-solution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  async summarizeDiscussion(comments: Comment[], challengeTitle: string): Promise<DiscussionSummary> {
    const res = await fetch("/api/ai/summarize-discussion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments, challengeTitle }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  async askProjectAssistant(
    project: Project,
    prompt: string,
    history: { role: 'user' | 'assistant'; text: string }[] = []
  ): Promise<AssistantResponse> {
    const res = await fetch("/api/ai/project-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, prompt, history }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  async parseNaturalSearch(query: string): Promise<StructuredSearchFilters> {
    const res = await fetch("/api/ai/natural-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },
};
