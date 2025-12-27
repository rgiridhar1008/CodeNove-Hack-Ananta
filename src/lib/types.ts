

export interface Contributor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  githubUrl: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: { id: string; label: string; votes: number }[];
  status: "Active" | "Closed";
  startDate: any;
  endDate: any;
  createdBy: string;
}

export type GrievanceStatus = "Pending" | "In Progress" | "Resolved";
export type GrievanceCategory = string; // Now a string, as it comes from Firestore
export type GrievancePriority = "Low" | "Medium" | "High";

export interface Grievance {
  id: string;
  userId: string;
  issueType: GrievanceCategory;
  description: string;
  latitude: number;
  longitude: number;
  status: GrievanceStatus;
  createdAt: any; // Using `any` for Firestore Timestamp flexibility
  resolvedAt?: any; // To store the resolution timestamp
  imageUrl?: string;
  priority: GrievancePriority;
  expectedResolutionDate?: any;
  isOverdue?: boolean;
  badgeAwarded?: boolean;
}

export interface Badge {
    badgeId: string;
    title: string;
    description: string;
    awardedAt: any;
    grievanceId: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'citizen' | 'admin';
    badges?: Badge[];
    totalResolvedContributions?: number;
}

export interface IssueCategory {
    id: string;
    name: string;
}
