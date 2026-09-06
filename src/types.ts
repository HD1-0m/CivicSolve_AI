export type UserRole = 
  | 'citizen' 
  | 'student' 
  | 'university' 
  | 'industry' 
  | 'ngo' 
  | 'expert' 
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  organizationType?: string;
  location: string;
  avatarUrl?: string;
  skills: string[];
  interests: string[];
  expertise: string[];
  reputationScore: number;
  challengesSubmittedCount: number;
  solutionsProposedCount: number;
  projectsJoinedCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type ChallengeUrgency = 'low' | 'medium' | 'high' | 'critical';
export type ChallengeStatus = 'open' | 'under_review' | 'solution_in_progress' | 'solved' | 'archived';

export interface LocationData {
  country: string;
  state: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface AIAnalysis {
  summary: string;
  category: string;
  subcategory: string;
  keywords: string[];
  rootCauses: string[];
  severity: number; // 1 - 100
  urgency: ChallengeUrgency;
  potentialSocialImpact: string;
  impactAreas: string[];
  sdgGoals: string[];
  requiredSkills: string[];
  recommendedOrganizationTypes: string[];
  suggestedSolutionAreas: string[];
  analyzedAt: string;
  modelVersion?: string;
}

export interface ChallengeAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location: LocationData;
  targetCommunity: string;
  urgency: ChallengeUrgency;
  estimatedImpact: string;
  
  // Detailed info
  currentSituation?: string;
  rootCause?: string;
  existingAttempts?: string;
  constraints?: string;
  desiredOutcome?: string;
  availableResources?: string;
  additionalInformation?: string;
  
  attachments?: ChallengeAttachment[];
  
  // Metadata & AI
  aiAnalysis?: AIAnalysis;
  createdBy: string;
  creatorName: string;
  creatorRole: UserRole;
  creatorOrg?: string;
  
  status: ChallengeStatus;
  supportCount: number;
  supporters?: string[]; // user IDs
  savedBy?: string[]; // user IDs
  solutionCount: number;
  projectCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface SolutionEvaluation {
  feasibility: number; // 0-100
  scalability: number; // 0-100
  socialImpact: number; // 0-100
  costEffectiveness: number; // 0-100
  sustainability: number; // 0-100
  technicalFeasibility: number; // 0-100
  implementationComplexity: number; // 0-100
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendations: string[];
  evaluatedAt: string;
  evaluatedByAi: boolean;
  expertNotes?: string;
  reviewedByExpert?: boolean;
}

export interface Solution {
  id: string;
  challengeId: string;
  challengeTitle?: string;
  title: string;
  description: string;
  proposedApproach: string;
  technology: string;
  requiredResources: string;
  expectedImpact: string;
  estimatedImplementationTime: string;
  estimatedCostRange: string;
  teamMembers: string[];
  attachments?: ChallengeAttachment[];
  
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorOrg?: string;
  
  status: 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  evaluation?: SolutionEvaluation;
  votesCount: number;
  votedBy?: string[];
  
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectTask {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  assignedToId?: string;
  assignedToName?: string;
  assigneeName?: string;
  assigneeRole?: UserRole;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  targetDate?: string;
  isCompleted?: boolean;
  status?: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

export interface Project {
  id: string;
  challengeId: string;
  challengeTitle: string;
  solutionId: string;
  solutionTitle: string;
  title: string;
  description: string;
  stage?: string;
  funding?: ProjectFunding;
  leadOrganization?: string;
  leadUserId?: string;
  members: {
    userId?: string;
    name: string;
    role: UserRole;
    org?: string;
    isLead?: boolean;
  }[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  progressPercent: number;
  status: 'active' | 'in_review' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userOrg?: string;
  content: string;
  parentId?: string; // for nested replies
  likesCount: number;
  likedBy: string[];
  isActionItem?: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'challenge' | 'solution' | 'project' | 'comment' | 'mention' | 'moderation' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'challenge' | 'solution' | 'comment' | 'user';
  targetId: string;
  targetTitle?: string;
  reason: 'spam' | 'abuse' | 'false_information' | 'duplicate' | 'inappropriate_content' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'resolved';
  adminNotes?: string;
  createdAt: string;
}

export interface OrganizationMatch {
  organizationName: string;
  type: 'University' | 'Industry' | 'NGO' | 'Research Institution' | 'Startup' | 'Mentor Group';
  matchScore: number; // 0 - 100
  reason: string;
  relevantCapabilities: string[];
  contactEmail?: string;
}

export type Report = ReportItem;
export type Task = ProjectTask;
export type Milestone = ProjectMilestone;

export interface Organization {
  id: string;
  name: string;
  type: 'university' | 'industry' | 'ngo' | 'research_institute' | 'government';
  location: string;
  description: string;
  focusAreas: string[];
  capabilities: string[];
  equipment: string[];
  verified: boolean;
  contactEmail: string;
  activeProjects: number;
}

export interface ProjectFunding {
  target: number;
  secured: number;
  sponsors: {
    name: string;
    type: string;
    amount: number;
    status: string;
  }[];
}

export interface PlatformStats {
  challengesSubmitted: number;
  activeChallenges: number;
  solutionsProposed: number;
  organizationsConnected: number;
  problemsSolved: number;
  categoriesBreakdown: Record<string, number>;
  stateBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}
