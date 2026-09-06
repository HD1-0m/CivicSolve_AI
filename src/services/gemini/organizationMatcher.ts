import { generateContentWithFallback, cleanJsonOutput } from "./geminiClient";
import { Challenge, OrganizationMatch } from "../../types";

export async function matchOrganizations(challenge: Challenge): Promise<OrganizationMatch[]> {
  const prompt = `
You are the AI Partnerships Matchmaker for CivicSolve AI.
Your goal is to recommend the highest-potential institutional partners (Universities, Industry Corporates, Research Labs, NGOs, and Domain Experts) capable of solving the following challenge:

Challenge:
- Title: ${challenge.title}
- Category: ${challenge.category}
- Location: ${challenge.location.district}, ${challenge.location.state}
- Target Community: ${challenge.targetCommunity}
- Urgency: ${challenge.urgency}
- Desired Outcome: ${challenge.desiredOutcome || challenge.description}
- Required Skills: ${challenge.aiAnalysis?.requiredSkills.join(", ") || "Engineering, Community Engagement"}

Please recommend 4-6 diverse, realistic partner profiles across these categories:
1. Premier / Regional Technical University or Research Institute
2. Specialized Industry / Corporate Innovation Partner
3. Grassroots or National Non-Governmental Organization (NGO)
4. Deep-Tech / Impact Startup
5. Leading Academic Expert / Mentorship Group

Return strictly valid JSON matching this schema:
[
  {
    "organizationName": "e.g. Indian Institute of Technology Bombay - Centre for Technology Alternatives for Rural Areas (CTARA)",
    "type": "University" | "Industry" | "NGO" | "Research Institution" | "Startup" | "Mentor Group",
    "matchScore": 94, // integer 70 to 99
    "reason": "Clear explanation of why this partner's faculty, R&D labs, or CSR mandate aligns with this problem.",
    "relevantCapabilities": ["Capability 1", "Capability 2", "Capability 3"],
    "contactEmail": "partnerships@university.edu"
  }
]
`;

  try {
    const { text } = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(cleanJsonOutput(text));
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: any) => ({
        organizationName: String(item.organizationName || "Academic Innovation Hub"),
        type: item.type || "University",
        matchScore: typeof item.matchScore === "number" ? item.matchScore : 88,
        reason: String(item.reason || "High sectoral alignment with problem domain and geographical proximity."),
        relevantCapabilities: Array.isArray(item.relevantCapabilities) ? item.relevantCapabilities.map(String) : ["R&D", "Prototyping"],
        contactEmail: item.contactEmail ? String(item.contactEmail) : undefined,
      }));
    }
  } catch (err) {
    console.error("[matchOrganizations error]", err);
  }

  // Fallback defaults if generation is unavailable
  return [
    {
      organizationName: `State Technological University - Centre for Sustainable Engineering`,
      type: "University",
      matchScore: 92,
      reason: `Specializes in localized technical interventions for ${challenge.category} and offers student capstone research teams.`,
      relevantCapabilities: ["Rapid Prototyping", "Field Research", "Low-Cost Hardware Design"],
      contactEmail: "civic-lab@stateuniversity.edu",
    },
    {
      organizationName: `National Innovation Foundation & Rural Development NGO`,
      type: "NGO",
      matchScore: 89,
      reason: `Established ground presence in ${challenge.location.state} with community trust and grassroots deployment capacity.`,
      relevantCapabilities: ["Community Mobilization", "Impact Assessment", "Last-Mile Delivery"],
      contactEmail: "outreach@ruralinnovation.ngo",
    },
    {
      organizationName: `CleanTech Solutions & Industrial CSR Consortium`,
      type: "Industry",
      matchScore: 86,
      reason: `Provides catalytic grant funding, equipment donations, and corporate mentoring under environmental sustainability directives.`,
      relevantCapabilities: ["CSR Capital", "Supply Chain Scale", "Quality Certification"],
      contactEmail: "sustainability@industrycorp.com",
    },
    {
      organizationName: `Agritech & Civic Impact Startup Studio`,
      type: "Startup",
      matchScore: 84,
      reason: `Agile software & IoT development teams capable of deploying minimum viable products within weeks.`,
      relevantCapabilities: ["Cloud Dashboards", "Telemetry Sensors", "Mobile User Experience"],
      contactEmail: "founder@civictech.io",
    },
  ];
}
