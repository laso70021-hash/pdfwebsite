export type UserPlan = 'free' | 'pro' | 'team' | 'business';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  planId: UserPlan;
  seats?: number;
  createdAt: string;
}

export interface UserEntitlements {
  pdfOperationsUsed: number;
  pdfOperationsLimit: number; // 3 for Free, 10000 for Pro/Team
  aiQueriesUsed: number;
  aiQueriesLimit: number; // 5 for Free, 500 for Pro, 2500 for Team
  subscriptionStatus: 'active' | 'free' | 'past_due' | 'canceled';
  billingCycle?: 'monthly' | 'annual';
  currentPeriodEnd?: string;
}

export interface ProcessedDocument {
  id: string;
  userId: string;
  name: string;
  size: number;
  toolUsed: string;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
  downloadUrl?: string;
  blobDataUrl?: string;
  pageCount?: number;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  citations?: string[];
  thinkingAnalysis?: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  documentName: string;
  messages: AiMessage[];
  updatedAt: string;
}

export interface WorkspaceMember {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  status: 'active' | 'pending';
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  seats: number;
  members: WorkspaceMember[];
  createdAt: string;
}

export interface BusinessLead {
  id: string;
  name: string;
  email: string;
  company: string;
  teamSize: string;
  phone?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  createdAt: string;
}

export interface UsageAuditRecord {
  id: string;
  userId: string;
  userEmail: string;
  type: 'pdf_operation' | 'ai_query';
  tool: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface PdfToolDefinition {
  id: string;
  name: string;
  category: 'core' | 'convert' | 'organize' | 'security' | 'ai';
  description: string;
  badge?: string;
  isPopular?: boolean;
  isAi?: boolean;
  color: string; // Tailwind color class for card visual accent
}
