import { generateContentWithFallback, cleanJsonOutput } from "./geminiClient";
import { Challenge } from "../../types";

export interface SimilarityResult {
  hasSimilar: boolean;
  similarChallenges: {
    id: string;
    title: string;
    similarityScore: number; // 0 to 100
    reason: string;
    collaborationPotential: string;
  }[];
  recommendation: string;
}

export async function detectSimilarChallenges(
  newChallenge: { title: string; description: string; category?: string; state?: string },
  existingChallenges: Challenge[]
): Promise<SimilarityResult> {
  if (!existingChallenges || existingChallenges.length === 0) {
    return {
      hasSimilar: false,
      similarChallenges: [],
      recommendation: "No existing challenges to compare against. This submission represents a novel entry.",
    };
  }

  // Pre-filter candidate list to top 15 most relevant by category or keywords to optimize token consumption
  const candidateSummary = existingChallenges.slice(0, 15).map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    district: c.location.district,
    state: c.location.state,
    snippet: c.description.slice(0, 150),
  }));

  const prompt = `
You are the Duplicate & Similarity Analysis Engine for CivicSolve AI.
A user wants to submit this new challenge:
- Title: ${newChallenge.title}
- Description: ${newChallenge.description}
- Category: ${newChallenge.category || "Unspecified"}
- State: ${newChallenge.state || "Unspecified"}

Here are existing challenges on the platform:
${JSON.stringify(candidateSummary, null, 2)}

Analyze semantic similarity, thematic overlap, and geographic proximity.
Identify if any of these existing challenges overlap significantly with the new challenge.
Return valid JSON only matching this schema:
{
  "hasSimilar": boolean,
  "similarChallenges": [
    {
      "id": "matching_id",
      "title": "matching_title",
      "similarityScore": 85, // integer 0-100
      "reason": "Clear explanation of semantic or operational overlap",
      "collaborationPotential": "Specific way these two initiatives could combine forces (e.g. joint university pilot, shared dataset)"
    }
  ],
  "recommendation": "Advice to the user on whether to merge, join existing discussion, or proceed as a distinct sub-problem."
}
Only include challenges with similarityScore >= 60. Sort with highest score first.
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
      hasSimilar: Boolean(parsed.hasSimilar && parsed.similarChallenges?.length > 0),
      similarChallenges: Array.isArray(parsed.similarChallenges) ? parsed.similarChallenges : [],
      recommendation: String(parsed.recommendation || "Review existing initiatives to explore partnership."),
    };
  } catch (err) {
    console.error("[detectSimilarChallenges error]", err);
    // Simple text-based fallback
    const terms = newChallenge.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matches = existingChallenges
      .map(c => {
        let score = 0;
        const cText = (c.title + " " + c.category + " " + c.description).toLowerCase();
        for (const t of terms) {
          if (cText.includes(t)) score += 20;
        }
        if (c.category.toLowerCase() === (newChallenge.category || "").toLowerCase()) score += 25;
        if (c.location.state.toLowerCase() === (newChallenge.state || "").toLowerCase()) score += 15;
        return {
          id: c.id,
          title: c.title,
          similarityScore: Math.min(95, score),
          reason: "Shares sectoral keywords and geographic proximity.",
          collaborationPotential: "Consider sharing research insights or co-developing a joint pilot proposal.",
        };
      })
      .filter(m => m.similarityScore >= 50)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 3);

    return {
      hasSimilar: matches.length > 0,
      similarChallenges: matches,
      recommendation: matches.length > 0 
        ? "We detected related existing challenges. You may want to review them before creating a duplicate entry."
        : "No significant duplicates detected.",
    };
  }
}
