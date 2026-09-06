import React, { useState, useEffect } from "react";
import { Project, Task, Milestone } from "../types";
import { StorageService } from "../services/storage";
import { ApiClient } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { 
  FolderKanban, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign, 
  FileText, 
  Plus, 
  Send, 
  ArrowLeft, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface ProjectWorkspacePageProps {
  projectId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const ProjectWorkspacePage: React.FC<ProjectWorkspacePageProps> = ({
  projectId = "proj-301",
  onNavigate,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [project, setProject] = useState<Project | null>(() => StorageService.getProjectById(projectId) || null);
  const [activeTab, setActiveTab] = useState<"kanban" | "milestones" | "funding" | "assistant">("kanban");

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string; structured?: any }[]>([
    {
      role: "assistant",
      text: "Hello! I am your Gemini Project Assistant for the Shevgaon Solar Water Purification Pilot. How can I assist with milestone planning, risk mitigation, or task sequencing today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [askingAssistant, setAskingAssistant] = useState(false);

  // New task modal / quick add state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCol, setNewTaskCol] = useState<"todo" | "in_progress" | "review" | "completed">("todo");

  useEffect(() => {
    const p = StorageService.getProjectById(projectId);
    if (p) setProject(p);
  }, [projectId]);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900">Project Not Found</h2>
        <button onClick={() => onNavigate("dashboard")} className="mt-4 text-emerald-600 font-semibold underline text-xs">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Kanban tasks grouping with null safety
  const safeTasks = project.tasks || [];
  const safeMembers = project.members || [];
  const safeMilestones = project.milestones || [];
  const safeSponsors = project.funding?.sponsors || [];

  const todoTasks = safeTasks.filter((t) => t.status === "todo");
  const inProgressTasks = safeTasks.filter((t) => t.status === "in_progress");
  const reviewTasks = safeTasks.filter((t) => t.status === "review");
  const doneTasks = safeTasks.filter((t) => t.status === "completed");

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    const updated = StorageService.updateTaskStatus(project.id, taskId, newStatus);
    if (updated) setProject({ ...updated });
    showToast(`Task moved to ${newStatus.replace("_", " ")}`, "info");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      status: newTaskCol,
      priority: "medium",
      assigneeName: user?.name || "Team Member",
      assigneeRole: user?.role || "researcher",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    };

    const updatedTasks = [...project.tasks, newTask];
    const updated = StorageService.saveProject({
      ...project,
      tasks: updatedTasks,
    });
    setProject(updated);
    setNewTaskTitle("");
    showToast("New task created in workspace.", "success");
  };

  // AI Assistant trigger
  const handleAskAssistant = async (queryText?: string) => {
    const promptToSend = queryText || chatInput;
    if (!promptToSend.trim()) return;

    const userMsg = { role: "user" as const, text: promptToSend };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!queryText) setChatInput("");
    setAskingAssistant(true);

    try {
      const response = await ApiClient.askProjectAssistant(
        project,
        promptToSend,
        chatMessages.slice(-4)
      );

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response.answer,
          structured: response,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I encountered a transient error contacting the AI assistant. Please try asking again.",
        },
      ]);
    } finally {
      setAskingAssistant(false);
    }
  };

  // 1-click Add suggested task from AI
  const handleAddSuggestedTask = (st: { title: string; priority: any }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: st.title,
      status: "todo",
      priority: st.priority || "medium",
      assigneeName: "Assigned by AI Assistant",
      assigneeRole: "student",
    };
    const updated = StorageService.saveProject({
      ...project,
      tasks: [...project.tasks, newTask],
    });
    setProject(updated);
    showToast(`Added '${st.title}' directly to Kanban!`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <button
            onClick={() => onNavigate("challenge-detail", project.challengeId)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Challenge
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
              Stage: {project.stage}
            </span>
            <span className="text-xs text-stone-500 font-medium">Project ID: {project.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
            {project.title}
          </h1>
        </div>

        {/* Team Avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {safeMembers.map((m, i) => (
              <div
                key={i}
                title={`${m.name} (${m.role})`}
                className="w-8 h-8 rounded-full bg-stone-800 border-2 border-white text-white font-bold text-xs flex items-center justify-center shadow-xs"
              >
                {m.name.charAt(0)}
              </div>
            ))}
          </div>
          <div className="text-xs text-stone-600 font-medium pl-2">
            {safeMembers.length} Co-designers
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-1 text-xs">
        <button
          onClick={() => setActiveTab("kanban")}
          className={`px-4 py-2 font-semibold rounded-t-lg transition flex items-center gap-1.5 ${
            activeTab === "kanban" ? "bg-white border-t border-x border-stone-200 text-stone-900" : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          Kanban Board ({safeTasks.length})
        </button>

        <button
          onClick={() => setActiveTab("milestones")}
          className={`px-4 py-2 font-semibold rounded-t-lg transition flex items-center gap-1.5 ${
            activeTab === "milestones" ? "bg-white border-t border-x border-stone-200 text-stone-900" : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Milestones ({safeMilestones.length})
        </button>

        <button
          onClick={() => setActiveTab("funding")}
          className={`px-4 py-2 font-semibold rounded-t-lg transition flex items-center gap-1.5 ${
            activeTab === "funding" ? "bg-white border-t border-x border-stone-200 text-stone-900" : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
          CSR Grants & Budget
        </button>

        <button
          onClick={() => setActiveTab("assistant")}
          className={`px-4 py-2 font-semibold rounded-t-lg transition flex items-center gap-1.5 ${
            activeTab === "assistant" ? "bg-emerald-50 text-emerald-900 border-t border-x border-emerald-200" : "text-emerald-700 hover:text-emerald-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Gemini Project Assistant
        </button>
      </div>

      {/* 1. KANBAN TAB */}
      {activeTab === "kanban" && (
        <div className="space-y-4">
          {/* Quick Task Creator */}
          <form onSubmit={handleAddTask} className="flex gap-2 bg-white p-3 rounded-2xl border border-stone-200 text-xs">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Quick add a new collaborative task (e.g. Conduct water sample testing at lab)..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-emerald-600"
            />
            <select
              value={newTaskCol}
              onChange={(e) => setNewTaskCol(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-medium"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </form>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {/* Column 1: To Do */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>To Do</span>
                <span className="bg-stone-200 px-2 py-0.5 rounded-full text-[10px]">{todoTasks.length}</span>
              </div>
              <div className="space-y-2">
                {todoTasks.map((t) => (
                  <div key={t.id} className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-2 shadow-2xs">
                    <div className="font-semibold text-stone-900">{t.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>{t.assigneeName}</span>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, "in_progress")}
                        className="text-emerald-700 font-semibold hover:underline"
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                <span>In Progress</span>
                <span className="bg-sky-100 px-2 py-0.5 rounded-full text-[10px]">{inProgressTasks.length}</span>
              </div>
              <div className="space-y-2">
                {inProgressTasks.map((t) => (
                  <div key={t.id} className="bg-white p-3 rounded-xl border border-sky-200 text-xs space-y-2 shadow-2xs">
                    <div className="font-semibold text-stone-900">{t.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>{t.assigneeName}</span>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, "review")}
                        className="text-sky-700 font-semibold hover:underline"
                      >
                        Review →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Review */}
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>In Review</span>
                <span className="bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">{reviewTasks.length}</span>
              </div>
              <div className="space-y-2">
                {reviewTasks.map((t) => (
                  <div key={t.id} className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-2 shadow-2xs">
                    <div className="font-semibold text-stone-900">{t.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>{t.assigneeName}</span>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, "completed")}
                        className="text-amber-800 font-semibold hover:underline"
                      >
                        Complete ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Done */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>Done</span>
                <span className="bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">{doneTasks.length}</span>
              </div>
              <div className="space-y-2">
                {doneTasks.map((t) => (
                  <div key={t.id} className="bg-white p-3 rounded-xl border border-emerald-200 text-xs space-y-2 shadow-2xs opacity-90">
                    <div className="font-semibold text-stone-700 line-through">{t.title}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MILESTONES TAB */}
      {activeTab === "milestones" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
          <h3 className="font-bold text-stone-900 text-base">Project Milestones & Verification Gates</h3>
          <div className="space-y-4">
            {safeMilestones.map((ms, idx) => (
              <div key={ms.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{ms.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      ms.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                      ms.status === "in_progress" ? "bg-sky-100 text-sky-800" :
                      "bg-stone-200 text-stone-700"
                    }`}>
                      {ms.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-stone-600">{ms.description}</p>
                  <div className="text-stone-400 text-[11px]">Due Target: {ms.targetDate}</div>
                </div>

                <div className="sm:text-right shrink-0">
                  <button
                    onClick={() => {
                      const nextStatus = ms.status === "completed" ? "in_progress" : "completed";
                      const updatedMilestones = safeMilestones.map((m) =>
                        m.id === ms.id ? { ...m, status: nextStatus as any } : m
                      );
                      const updated = StorageService.saveProject({
                        ...project,
                        milestones: updatedMilestones,
                      });
                      setProject(updated);
                      showToast(`Milestone updated to ${nextStatus}`, "success");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold text-stone-800 hover:bg-stone-50"
                  >
                    Toggle Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FUNDING & GRANTS TAB */}
      {activeTab === "funding" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-base">CSR Grants & Co-Design Budget</h3>
              <p className="text-xs text-stone-500">Tracked disbursements from industry CSR and university research grants.</p>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-stone-500">Secured Funding</div>
              <div className="text-lg font-bold text-emerald-700">₹{(project.funding?.secured || 0).toLocaleString()} / ₹{(project.funding?.target || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">CSR Sponsor Allocations</h4>
            {safeSponsors.map((sp, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">{sp.name}</div>
                  <div className="text-stone-500">{sp.type} • Status: {sp.status}</div>
                </div>
                <div className="font-mono font-bold text-stone-900 text-sm">₹{(sp.amount || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GEMINI PROJECT ASSISTANT CHAT */}
      {activeTab === "assistant" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Gemini AI Project Management Co-Pilot</h3>
                <p className="text-[11px] text-stone-500">Real-time schedule optimization, contingency planning, and resource alignment.</p>
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              "Suggest next milestones for field deployment",
              "Generate risk mitigation plan for monsoon delays",
              "Create university lab testing checklist",
              "Draft budget allocation for sensor testing",
            ].map((qp, i) => (
              <button
                key={i}
                onClick={() => handleAskAssistant(qp)}
                className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition text-[11px]"
              >
                {qp} →
              </button>
            ))}
          </div>

          {/* Chat Transcript */}
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-xl p-3.5 rounded-2xl leading-relaxed ${
                    msg.role === "user"
                      ? "bg-stone-900 text-white"
                      : "bg-white border border-stone-200 text-stone-800 shadow-2xs"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* If structured tasks returned by Gemini, render 1-click Add */}
                  {msg.structured?.suggestedTasks && (
                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
                      <div className="font-bold text-stone-900 text-[11px]">Suggested Tasks:</div>
                      {(msg.structured.suggestedTasks || []).map((st: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 text-[11px]">
                          <span>{st.title}</span>
                          <button
                            onClick={() => handleAddSuggestedTask(st)}
                            className="text-emerald-700 font-bold hover:underline"
                          >
                            + Add to Board
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risks & Mitigations */}
                  {msg.structured?.identifiedRisks && (
                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-[11px]">
                      <div className="font-bold text-stone-900">Identified Risk & Contingency:</div>
                      {(msg.structured.identifiedRisks || []).map((r: any, idx: number) => (
                        <div key={idx} className="text-stone-600">
                          <strong>{r.risk}:</strong> {r.mitigation}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskAssistant()}
              placeholder="Ask Gemini to draft milestones, evaluate delays, or structure tasks..."
              className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-emerald-600"
            />
            <button
              onClick={() => handleAskAssistant()}
              disabled={askingAssistant}
              className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 transition"
            >
              {askingAssistant ? "Thinking..." : <><Send className="w-3.5 h-3.5" /> Send</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
