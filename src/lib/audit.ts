import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type AuditAction =
  | "CREATED"
  | "UPDATED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "COMMENT_ADDED"
  | "ESCALATED";

export type AuditCategory =
  | "LIFECYCLE"
  | "STATUS_CHANGE"
  | "FORM_EDIT"
  | "COMMENT";

interface CreateAuditLogParams {
  submissionId: string;
  performedById: string;
  action: AuditAction;
  category: AuditCategory;
  previousStatus?: string;
  newStatus?: string;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        submissionId: params.submissionId,
        performedById: params.performedById,
        action: params.action,
        category: params.category,
        previousStatus: params.previousStatus,
        newStatus: params.newStatus,
        fieldName: params.fieldName,
        previousValue: params.previousValue,
        newValue: params.newValue,
        description: params.description,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should not break the main operation
    return null;
  }
}

// Helper to log submission creation
export async function logSubmissionCreated(
  submissionId: string,
  userId: string
) {
  return createAuditLog({
    submissionId,
    performedById: userId,
    action: "CREATED",
    category: "LIFECYCLE",
    newStatus: "DRAFT",
    description: "Submission created",
  });
}

// Helper to log submission submitted for review
export async function logSubmissionSubmitted(
  submissionId: string,
  userId: string,
  systemName?: string
) {
  return createAuditLog({
    submissionId,
    performedById: userId,
    action: "SUBMITTED",
    category: "LIFECYCLE",
    previousStatus: "DRAFT",
    newStatus: "SUBMITTED",
    description: systemName
      ? `Submitted "${systemName}" for review`
      : "Submitted for review",
  });
}

// Helper to log status changes (approve, reject, request changes)
export async function logStatusChange(
  submissionId: string,
  userId: string,
  action: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
  previousStatus: string,
  newStatus: string,
  notes?: string
) {
  const descriptions: Record<string, string> = {
    APPROVED: "Submission approved",
    REJECTED: "Submission rejected",
    CHANGES_REQUESTED: "Changes requested",
  };

  return createAuditLog({
    submissionId,
    performedById: userId,
    action,
    category: "STATUS_CHANGE",
    previousStatus,
    newStatus,
    description: descriptions[action],
    metadata: notes ? { notes } : undefined,
  });
}

// Helper to log field changes
export async function logFieldChange(
  submissionId: string,
  userId: string,
  fieldName: string,
  previousValue: string | null | undefined,
  newValue: string | null | undefined
) {
  // Don't log if values are the same
  if (previousValue === newValue) return null;

  return createAuditLog({
    submissionId,
    performedById: userId,
    action: "UPDATED",
    category: "FORM_EDIT",
    fieldName,
    previousValue: previousValue ?? undefined,
    newValue: newValue ?? undefined,
    description: `Updated ${fieldName}`,
  });
}

// Helper to log multiple field changes at once
export async function logFormUpdate(
  submissionId: string,
  userId: string,
  previousData: Record<string, unknown>,
  newData: Record<string, unknown>
) {
  const changes: Array<{ field: string; from: unknown; to: unknown }> = [];

  for (const key of Object.keys(newData)) {
    const oldVal = previousData[key];
    const newVal = newData[key];

    // Compare values (handle arrays specially)
    const oldStr = JSON.stringify(oldVal);
    const newStr = JSON.stringify(newVal);

    if (oldStr !== newStr) {
      changes.push({ field: key, from: oldVal, to: newVal });
    }
  }

  if (changes.length === 0) return null;

  // Create a single audit log entry with all changes in metadata
  return createAuditLog({
    submissionId,
    performedById: userId,
    action: "UPDATED",
    category: "FORM_EDIT",
    description: `Updated ${changes.length} field(s)`,
    metadata: { changes },
  });
}

// Helper to log comment added
export async function logCommentAdded(
  submissionId: string,
  userId: string,
  isInternal: boolean
) {
  return createAuditLog({
    submissionId,
    performedById: userId,
    action: "COMMENT_ADDED",
    category: "COMMENT",
    description: isInternal ? "Added internal comment" : "Added comment",
    metadata: { isInternal },
  });
}

// Get audit history for a submission
export async function getAuditHistory(submissionId: string) {
  return prisma.auditLog.findMany({
    where: { submissionId },
    include: {
      performedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
