import { AuthUser } from '../types';
import { LeadRecord } from './leadStore';

export type TimelineStageStatus = 'Completed' | 'In Progress' | 'Pending';

export interface TimelineStageDefinition {
  id: number;
  key: string;
  name: string;
  description: string;
  iconName: string;
}

export interface ProjectTimelineStage {
  id: number;
  key: string;
  name: string;
  description: string;
  iconName?: string;
  status: TimelineStageStatus;
  completedAt?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  notes?: string | null;
}

export interface TimelineAuditLog {
  id: string;
  projectId: string;
  stageId: number;
  stageName: string;
  previousStatus?: TimelineStageStatus | string;
  status: TimelineStageStatus;
  updatedBy: string;
  updatedAt: string;
  reason?: string;
}

/**
 * Standard Inisio Lifecycle Stages.
 * Reusable and extensible: New stages can be added to this array without modifying business logic.
 */
export const DEFAULT_TIMELINE_STAGES: TimelineStageDefinition[] = [
  {
    id: 1,
    key: 'assessment',
    name: 'Project Assessment',
    description: 'Check your project details and basic requirements.',
    iconName: 'ClipboardList'
  },
  {
    id: 2,
    key: 'bankability',
    name: 'Bankability Rating',
    description: 'Evaluate your project’s funding eligibility and financial strength.',
    iconName: 'Gauge'
  },
  {
    id: 3,
    key: 'documents',
    name: 'Document Preparation',
    description: 'Prepare your DPR and CMA documents for bank submission.',
    iconName: 'FileText'
  },
  {
    id: 4,
    key: 'bank_application',
    name: 'Bank Application',
    description: 'Submit your funding application to suitable institutions.',
    iconName: 'Landmark'
  },
  {
    id: 5,
    key: 'approval',
    name: 'Funding Approval',
    description: 'Get approval from the institution with funding terms.',
    iconName: 'ShieldCheck'
  },
  {
    id: 6,
    key: 'disbursal',
    name: 'Funding Disbursal',
    description: 'Complete final steps and receive your project funding.',
    iconName: 'IndianRupee'
  }
];

/**
 * Check if the user has permissions to modify project stage statuses.
 * Admin, CA, Prosync, and DPR Consultants can update stage status.
 * Standard users (Customers) have view-only access.
 */
export function canUserUpdateTimeline(user?: AuthUser | null): boolean {
  if (!user || !user.role) return false;
  const authorizedRoles = [
    'admin',
    'superadmin',
    'admin1',
    'admin2',
    'admin3',
    'ca',
    'prosync',
    'prosync_admin',
    'dpr_consultant'
  ];
  return authorizedRoles.includes(user.role.toLowerCase());
}

/**
 * Helper to format ISO dates into human readable timestamps
 */
export function formatTimelineDate(isoStr?: string | null): string | null {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return null;
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${dateStr} • ${timeStr}`;
}

/**
 * Computes or restores the full list of stages for a given project.
 * Supports dynamically defined stage definitions.
 */
export function computeProjectTimeline(
  project: Partial<LeadRecord>,
  stageDefs: TimelineStageDefinition[] = DEFAULT_TIMELINE_STAGES
): ProjectTimelineStage[] {
  // If explicitly stored custom stages exist, reconcile them with the current stage definitions
  if (Array.isArray(project.timelineStages) && project.timelineStages.length > 0) {
    return stageDefs.map((def) => {
      const existing = project.timelineStages?.find((s) => s.id === def.id || s.key === def.key);
      if (existing) {
        return {
          ...existing,
          id: def.id,
          key: def.key,
          name: def.name,
          description: def.description,
          iconName: def.iconName
        };
      }
      return {
        id: def.id,
        key: def.key,
        name: def.name,
        description: def.description,
        iconName: def.iconName,
        status: 'Pending',
        completedAt: null
      };
    });
  }

  // Fallback: Calculate baseline statuses from project attributes
  const isAssessmentCompleted = Boolean(project.assessmentCompleted || project.feasibilityScore);
  const isRatingCompleted = isAssessmentCompleted && Boolean(project.feasibilityScore || project.bankabilityRating);
  const isDocCompleted = Boolean(project.dprFile?.uploadedAt || project.cmaFile?.uploadedAt || project.status === 'DPR Ready' || project.status === 'CA Approved' || project.status === 'Sanctioned');
  const isBankAppCompleted = Boolean(project.bankAppliedAt || project.status === 'Bank Submitted' || project.status === 'Sanctioned' || project.status === 'Disbursed');
  const isLoanApproved = Boolean(project.loanApprovedAt || project.status === 'Sanctioned' || project.status === 'Disbursed' || project.isFunded);
  const isFundingCompleted = Boolean(project.fundingDisbursedAt || project.status === 'Disbursed' || (project.isFunded && isLoanApproved));

  // Determine which is the current active stage
  let activeStageId = 1;
  if (isFundingCompleted) activeStageId = 7; // All completed
  else if (isLoanApproved) activeStageId = 6;
  else if (isBankAppCompleted) activeStageId = 5;
  else if (isDocCompleted) activeStageId = 4;
  else if (isRatingCompleted) activeStageId = 3;
  else if (isAssessmentCompleted) activeStageId = 2;

  const creationDate = project.timestamp ? formatTimelineDate(project.timestamp) : formatTimelineDate(new Date().toISOString());

  return stageDefs.map((def) => {
    let status: TimelineStageStatus = 'Pending';
    let completedAt: string | null = null;

    if (def.id < activeStageId) {
      status = 'Completed';
      if (def.id === 1 || def.id === 2) completedAt = creationDate;
      else if (def.id === 3) completedAt = formatTimelineDate(project.dprFile?.uploadedAt || project.cmaFile?.uploadedAt);
      else if (def.id === 4) completedAt = formatTimelineDate(project.bankAppliedAt);
      else if (def.id === 5) completedAt = formatTimelineDate(project.loanApprovedAt);
      else if (def.id === 6) completedAt = formatTimelineDate(project.fundingDisbursedAt);
    } else if (def.id === activeStageId) {
      status = 'In Progress';
    } else {
      status = 'Pending';
    }

    return {
      id: def.id,
      key: def.key,
      name: def.name,
      description: def.description,
      iconName: def.iconName,
      status,
      completedAt
    };
  });
}

/**
 * Reverts a completed or in-progress stage back to "In Progress".
 * CRITICAL RULE:
 * 1. The selected stage becomes "In Progress".
 * 2. All stages before it remain/become "Completed".
 * 3. All stages after it return to "Pending".
 */
export function revertStageToInProgress(
  currentStages: ProjectTimelineStage[],
  targetStageId: number,
  user: AuthUser,
  projectId: string,
  reason?: string
): {
  updatedStages: ProjectTimelineStage[];
  auditLog: TimelineAuditLog;
  leadFieldUpdates: Partial<LeadRecord>;
} {
  const targetStage = currentStages.find((s) => s.id === targetStageId);
  const stageName = targetStage ? targetStage.name : `Stage ${targetStageId}`;
  const now = new Date().toISOString();
  const userName = user.name || user.email || 'Admin/Advisory Desk';
  const roleName = user.role.toUpperCase();
  const updatedByFormatted = `${userName} (${roleName})`;

  const updatedStages: ProjectTimelineStage[] = currentStages.map((stage) => {
    if (stage.id < targetStageId) {
      return {
        ...stage,
        status: 'Completed',
        completedAt: stage.completedAt || formatTimelineDate(now)
      };
    } else if (stage.id === targetStageId) {
      return {
        ...stage,
        status: 'In Progress',
        completedAt: null,
        updatedAt: now,
        updatedBy: updatedByFormatted,
        notes: reason || `Moved back to In Progress by ${updatedByFormatted}`
      };
    } else {
      return {
        ...stage,
        status: 'Pending',
        completedAt: null,
        updatedAt: now,
        updatedBy: updatedByFormatted
      };
    }
  });

  const auditLog: TimelineAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    stageId: targetStageId,
    stageName,
    previousStatus: targetStage?.status || 'Completed',
    status: 'In Progress',
    updatedBy: updatedByFormatted,
    updatedAt: now,
    reason: reason || `Stage moved back to In Progress`
  };

  // Synchronize legacy project state fields
  const leadFieldUpdates: Partial<LeadRecord> = {
    timelineStages: updatedStages,
    lastEditedBy: updatedByFormatted,
    lastEditedAt: now
  };

  if (targetStageId <= 5) {
    leadFieldUpdates.fundingDisbursedAt = undefined;
    leadFieldUpdates.isFunded = false;
  }
  if (targetStageId <= 4) {
    leadFieldUpdates.loanApprovedAt = undefined;
  }
  if (targetStageId <= 3) {
    leadFieldUpdates.bankAppliedAt = undefined;
    leadFieldUpdates.dprStageRollback = true;
    if (reason) leadFieldUpdates.dprTimelineRollbackReason = reason;
  }

  // Update overall workflow status name appropriately
  if (targetStageId === 1) leadFieldUpdates.status = 'New';
  else if (targetStageId === 2) leadFieldUpdates.status = 'In Appraisal';
  else if (targetStageId === 3) leadFieldUpdates.status = 'In Appraisal';
  else if (targetStageId === 4) leadFieldUpdates.status = 'CA Approved';
  else if (targetStageId === 5) leadFieldUpdates.status = 'Bank Submitted';
  else if (targetStageId === 6) leadFieldUpdates.status = 'Sanctioned';

  return { updatedStages, auditLog, leadFieldUpdates };
}

/**
 * Advance or manually set a stage status.
 */
export function updateStageStatus(
  currentStages: ProjectTimelineStage[],
  targetStageId: number,
  newStatus: TimelineStageStatus,
  user: AuthUser,
  projectId: string,
  reason?: string
): {
  updatedStages: ProjectTimelineStage[];
  auditLog: TimelineAuditLog;
  leadFieldUpdates: Partial<LeadRecord>;
} {
  if (newStatus === 'In Progress') {
    return revertStageToInProgress(currentStages, targetStageId, user, projectId, reason);
  }

  const targetStage = currentStages.find((s) => s.id === targetStageId);
  const stageName = targetStage ? targetStage.name : `Stage ${targetStageId}`;
  const now = new Date().toISOString();
  const userName = user.name || user.email || 'Admin/Advisory Desk';
  const updatedByFormatted = `${userName} (${user.role.toUpperCase()})`;

  let updatedStages: ProjectTimelineStage[] = [];

  if (newStatus === 'Completed') {
    // Mark target stage completed, and make targetStage + 1 In Progress if it exists
    updatedStages = currentStages.map((stage) => {
      if (stage.id <= targetStageId) {
        return {
          ...stage,
          status: 'Completed',
          completedAt: stage.completedAt || formatTimelineDate(now),
          updatedAt: now,
          updatedBy: updatedByFormatted
        };
      } else if (stage.id === targetStageId + 1) {
        return {
          ...stage,
          status: 'In Progress',
          completedAt: null,
          updatedAt: now,
          updatedBy: updatedByFormatted
        };
      } else {
        return {
          ...stage,
          status: 'Pending',
          completedAt: null
        };
      }
    });
  } else {
    // Setting to Pending
    updatedStages = currentStages.map((stage) => {
      if (stage.id < targetStageId) {
        return stage;
      } else if (stage.id === targetStageId) {
        return {
          ...stage,
          status: 'Pending',
          completedAt: null,
          updatedAt: now,
          updatedBy: updatedByFormatted
        };
      } else {
        return {
          ...stage,
          status: 'Pending',
          completedAt: null
        };
      }
    });
  }

  const auditLog: TimelineAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    stageId: targetStageId,
    stageName,
    previousStatus: targetStage?.status || 'In Progress',
    status: newStatus,
    updatedBy: updatedByFormatted,
    updatedAt: now,
    reason: reason || `Status updated to ${newStatus}`
  };

  const leadFieldUpdates: Partial<LeadRecord> = {
    timelineStages: updatedStages,
    lastEditedBy: updatedByFormatted,
    lastEditedAt: now
  };

  if (newStatus === 'Completed' && targetStageId === 6) {
    leadFieldUpdates.fundingDisbursedAt = now;
    leadFieldUpdates.isFunded = true;
    leadFieldUpdates.status = 'Disbursed';
  } else if (newStatus === 'Completed' && targetStageId === 5) {
    leadFieldUpdates.loanApprovedAt = now;
    leadFieldUpdates.status = 'Sanctioned';
  } else if (newStatus === 'Completed' && targetStageId === 4) {
    leadFieldUpdates.bankAppliedAt = now;
    leadFieldUpdates.status = 'Bank Submitted';
  }

  return { updatedStages, auditLog, leadFieldUpdates };
}
