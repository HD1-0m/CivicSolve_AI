import { generateContentWithFallback, cleanJsonOutput } from "./geminiClient";

export interface StructuredSearchFilters {
  queryKeywords: string[];
  category?: string;
  state?: string;
  district?: string;
  urgency?: string;
  targetOrgType?: string;
  sdgGoal?: string;
  explanation: string;
}

export async function parseNaturalLanguageQuery(naturalQuery: string): Promise<StructuredSearchFilters> {
  const prompt = `
You are the Natural Language Query Parser for CivicSolve AI.
Convert the user's conversational search query into structured search filters.

User Query: "${naturalQuery}"

Available Categories:
- "Water & Sanitation"
- "Healthcare & Public Health"
- "Agriculture & Food Security"
- "Education & Skill Development"
- "Clean Energy & Climate"
- "Rural Infrastructure"
- "Urban Mobility & Planning"
- "Waste Management & Circular Economy"
- "Digital Inclusion & Governance"

Extract the following fields into valid JSON:
{
  "queryKeywords": ["keyword1", "keyword2"],
  "category": "Matched category or null if general",
  "state": "State name if specified (e.g. Maharashtra, Tamil Nadu, Karnataka, etc.) or null",
  "district": "District name if specified or null",
  "urgency": "low" | "medium" | "high" | "critical" | null,
  "targetOrgType": "University" | "Industry" | "NGO" | null,
  "sdgGoal": "Relevant SDG number or name, e.g. 'SDG 6: Clean Water' or null",
  "explanation": "Friendly 1-sentence explanation of how the query was interpreted"
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
      queryKeywords: Array.isArray(parsed.queryKeywords) ? parsed.queryKeywords.map(String) : [naturalQuery],
      category: parsed.category || undefined,
      state: parsed.state || undefined,
      district: parsed.district || undefined,
      urgency: parsed.urgency || undefined,
      targetOrgType: parsed.targetOrgType || undefined,
      sdgGoal: parsed.sdgGoal || undefined,
      explanation: parsed.explanation || `Filtered challenges matching "${naturalQuery}"`,
    };
  } catch (err) {
    console.error("[parseNaturalLanguageQuery error]", err);
    return {
      queryKeywords: naturalQuery.split(" ").filter(w => w.length > 2),
      explanation: `Keyword search based on "${naturalQuery}"`,
    };
  }
}
