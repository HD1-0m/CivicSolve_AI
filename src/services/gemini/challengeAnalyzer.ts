import { generateContentWithFallback, cleanJsonOutput } from "./geminiClient";
import { AIAnalysis, ChallengeUrgency } from "../../types";

export interface ChallengeInput {
  title: string;
  description: string;
  location: { state: string; district: string; country?: string };
  category?: string;
  targetCommunity?: string;
  urgency?: string;
  currentSituation?: string;
  rootCause?: string;
}

export async function analyzeChallenge(input: ChallengeInput): Promise<AIAnalysis> {
  const prompt = `
You are the Chief Civic Technologist and Data Scientist for CivicSolve AI, a platform that connects citizens, universities, and industries to solve real-world societal problems.

Analyze the following societal challenge carefully:
Title: ${input.title}
Description: ${input.description}
Location: ${input.location.district}, ${input.location.state}, ${input.location.country || "India"}
Category: ${input.category || "Uncategorized"}
Target Community: ${input.targetCommunity || "General public"}
Reported Urgency: ${input.urgency || "medium"}
Current Situation: ${input.currentSituation || "N/A"}
User-Identified Root Cause: ${input.rootCause || "N/A"}

Please generate a comprehensive, structured analysis in valid JSON format matching this exact schema:
{
  "summary": "Concise 2-3 sentence distillation of the core societal bottleneck",
  "category": "Primary sector (e.g. Water & Sanitation, Healthcare, Agriculture & Food, Education, Clean Energy, Rural Infrastructure, Urban Mobility, Waste Management, Climate Resilience, Digital Inclusion)",
  "subcategory": "Specific operational domain (e.g. Groundwater Contamination, Post-harvest Cold Storage)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "rootCauses": ["Structural or systemic cause 1", "Cause 2", "Cause 3"],
  "severity": 85, // integer 1 to 100
  "urgency": "low" | "medium" | "high" | "critical",
  "potentialSocialImpact": "Clear statement of potential beneficiary scale and long-term societal return",
  "impactAreas": ["Public Health", "Economic Livelihood", "Environmental Protection"],
  "sdgGoals": ["SDG 6: Clean Water and Sanitation", "SDG 3: Good Health and Well-being"],
  "requiredSkills": ["Hydrological Engineering", "IoT Sensor Design", "Community Water Governance"],
  "recommendedOrganizationTypes": ["Technical Universities", "Rural Water Supply Departments", "Agritech Startups", "Water NGOs"],
  "suggestedSolutionAreas": ["Low-cost IoT water quality monitoring", "Solar-powered decentralized filtration", "Panchayat-level maintenance training"]
}

Rules:
- Respond strictly with JSON only. No surrounding conversational chatter.
- Provide objective, scientifically sound root causes and actionable suggested solution areas.
`;

  try {
    const { text, modelUsed } = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(cleanJsonOutput(text));

    // Validate and sanitize output with defensive defaults
    const validUrgency: ChallengeUrgency = ["low", "medium", "high", "critical"].includes(parsed.urgency)
      ? (parsed.urgency as ChallengeUrgency)
      : "medium";

    return {
      summary: String(parsed.summary || input.description.slice(0, 160)),
      category: String(parsed.category || input.category || "General Societal Development"),
      subcategory: String(parsed.subcategory || "Civic Innovation"),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : ["civic", "problem-solving"],
      rootCauses: Array.isArray(parsed.rootCauses) ? parsed.rootCauses.map(String) : ["Systemic coordination deficit"],
      severity: typeof parsed.severity === "number" ? Math.min(100, Math.max(1, Math.round(parsed.severity))) : 70,
      urgency: validUrgency,
      potentialSocialImpact: String(parsed.potentialSocialImpact || "Broad community upliftment"),
      impactAreas: Array.isArray(parsed.impactAreas) ? parsed.impactAreas.map(String) : ["Community Welfare"],
      sdgGoals: Array.isArray(parsed.sdgGoals) ? parsed.sdgGoals.map(String) : ["SDG 11: Sustainable Cities and Communities"],
      requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills.map(String) : ["Project Management", "Domain Expertise"],
      recommendedOrganizationTypes: Array.isArray(parsed.recommendedOrganizationTypes) 
        ? parsed.recommendedOrganizationTypes.map(String) 
        : ["Universities", "Industry Partners", "NGOs"],
      suggestedSolutionAreas: Array.isArray(parsed.suggestedSolutionAreas) 
        ? parsed.suggestedSolutionAreas.map(String) 
        : ["Collaborative research pilot", "Public-private deployment"],
      analyzedAt: new Date().toISOString(),
      modelVersion: modelUsed,
    };
  } catch (err) {
    console.error("[analyzeChallenge error]", err);
    // Fallback heuristic output if API is temporarily unavailable
    return {
      summary: input.description.slice(0, 200),
      category: input.category || "Community Development",
      subcategory: "Regional Infrastructure & Services",
      keywords: [input.title.split(" ")[0] || "challenge", "civic", "impact", "sustainability"],
      rootCauses: ["Lack of coordinated multi-stakeholder framework", "Resource and monitoring limitations"],
      severity: 65,
      urgency: "medium",
      potentialSocialImpact: "Direct improvement for local community members through multi-agency response.",
      impactAreas: ["Community Welfare", "Local Economy", "Environmental Quality"],
      sdgGoals: ["SDG 9: Industry, Innovation & Infrastructure", "SDG 11: Sustainable Cities & Communities"],
      requiredSkills: ["Field Research", "Engineering / Technology Design", "Community Engagement"],
      recommendedOrganizationTypes: ["State Technical Universities", "Local Non-Profits", "Industry CSR Wings"],
      suggestedSolutionAreas: ["Rapid prototype testing with student research teams", "Scalable corporate-sponsored pilot"],
      analyzedAt: new Date().toISOString(),
      modelVersion: "fallback-rule-engine",
    };
  }
}
