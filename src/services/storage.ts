import { 
  Challenge, 
  Solution, 
  Project, 
  Comment, 
  NotificationItem, 
  ReportItem, 
  UserProfile, 
  PlatformStats,
  Organization,
  TaskStatus
} from "../types";
import { 
  SEED_USERS, 
  SEED_CHALLENGES, 
  SEED_SOLUTIONS, 
  SEED_PROJECTS, 
  SEED_COMMENTS, 
  SEED_NOTIFICATIONS, 
  SEED_REPORTS 
} from "../data/seedData";
import { FirestoreService, testConnection } from "./firebase";

// Zero-crash payload hygiene: Strips all undefined values recursively
export function cleanPayload<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanPayload) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanPayload(value);
    }
  }
  return result as T;
}

const STORAGE_KEYS = {
  USERS: "civicsolve_users_v1",
  CHALLENGES: "civicsolve_challenges_v1",
  SOLUTIONS: "civicsolve_solutions_v1",
  PROJECTS: "civicsolve_projects_v1",
  COMMENTS: "civicsolve_comments_v1",
  NOTIFICATIONS: "civicsolve_notifications_v1",
  REPORTS: "civicsolve_reports_v1",
};

function getLocalData<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return seed;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(cleanPayload(data)));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Client Storage API
export const StorageService = {
  // Users
  getUsers(): UserProfile[] {
    return getLocalData<UserProfile[]>(STORAGE_KEYS.USERS, SEED_USERS);
  },
  getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find(u => u.id === id);
  },
  saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user, updatedAt: new Date().toISOString() };
    } else {
      users.push(user);
    }
    setLocalData(STORAGE_KEYS.USERS, users);
    FirestoreService.saveUserProfile(user).catch(err => {
      console.warn("[StorageService] Cloud user sync deferred:", err.message || err);
    });
  },

  // Challenges
  getChallenges(): Challenge[] {
    return getLocalData<Challenge[]>(STORAGE_KEYS.CHALLENGES, SEED_CHALLENGES);
  },
  getChallengeById(id: string): Challenge | undefined {
    return this.getChallenges().find(c => c.id === id);
  },
  saveChallenge(challenge: Challenge): Challenge {
    const challenges = this.getChallenges();
    const idx = challenges.findIndex(c => c.id === challenge.id);
    const sanitized = cleanPayload(challenge);
    if (idx >= 0) {
      challenges[idx] = { ...sanitized, updatedAt: new Date().toISOString() };
    } else {
      challenges.unshift(sanitized);
    }
    setLocalData(STORAGE_KEYS.CHALLENGES, challenges);
    FirestoreService.saveChallenge(sanitized).catch(err => {
      console.warn("[StorageService] Cloud challenge write deferred:", err.message || err);
    });
    return sanitized;
  },
  toggleSupportChallenge(challengeId: string, userId: string): { supported: boolean; count: number } {
    const challenges = this.getChallenges();
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return { supported: false, count: 0 };

    challenge.supporters = challenge.supporters || [];
    const isSupported = challenge.supporters.includes(userId);
    if (isSupported) {
      challenge.supporters = challenge.supporters.filter(id => id !== userId);
    } else {
      challenge.supporters.push(userId);
    }
    challenge.supportCount = challenge.supporters.length;
    this.saveChallenge(challenge);
    return { supported: !isSupported, count: challenge.supportCount };
  },
  toggleSaveChallenge(challengeId: string, userId: string): boolean {
    const challenges = this.getChallenges();
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return false;

    challenge.savedBy = challenge.savedBy || [];
    const isSaved = challenge.savedBy.includes(userId);
    if (isSaved) {
      challenge.savedBy = challenge.savedBy.filter(id => id !== userId);
    } else {
      challenge.savedBy.push(userId);
    }
    this.saveChallenge(challenge);
    return !isSaved;
  },

  // Solutions
  getSolutions(challengeId?: string): Solution[] {
    const solutions = getLocalData<Solution[]>(STORAGE_KEYS.SOLUTIONS, SEED_SOLUTIONS);
    if (challengeId) {
      return solutions.filter(s => s.challengeId === challengeId);
    }
    return solutions;
  },
  getSolutionById(id: string): Solution | undefined {
    return this.getSolutions().find(s => s.id === id);
  },
  saveSolution(solution: Solution): Solution {
    const solutions = this.getSolutions();
    const idx = solutions.findIndex(s => s.id === solution.id);
    const sanitized = cleanPayload(solution);
    if (idx >= 0) {
      solutions[idx] = { ...sanitized, updatedAt: new Date().toISOString() };
    } else {
      solutions.unshift(sanitized);
      // increment challenge solutionCount
      const challenge = this.getChallengeById(solution.challengeId);
      if (challenge) {
        challenge.solutionCount = (challenge.solutionCount || 0) + 1;
        this.saveChallenge(challenge);
      }
    }
    setLocalData(STORAGE_KEYS.SOLUTIONS, solutions);
    FirestoreService.saveSolution(sanitized).catch(err => {
      console.warn("[StorageService] Cloud solution write deferred:", err.message || err);
    });
    return sanitized;
  },
  voteSolution(solutionId: string, userId: string): { voted: boolean; count: number } {
    const solutions = this.getSolutions();
    const sol = solutions.find(s => s.id === solutionId);
    if (!sol) return { voted: false, count: 0 };
    sol.votedBy = sol.votedBy || [];
    const hasVoted = sol.votedBy.includes(userId);
    if (hasVoted) {
      sol.votedBy = sol.votedBy.filter(id => id !== userId);
    } else {
      sol.votedBy.push(userId);
    }
    sol.votesCount = sol.votedBy.length;
    this.saveSolution(sol);
    return { voted: !hasVoted, count: sol.votesCount };
  },

  // Projects
  getProjects(): Project[] {
    return getLocalData<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  },
  getProjectById(id: string): Project | undefined {
    return this.getProjects().find(p => p.id === id);
  },
  saveProject(project: Project): Project {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    const sanitized = cleanPayload(project);
    if (idx >= 0) {
      projects[idx] = { ...sanitized, updatedAt: new Date().toISOString() };
    } else {
      projects.unshift(sanitized);
    }
    setLocalData(STORAGE_KEYS.PROJECTS, projects);
    FirestoreService.saveProject(sanitized).catch(err => {
      console.warn("[StorageService] Cloud project write deferred:", err.message || err);
    });
    return sanitized;
  },
  updateTaskStatus(projectId: string, taskId: string, newStatus: TaskStatus): Project | undefined {
    const projects = this.getProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return undefined;
    const task = proj.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      this.saveProject(proj);
    }
    return proj;
  },

  // Comments
  getComments(challengeId: string): Comment[] {
    const comments = getLocalData<Comment[]>(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    return comments.filter(c => c.challengeId === challengeId);
  },
  saveComment(comment: Comment): Comment {
    const comments = getLocalData<Comment[]>(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    const sanitized = cleanPayload(comment);
    comments.push(sanitized);
    setLocalData(STORAGE_KEYS.COMMENTS, comments);
    return sanitized;
  },
  toggleLikeComment(commentId: string, userId: string): { liked: boolean; count: number } {
    const comments = getLocalData<Comment[]>(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return { liked: false, count: 0 };
    comment.likedBy = comment.likedBy || [];
    const isLiked = comment.likedBy.includes(userId);
    if (isLiked) {
      comment.likedBy = comment.likedBy.filter(id => id !== userId);
    } else {
      comment.likedBy.push(userId);
    }
    comment.likesCount = comment.likedBy.length;
    setLocalData(STORAGE_KEYS.COMMENTS, comments);
    return { liked: !isLiked, count: comment.likesCount };
  },

  // Notifications
  getNotifications(userId: string): NotificationItem[] {
    const all = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    return all.filter(n => n.userId === userId || n.userId === "all");
  },
  markNotificationAsRead(id: string): void {
    const all = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const notif = all.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      setLocalData(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },
  createNotification(notif: Omit<NotificationItem, "id" | "createdAt" | "isRead">): NotificationItem {
    const all = getLocalData<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const newItem: NotificationItem = {
      ...cleanPayload(notif),
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newItem);
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, all);
    return newItem;
  },

  // Reports
  getReports(): ReportItem[] {
    return getLocalData<ReportItem[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
  },
  saveReport(report: Omit<ReportItem, "id" | "createdAt" | "status">): ReportItem {
    const reports = this.getReports();
    const newReport: ReportItem = {
      ...cleanPayload(report),
      id: `rep-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    setLocalData(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  },
  updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'dismissed' | 'resolved', notes?: string): void {
    const reports = this.getReports();
    const rep = reports.find(r => r.id === reportId);
    if (rep) {
      rep.status = status;
      if (notes) rep.adminNotes = notes;
      setLocalData(STORAGE_KEYS.REPORTS, reports);
    }
  },
  resolveReport(reportId: string, status: 'resolved' | 'dismissed', notes?: string): void {
    this.updateReportStatus(reportId, status, notes);
  },

  // Organizations
  getOrganizations(): Organization[] {
    return [
      {
        id: "org-1",
        name: "IIT Bombay - CTARA",
        type: "university",
        location: "Mumbai, Maharashtra",
        description: "Centre for Technology Alternatives for Rural Areas specializing in rural water filtration, appropriate mechanization, and grassroots co-design.",
        focusAreas: ["Water & Sanitation", "Rural Infrastructure", "Agri-Tech"],
        capabilities: ["Water Quality Testing Lab", "Pilot Fabrication Unit", "Field Research Stations"],
        equipment: ["Spectrophotometers", "Solar Adsorption Columns", "Soil Quality Analysers"],
        verified: true,
        contactEmail: "ctara@iitb.ac.in",
        activeProjects: 4
      },
      {
        id: "org-2",
        name: "Tata Sustainability Group",
        type: "industry",
        location: "Mumbai, Maharashtra",
        description: "CSR leadership powering scalable clean water, sustainable livelihoods, and rural climate adaptation.",
        focusAreas: ["Clean Energy & Climate", "Water & Sanitation", "Livelihoods"],
        capabilities: ["CSR Capital Grants", "Enterprise Mentorship", "Supply Chain Scaling"],
        equipment: ["Direct Impact Capital", "Logistics Networks"],
        verified: true,
        contactEmail: "sustainability@tata.com",
        activeProjects: 3
      },
      {
        id: "org-3",
        name: "Jal Seva Rural Trust",
        type: "ngo",
        location: "Ahmednagar, Maharashtra",
        description: "Grassroots NGO working with village panchayats on fluoride testing, watershed protection, and community water committees.",
        focusAreas: ["Water & Sanitation", "Public Health", "Gram Panchayat Capacity"],
        capabilities: ["Community Mobilization", "Field Enumerators", "SHG Training"],
        equipment: ["Field Test Kits", "Community Centers"],
        verified: true,
        contactEmail: "contact@jalsevarural.org",
        activeProjects: 2
      },
      {
        id: "org-4",
        name: "National Institute of Hydrology (NIH)",
        type: "research_institute",
        location: "Roorkee, Uttarakhand",
        description: "Premier national R&D institute dedicated to groundwater modeling, aquifer recharge, and contaminants telemetry.",
        focusAreas: ["Water & Sanitation", "Hydro-geology", "Sensor Networks"],
        capabilities: ["Aquifer Mapping", "Hydrological Simulation", "Remote Sensing"],
        equipment: ["Isotope Hydrology Lab", "Geophysical Sounding Gear"],
        verified: true,
        contactEmail: "info@nih.gov.in",
        activeProjects: 2
      },
      {
        id: "org-5",
        name: "Anna University Rural Technology Hub",
        type: "university",
        location: "Chennai, Tamil Nadu",
        description: "Engineering faculty and incubators focusing on off-grid cold chain, coastal wastewater remediation, and solar agri-driers.",
        focusAreas: ["Agriculture & Food Security", "Clean Energy & Climate"],
        capabilities: ["Cold Storage Thermal Testing", "Solar Lab", "Biomaterial Testing"],
        equipment: ["Thermal Imaging Cameras", "Phase Change Material Test Bench"],
        verified: true,
        contactEmail: "rth@annauniv.edu",
        activeProjects: 3
      },
      {
        id: "org-6",
        name: "Infosys Foundation",
        type: "industry",
        location: "Bengaluru, Karnataka",
        description: "CSR investment supporting tech-driven healthcare diagnostics, vernacular digital literacy, and rural STEM infrastructure.",
        focusAreas: ["Healthcare & Public Health", "Education & Skill Development"],
        capabilities: ["Grants & Incubation", "Software Engineering Mentors"],
        equipment: ["Diagnostic Devices", "EdTech Hardware Kits"],
        verified: true,
        contactEmail: "csr@infosys.com",
        activeProjects: 2
      }
    ];
  },

  // Platform Analytics
  getPlatformStats(): PlatformStats {
    const challenges = this.getChallenges();
    const solutions = this.getSolutions();
    const projects = this.getProjects();
    const users = this.getUsers();

    const activeCount = challenges.filter(c => c.status === "open" || c.status === "solution_in_progress").length;
    const solvedCount = challenges.filter(c => c.status === "solved").length;

    const categoriesBreakdown: Record<string, number> = {};
    const stateBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};

    (challenges || []).forEach(c => {
      if (!c) return;
      if (c.category) categoriesBreakdown[c.category] = (categoriesBreakdown[c.category] || 0) + 1;
      const state = c.location?.state || "Other";
      stateBreakdown[state] = (stateBreakdown[state] || 0) + 1;
      if (c.status) statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
    });

    const uniqueOrgs = new Set<string>();
    users.forEach(u => {
      if (u.organization) uniqueOrgs.add(u.organization);
    });

    return {
      challengesSubmitted: challenges.length,
      activeChallenges: activeCount,
      solutionsProposed: solutions.length,
      organizationsConnected: Math.max(uniqueOrgs.size, 18),
      problemsSolved: Math.max(solvedCount, 4),
      categoriesBreakdown,
      stateBreakdown,
      statusBreakdown,
    };
  },

  // Reset to seed data
  resetDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(SEED_CHALLENGES));
    localStorage.setItem(STORAGE_KEYS.SOLUTIONS, JSON.stringify(SEED_SOLUTIONS));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(SEED_COMMENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
  },

  // Initialize Cloud Firestore Sync & Hydration
  async initCloudSync(): Promise<{ isOnline: boolean; challengesSynced: number }> {
    try {
      const isOnline = await testConnection();
      if (!isOnline) {
        return { isOnline: false, challengesSynced: 0 };
      }

      // Check if challenges exist in cloud; if none, seed initial set
      const cloudChallenges = await FirestoreService.getChallenges();
      if (cloudChallenges.length === 0) {
        // Seed initial challenges to Firestore
        const localChallenges = this.getChallenges();
        for (const ch of localChallenges) {
          await FirestoreService.saveChallenge(ch);
        }
        return { isOnline: true, challengesSynced: localChallenges.length };
      } else {
        // Merge cloud challenges into local cache
        const local = this.getChallenges();
        const map = new Map<string, Challenge>();
        local.forEach(c => map.set(c.id, c));
        cloudChallenges.forEach(c => map.set(c.id, c));
        const merged = Array.from(map.values());
        setLocalData(STORAGE_KEYS.CHALLENGES, merged);
        return { isOnline: true, challengesSynced: cloudChallenges.length };
      }
    } catch (err) {
      console.warn("[StorageService] Cloud sync initialization error:", err);
      return { isOnline: false, challengesSynced: 0 };
    }
  }
};
