import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

import { analyzeChallenge } from "./src/services/gemini/challengeAnalyzer";
import { detectSimilarChallenges } from "./src/services/gemini/similarityDetector";
import { matchOrganizations } from "./src/services/gemini/organizationMatcher";
import { evaluateSolution, assistSolutionDrafting } from "./src/services/gemini/solutionEvaluator";
import { summarizeDiscussion } from "./src/services/gemini/discussionSummarizer";
import { askProjectAssistant } from "./src/services/gemini/projectAssistant";
import { parseNaturalLanguageQuery } from "./src/services/gemini/naturalLanguageSearch";

const PORT = 3000;

async function startServer() {
  const app = express();

  // 1. Mandatory Top-Level Request Deserialization (Ordering Guarantee)
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Basic CORS headers for local/preview safety
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "healthy",
      service: "CivicSolve AI Backend Service",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // --- DEDICATED AI SERVICE LAYER ROUTES ---

  // 1. Challenge Classification & Deep Analysis
  app.post("/api/ai/analyze-challenge", async (req: Request, res: Response) => {
    try {
      const data = (req.body && typeof req.body === "object") ? req.body : {};
      if (!data.title || !data.description) {
        return res.status(400).json({ error: "Missing required challenge title or description." });
      }
      const analysis = await analyzeChallenge({
        title: String(data.title),
        description: String(data.description),
        location: data.location || { state: "General", district: "General" },
        category: data.category,
        targetCommunity: data.targetCommunity,
        urgency: data.urgency,
        currentSituation: data.currentSituation,
        rootCause: data.rootCause,
      });
      res.json({ success: true, data: analysis });
    } catch (err: any) {
      console.error("[API analyze-challenge error]", err);
      res.status(500).json({ error: err.message || "Failed to analyze challenge." });
    }
  });

  // 2. Similarity & Duplicate Detection
  app.post("/api/ai/detect-similarity", async (req: Request, res: Response) => {
    try {
      const data = (req.body && typeof req.body === "object") ? req.body : {};
      const newChallenge = data.challenge || {};
      const existing = Array.isArray(data.existingChallenges) ? data.existingChallenges : [];
      const result = await detectSimilarChallenges(newChallenge, existing);
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error("[API detect-similarity error]", err);
      res.status(500).json({ error: err.message || "Failed to detect duplicates." });
    }
  });

  // 3. Organization & Expert Matching
  app.post("/api/ai/match-organizations", async (req: Request, res: Response) => {
    try {
      const data = (req.body && typeof req.body === "object") ? req.body : {};
      if (!data.challenge) {
        return res.status(400).json({ error: "Challenge object is required." });
      }
      const matches = await matchOrganizations(data.challenge);
      res.json({ success: true, data: matches });
    } catch (err: any) {
      console.error("[API match-organizations error]", err);
      res.status(500).json({ error: err.message || "Failed to match organizations." });
    }
  });

  // 4. Solution Evaluation
  app.post("/api/ai/evaluate-solution", async (req: Request, res: Response) => {
    try {
      const data = (req.body && typeof req.body === "object") ? req.body : {};
      const evaluation = await evaluateSolution({
        challengeTitle: String(data.challengeTitle || "Challenge"),
        challengeDescription: String(data.challengeDescription || ""),
        solutionTitle: String(data.solutionTitle || "Solution"),
        description: String(data.description || ""),
        proposedApproach: String(data.proposedApproach || ""),
        technology: String(data.technology || ""),
        requiredResources: String(data.requiredResources || ""),
        expectedImpact: String(data.expectedImpact || ""),
        estimatedImplementationTime: String(data.estimatedImplementationTime || ""),
        estimatedCostRange: String(data.estimatedCostRange || ""),
      });
      res.json({ success: true, data: evaluation });
    } catch (err: any) {
      console.error("[API evaluate-solution error]", err);
      res.status(500).json({ error: err.message || "Failed to evaluate solution." });
    }
  });

  // 5. Solution Drafting Assistant
  app.post("/api/ai/assist-solution", async (req: Request, res: Response) => {
    try {
      const data = (req.body && typeof req.body === "object") ? req.body : {};
      const suggestions = await assistSolutionDrafting(data);
      res.json({ success: true, data: suggestions });
    } catch (err: any) {
      console.error("[API assist-solution error]", err);
      res.status(500).json({ error: err.message || "Failed to generate drafting guidance." });
    }
  });

  // 6. Discussion Summarizer & Action Item Extractor
  app.post("/api/ai/summarize-discussion", async (req: Request, res: Response) => {
    try {
      const data = (req.body && typeof req.body === "object") ? req.body : {};
      const comments = Array.isArray(data.comments) ? data.comments : [];
      const title = String(data.challengeTitle || "Community Discussion");
      const summary = await summarizeDiscussion(comments, title);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      console.error("[API summarize-discussion error]", err);
      res.status(500).json({ error: err.message || "Failed to summarize discussion." });
    }
  });

  // 7. Project Assistant (Progress, Risks, Milestones, Tasks)
  app.post("/api/ai/project-assistant", async (req: Request, res: Response) => {
    try {
      const data = (req.body && typeof req.body === "object") ? req.body : {};
      if (!data.project || !data.prompt) {
        return res.status(400).json({ error: "Project object and prompt string are required." });
      }
      const response = await askProjectAssistant(
        data.project,
        String(data.prompt),
        Array.isArray(data.history) ? data.history : []
      );
      res.json({ success: true, data: response });
    } catch (err: any) {
      console.error("[API project-assistant error]", err);
      res.status(500).json({ error: err.message || "Failed to get project assistance." });
    }
  });

  // 8. Natural Language Search Parser
  app.post("/api/ai/natural-search", async (req: Request, res: Response) => {
    try {
      const data = (req.body && typeof req.body === "object") ? req.body : {};
      const query = String(data.query || "").trim();
      if (!query) {
        return res.status(400).json({ error: "Query cannot be empty." });
      }
      const parsedFilters = await parseNaturalLanguageQuery(query);
      res.json({ success: true, data: parsedFilters });
    } catch (err: any) {
      console.error("[API natural-search error]", err);
      res.status(500).json({ error: err.message || "Failed to parse natural query." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CivicSolve AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
