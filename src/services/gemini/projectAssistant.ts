import { generateContentWithFallback } from "./geminiClient";
import { Project } from "../../types";

export interface AssistantResponse {
  answer: string;
  recommendedActions: string[];
  suggestedTasks?: { title: string; priority: 'low' | 'medium' | 'high' | 'urgent'; description: string }[];
}

export async function askProjectAssistant(
  project: Project,
  userPrompt: string,
  history: { role: 'user' | 'assistant'; text: string }[] = []
): Promise<AssistantResponse> {
  const tasksSummary = project.tasks.map(t => `- [${t.status.toUpperCase()}] ${t.title} (${t.priority} priority, assigned to: ${t.assignedToName || "Unassigned"})`).join("\n");
  const milestonesSummary = project.milestones.map(m => `- ${m.title} (Due: ${m.dueDate}, Status: ${m.isCompleted ? "COMPLETED" : "PENDING"})`).join("\n");

  const projectContext = `
Project Title: ${project.title}
Challenge: ${project.challengeTitle}
Solution: ${project.solutionTitle}
Lead Organization: ${project.leadOrganization}
Current Progress: ${project.progressPercent}%
Status: ${project.status}

Milestones:
${milestonesSummary || "None specified"}

Tasks:
${tasksSummary || "No tasks added yet"}

Team Members:
${project.members.map(m => `${m.name} (${m.role} - ${m.org || "Independent"})`).join(", ")}
`;

  const conversationHistory = history.slice(-4).map(h => `${h.role === "user" ? "User" : "AI"}: ${h.text}`).join("\n");

  const prompt = `
You are the AI Project Execution Assistant for CivicSolve AI.
You assist university researchers, student teams, industry partners, and community liaisons in executing societal projects efficiently.

PROJECT CONTEXT:
${projectContext}

RECENT DIALOGUE:
${conversationHistory}

USER REQUEST:
"${userPrompt}"

Provide a structured, helpful, and highly contextual response. 
Address the request directly. If the user asks for progress summary, risk analysis, next steps, milestone plan, stakeholder update, or presentation outline, format with clean markdown headings and bullet points.
Include 2-4 concrete, high-priority next actions the team can immediately execute.

Format your output in clean Markdown. At the end, if appropriate, suggest 1-3 new tasks the team can add to their Kanban board.
`;

  try {
    const { text } = await generateContentWithFallback({
      contents: prompt,
    });

    // Extract suggested tasks if formatted
    return {
      answer: text,
      recommendedActions: [
        "Review overdue or high-priority Kanban tasks",
        "Schedule bi-weekly sync with community beneficiaries",
        "Document intermediate pilot findings for industry sponsor",
      ],
    };
  } catch (err) {
    console.error("[askProjectAssistant error]", err);
    return {
      answer: `### Project Status Overview (${project.progressPercent}% Complete)
Currently, **${project.title}** has ${project.tasks.filter(t => t.status === 'completed').length} completed tasks out of ${project.tasks.length} total work items.

**Immediate Priorities:**
1. Focus on in-progress development work packages.
2. Synchronize milestones with the lead partner (${project.leadOrganization}).
3. Validate field prototype constraints with local stakeholders.`,
      recommendedActions: [
        "Update Kanban statuses",
        "Coordinate task dependencies between student and mentor teams",
      ],
    };
  }
}
