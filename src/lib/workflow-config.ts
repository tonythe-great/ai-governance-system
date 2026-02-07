/**
 * Workflow Automation Configuration
 *
 * Defines SLA targets, routing rules, and escalation thresholds
 * based on risk level.
 */

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface SLAConfig {
  reviewSLAHours: number;      // Target time to complete review
  escalationAfterHours: number; // Escalate if no action after this time
  priority: Priority;           // Default priority for this risk level
}

export interface WorkflowConfig {
  slaByRiskLevel: Record<RiskLevel, SLAConfig>;
  priorityWeights: Record<Priority, number>;
  escalationLevels: {
    level: number;
    action: string;
    notifyRoles: string[];
  }[];
}

/**
 * Default workflow configuration
 */
export const workflowConfig: WorkflowConfig = {
  // SLA targets by risk level
  slaByRiskLevel: {
    CRITICAL: {
      reviewSLAHours: 24,        // 1 day to complete review
      escalationAfterHours: 12,  // Escalate after 12 hours
      priority: "URGENT",
    },
    HIGH: {
      reviewSLAHours: 48,        // 2 days
      escalationAfterHours: 24,  // Escalate after 1 day
      priority: "HIGH",
    },
    MEDIUM: {
      reviewSLAHours: 120,       // 5 days
      escalationAfterHours: 72,  // Escalate after 3 days
      priority: "NORMAL",
    },
    LOW: {
      reviewSLAHours: 240,       // 10 days
      escalationAfterHours: 168, // Escalate after 7 days
      priority: "LOW",
    },
  },

  // Priority weights for sorting (higher = more urgent)
  priorityWeights: {
    URGENT: 4,
    HIGH: 3,
    NORMAL: 2,
    LOW: 1,
  },

  // Escalation level definitions
  escalationLevels: [
    {
      level: 1,
      action: "First escalation - notify reviewers",
      notifyRoles: ["REVIEWER", "ADMIN"],
    },
    {
      level: 2,
      action: "Second escalation - notify admins",
      notifyRoles: ["ADMIN"],
    },
    {
      level: 3,
      action: "Final escalation - critical alert",
      notifyRoles: ["ADMIN"],
    },
  ],
};

/**
 * Get SLA configuration for a risk level
 */
export function getSLAConfig(riskLevel: string): SLAConfig {
  const level = riskLevel as RiskLevel;
  return workflowConfig.slaByRiskLevel[level] || workflowConfig.slaByRiskLevel.MEDIUM;
}

/**
 * Calculate due date based on risk level
 */
export function calculateDueDate(riskLevel: string, fromDate: Date = new Date()): Date {
  const config = getSLAConfig(riskLevel);
  const dueDate = new Date(fromDate);
  dueDate.setHours(dueDate.getHours() + config.reviewSLAHours);
  return dueDate;
}

/**
 * Get priority for a risk level
 */
export function getPriorityForRiskLevel(riskLevel: string): Priority {
  const config = getSLAConfig(riskLevel);
  return config.priority;
}

/**
 * Get priority weight for sorting
 */
export function getPriorityWeight(priority: string): number {
  return workflowConfig.priorityWeights[priority as Priority] || 2;
}

/**
 * Format SLA duration for display
 */
export function formatSLADuration(hours: number): string {
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  return `${days} day${days === 1 ? "" : "s"} ${remainingHours} hour${remainingHours === 1 ? "" : "s"}`;
}

/**
 * Get display label for priority
 */
export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: "Low",
    NORMAL: "Normal",
    HIGH: "High",
    URGENT: "Urgent",
  };
  return labels[priority] || priority;
}

/**
 * Get color classes for priority badges
 */
export function getPriorityColors(priority: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-700",
    NORMAL: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };
  return colors[priority] || colors.NORMAL;
}
