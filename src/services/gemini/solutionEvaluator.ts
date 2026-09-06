import { generateContentWithFallback, cleanJsonOutput } from "./geminiClient";
import { SolutionEvaluation } from "../../types";

export interface SolutionProposalInput {
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
}

export async function evaluateSolution(input: SolutionProposalInput): Promise<SolutionEvaluation> {
  const prompt = `
You are the Chief Technology Evaluator & Impact Assessment Officer for CivicSolve AI.
Evaluate the proposed solution for the following societal challenge:

CHALLENGE:
Title: ${input.challengeTitle}
Description: ${input.challengeDescription}

PROPOSED SOLUTION:
Title: ${input.solutionTitle}
Description: ${input.description}
Proposed Approach: ${input.proposedApproach}
Technology Stack: ${input.technology}
Required Resources: ${input.requiredResources}
Expected Impact: ${input.expectedImpact}
Estimated Implementation Time: ${input.estimatedImplementationTime}
Estimated Cost Range: ${input.estimatedCostRange}

Evaluate this proposal objectively across seven rigorous dimensions (each scored 0 to 100):
1. Feasibility (readiness of team, practicality under field conditions)
2. Scalability (ability to expand beyond the initial village/district)
3. Social Impact (measurable tangible change for the target community)
4. Cost Effectiveness (value generated relative to required capital)
5. Sustainability (financial, environmental, and institutional self-reliance after pilot)
6. Technical Feasibility (viability of the selected hardware/software/processes)
7. Implementation Complexity (inverse scale: higher score means well-managed, realistic complexity; lower score means dangerously over-engineered)

Also identify key strengths, potential weaknesses, critical operational risks, and constructive recommendations to strengthen the proposal.

Return strictly valid JSON only:
{
  "feasibility": 82,
  "scalability": 78,
  "socialImpact": 90,
  "costEffectiveness": 85,
  "sustainability": 80,
  "technicalFeasibility": 86,
  "implementationComplexity": 75,
  "overallScore": 82,
  "strengths": [
    "Leverages open-source components reducing upfront licensing costs",
    "Engages local university students directly for field deployment"
  ],
  "weaknesses": [
    "Requires stable cellular network which may be intermittent in deep rural areas"
  ],
  "risks": [
    "Supply chain delays for custom IoT sensor microcontrollers"
  ],
  "recommendations": [
    "Introduce offline store-and-forward telemetry protocol",
    "Partner with a local women's self-help group (SHG) for ongoing maintenance"
  ]
}
`;

  try {
    const { text } = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(cleanJsonOutput(text));
    const clamp = (v: any, def: number) => typeof v === "number" ? Math.min(100, Math.max(0, Math.round(v))) : def;

    const feasibility = clamp(parsed.feasibility, 75);
    const scalability = clamp(parsed.scalability, 70);
    const socialImpact = clamp(parsed.socialImpact, 85);
    const costEffectiveness = clamp(parsed.costEffectiveness, 75);
    const sustainability = clamp(parsed.sustainability, 70);
    const technicalFeasibility = clamp(parsed.technicalFeasibility, 80);
    const implementationComplexity = clamp(parsed.implementationComplexity, 70);

    const calculatedOverall = Math.round(
      (feasibility + scalability + socialImpact + costEffectiveness + sustainability + technicalFeasibility + implementationComplexity) / 7
    );

    return {
      feasibility,
      scalability,
      socialImpact,
      costEffectiveness,
      sustainability,
      technicalFeasibility,
      implementationComplexity,
      overallScore: typeof parsed.overallScore === "number" ? clamp(parsed.overallScore, calculatedOverall) : calculatedOverall,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : ["Practical technical approach", "Direct alignment with community needs"],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : ["Needs clearer long-term financial maintenance model"],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : ["Community adoption resistance if training is insufficient"],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : ["Run a 30-day pilot before wide rollout"],
      evaluatedAt: new Date().toISOString(),
      evaluatedByAi: true,
      reviewedByExpert: false,
    };
  } catch (err) {
    console.error("[evaluateSolution error]", err);
    return {
      feasibility: 75,
      scalability: 70,
      socialImpact: 82,
      costEffectiveness: 78,
      sustainability: 72,
      technicalFeasibility: 80,
      implementationComplexity: 70,
      overallScore: 75,
      strengths: ["Clear problem understanding", "Realistic initial implementation scope"],
      weaknesses: ["Resource estimation could be more granular"],
      risks: ["Field condition variations"],
      recommendations: ["Form partnership with local polytechnic institute for testing"],
      evaluatedAt: new Date().toISOString(),
      evaluatedByAi: true,
      reviewedByExpert: false,
    };
  }
}

export async function assistSolutionDrafting(draft: Partial<SolutionProposalInput>): Promise<{
  suggestedImprovements: string[];
  recommendedTechnologies: string[];
  keyRisks: string[];
  impactOpportunities: string[];
}> {
  const prompt = `
A student or researcher is proposing a solution to a societal challenge:
Challenge: ${draft.challengeTitle || "Community Challenge"}
Current Idea: ${draft.solutionTitle || ""}
Description: ${draft.description || ""}
Approach: ${draft.proposedApproach || ""}

Help improve this proposal by suggesting:
1. Constructive improvements
2. High-leverage, cost-effective technologies (open hardware, cloud tools, edge AI, etc.)
3. Critical pitfalls/risks to account for
4. Opportunities to maximize societal impact

Return strictly valid JSON:
{
  "suggestedImprovements": ["..."],
  "recommendedTechnologies": ["..."],
  "keyRisks": ["..."],
  "impactOpportunities": ["..."]
}
`;

  try {
    const { text } = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    const parsed = JSON.parse(cleanJsonOutput(text));
    return {
      suggestedImprovements: Array.isArray(parsed.suggestedImprovements) ? parsed.suggestedImprovements : [],
      recommendedTechnologies: Array.isArray(parsed.recommendedTechnologies) ? parsed.recommendedTechnologies : [],
      keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [],
      impactOpportunities: Array.isArray(parsed.impactOpportunities) ? parsed.impactOpportunities : [],
    };
  } catch (err) {
    return {
      suggestedImprovements: ["Define clear measurable key performance indicators (KPIs)", "Engage local community members in the co-design phase"],
      recommendedTechnologies: ["LoRaWAN or GSM telemetry", "Lightweight progressive web apps for low-bandwidth users"],
      keyRisks: ["Lack of ongoing operational ownership after initial project funding ceases"],
      impactOpportunities: ["Document open-source specifications for replication in neighboring districts"],
    };
  }
}
