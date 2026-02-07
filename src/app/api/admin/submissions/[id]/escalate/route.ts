import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canReviewSubmissions } from "@/lib/admin-auth";
import { checkEscalation } from "@/lib/sla";
import { createAuditLog } from "@/lib/audit";

/**
 * POST /api/admin/submissions/[id]/escalate
 * Manually escalate a submission or check for auto-escalation
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role || "";
    const userId = (session.user as { id?: string }).id;

    if (!canReviewSubmissions(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Get submission with review and risk assessment
    const submission = await prisma.aISystemSubmission.findUnique({
      where: { id },
      include: {
        review: true,
        riskAssessment: {
          select: { overallLevel: true },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!submission.review) {
      return NextResponse.json(
        { error: "No review record exists for this submission" },
        { status: 400 }
      );
    }

    if (!submission.submittedAt) {
      return NextResponse.json(
        { error: "Submission has not been submitted yet" },
        { status: 400 }
      );
    }

    // Check if escalation is needed
    const escalationCheck = checkEscalation({
      submittedAt: submission.submittedAt,
      riskLevel: submission.riskAssessment?.overallLevel || "MEDIUM",
      currentEscalationLevel: submission.review.escalationLevel,
      status: submission.status,
    });

    if (!escalationCheck.shouldEscalate) {
      return NextResponse.json({
        escalated: false,
        message: "No escalation needed at this time",
        currentLevel: submission.review.escalationLevel,
      });
    }

    // Perform escalation
    const updatedReview = await prisma.submissionReview.update({
      where: { id: submission.review.id },
      data: {
        escalationLevel: escalationCheck.newLevel,
        escalatedAt: new Date(),
      },
    });

    // Log to audit trail
    if (userId) {
      createAuditLog({
        submissionId: id,
        performedById: userId,
        action: "ESCALATED",
        category: "STATUS_CHANGE",
        description: `Escalated to level ${escalationCheck.newLevel}`,
        metadata: {
          previousLevel: submission.review.escalationLevel,
          newLevel: escalationCheck.newLevel,
        },
      }).catch((err) => console.error("Audit log failed:", err));
    }

    // TODO: Send escalation notification emails to appropriate roles
    // This would use the workflowConfig.escalationLevels[newLevel].notifyRoles

    return NextResponse.json({
      escalated: true,
      previousLevel: submission.review.escalationLevel,
      newLevel: escalationCheck.newLevel,
      escalatedAt: updatedReview.escalatedAt,
    });
  } catch (error) {
    console.error("Escalation error:", error);
    return NextResponse.json(
      { error: "Failed to escalate submission" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/submissions/[id]/escalate
 * Check escalation status without performing escalation
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role || "";

    if (!canReviewSubmissions(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const submission = await prisma.aISystemSubmission.findUnique({
      where: { id },
      include: {
        review: {
          select: {
            escalationLevel: true,
            escalatedAt: true,
            dueDate: true,
            priority: true,
          },
        },
        riskAssessment: {
          select: { overallLevel: true },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!submission.review || !submission.submittedAt) {
      return NextResponse.json({
        escalationLevel: 0,
        needsEscalation: false,
      });
    }

    const escalationCheck = checkEscalation({
      submittedAt: submission.submittedAt,
      riskLevel: submission.riskAssessment?.overallLevel || "MEDIUM",
      currentEscalationLevel: submission.review.escalationLevel,
      status: submission.status,
    });

    return NextResponse.json({
      escalationLevel: submission.review.escalationLevel,
      escalatedAt: submission.review.escalatedAt,
      needsEscalation: escalationCheck.shouldEscalate,
      nextLevel: escalationCheck.shouldEscalate ? escalationCheck.newLevel : null,
      priority: submission.review.priority,
      dueDate: submission.review.dueDate,
    });
  } catch (error) {
    console.error("Escalation check error:", error);
    return NextResponse.json(
      { error: "Failed to check escalation status" },
      { status: 500 }
    );
  }
}
