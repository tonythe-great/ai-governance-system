/**
 * SLA Tracking Utility
 *
 * Calculates SLA status, time remaining, and escalation triggers
 */

import { getSLAConfig, workflowConfig } from "./workflow-config";

export type SLAStatus = "ON_TRACK" | "AT_RISK" | "OVERDUE";

export interface SLAInfo {
  status: SLAStatus;
  dueDate: Date | null;
  hoursRemaining: number | null;
  hoursOverdue: number | null;
  percentComplete: number;
  shouldEscalate: boolean;
  escalationLevel: number;
  displayText: string;
}

/**
 * Calculate SLA status for a submission
 */
export function calculateSLAStatus(params: {
  submittedAt: Date | null;
  dueDate: Date | null;
  riskLevel: string | null;
  currentEscalationLevel: number;
}): SLAInfo {
  const { submittedAt, dueDate, riskLevel, currentEscalationLevel } = params;

  // Default response for submissions without due dates
  if (!dueDate || !submittedAt) {
    return {
      status: "ON_TRACK",
      dueDate: null,
      hoursRemaining: null,
      hoursOverdue: null,
      percentComplete: 0,
      shouldEscalate: false,
      escalationLevel: 0,
      displayText: "No SLA",
    };
  }

  const now = new Date();
  const dueDateMs = dueDate.getTime();
  const nowMs = now.getTime();
  const submittedMs = submittedAt.getTime();

  // Calculate time metrics
  const totalDurationMs = dueDateMs - submittedMs;
  const elapsedMs = nowMs - submittedMs;
  const remainingMs = dueDateMs - nowMs;

  const hoursRemaining = remainingMs / (1000 * 60 * 60);
  const percentComplete = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

  // Get SLA config for risk level
  const slaConfig = riskLevel ? getSLAConfig(riskLevel) : null;
  const escalationThresholdHours = slaConfig?.escalationAfterHours || 24;

  // Calculate hours since submission for escalation check
  const hoursSinceSubmission = elapsedMs / (1000 * 60 * 60);

  // Determine status
  let status: SLAStatus;
  let hoursOverdue: number | null = null;
  let displayText: string;

  if (hoursRemaining < 0) {
    // Overdue
    status = "OVERDUE";
    hoursOverdue = Math.abs(hoursRemaining);
    displayText = formatOverdueText(hoursOverdue);
  } else if (percentComplete >= 75) {
    // At risk (75% of time elapsed)
    status = "AT_RISK";
    displayText = formatRemainingText(hoursRemaining);
  } else {
    // On track
    status = "ON_TRACK";
    displayText = formatRemainingText(hoursRemaining);
  }

  // Check if escalation is needed
  // Escalate if:
  // 1. Hours since submission exceeds escalation threshold
  // 2. Current escalation level can still be escalated
  const maxEscalationLevel = workflowConfig.escalationLevels.length;
  const nextEscalationThreshold = escalationThresholdHours * (currentEscalationLevel + 1);
  const shouldEscalate =
    hoursSinceSubmission >= nextEscalationThreshold &&
    currentEscalationLevel < maxEscalationLevel;

  return {
    status,
    dueDate,
    hoursRemaining: hoursRemaining > 0 ? hoursRemaining : null,
    hoursOverdue,
    percentComplete,
    shouldEscalate,
    escalationLevel: currentEscalationLevel,
    displayText,
  };
}

/**
 * Format remaining time for display
 */
function formatRemainingText(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m remaining`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h remaining`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) {
    return `${days}d remaining`;
  }
  return `${days}d ${remainingHours}h remaining`;
}

/**
 * Format overdue time for display
 */
function formatOverdueText(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m overdue`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h overdue`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) {
    return `${days}d overdue`;
  }
  return `${days}d ${remainingHours}h overdue`;
}

/**
 * Get CSS classes for SLA status badge
 */
export function getSLAStatusColors(status: SLAStatus): string {
  const colors: Record<SLAStatus, string> = {
    ON_TRACK: "bg-green-100 text-green-700 border-green-200",
    AT_RISK: "bg-yellow-100 text-yellow-700 border-yellow-200",
    OVERDUE: "bg-red-100 text-red-700 border-red-200",
  };
  return colors[status];
}

/**
 * Get label for SLA status
 */
export function getSLAStatusLabel(status: SLAStatus): string {
  const labels: Record<SLAStatus, string> = {
    ON_TRACK: "On Track",
    AT_RISK: "At Risk",
    OVERDUE: "Overdue",
  };
  return labels[status];
}

/**
 * Calculate priority score for sorting
 * Higher score = higher priority in queue
 */
export function calculatePriorityScore(params: {
  priority: string;
  slaStatus: SLAStatus;
  hoursOverdue: number | null;
}): number {
  const { priority, slaStatus, hoursOverdue } = params;

  // Base score from priority
  const priorityWeights: Record<string, number> = {
    URGENT: 400,
    HIGH: 300,
    NORMAL: 200,
    LOW: 100,
  };
  let score = priorityWeights[priority] || 200;

  // Add SLA status weight
  const statusWeights: Record<SLAStatus, number> = {
    OVERDUE: 50,
    AT_RISK: 25,
    ON_TRACK: 0,
  };
  score += statusWeights[slaStatus];

  // Add hours overdue (capped at 50 points)
  if (hoursOverdue && hoursOverdue > 0) {
    score += Math.min(50, hoursOverdue);
  }

  return score;
}

/**
 * Check if a submission needs escalation and return the new level
 */
export function checkEscalation(params: {
  submittedAt: Date;
  riskLevel: string;
  currentEscalationLevel: number;
  status: string; // Submission status
}): { shouldEscalate: boolean; newLevel: number } {
  const { submittedAt, riskLevel, currentEscalationLevel, status } = params;

  // Don't escalate if already resolved
  if (status === "APPROVED" || status === "REJECTED") {
    return { shouldEscalate: false, newLevel: currentEscalationLevel };
  }

  const now = new Date();
  const hoursSinceSubmission =
    (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);

  const slaConfig = getSLAConfig(riskLevel);
  const escalationThreshold = slaConfig.escalationAfterHours;

  // Calculate what level we should be at based on time elapsed
  const expectedLevel = Math.floor(hoursSinceSubmission / escalationThreshold);
  const maxLevel = workflowConfig.escalationLevels.length;
  const targetLevel = Math.min(expectedLevel, maxLevel);

  if (targetLevel > currentEscalationLevel) {
    return { shouldEscalate: true, newLevel: targetLevel };
  }

  return { shouldEscalate: false, newLevel: currentEscalationLevel };
}
