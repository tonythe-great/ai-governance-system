import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canReviewSubmissions } from "@/lib/admin-auth";
import { sendEmail, statusChangeEmail } from "@/lib/email";
import { logStatusChange } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const role = (session.user as { role?: string }).role || "";

    if (!canReviewSubmissions(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.notes?.trim()) {
      return NextResponse.json(
        { error: "Please specify what changes are required" },
        { status: 400 }
      );
    }

    const submission = await prisma.aISystemSubmission.findUnique({
      where: { id },
      include: {
        review: true,
        submittedBy: {
          select: { email: true, name: true },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== "SUBMITTED" && submission.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        { error: "Changes cannot be requested in current state" },
        { status: 400 }
      );
    }

    const previousStatus = submission.status;

    // Update submission status back to DRAFT so user can edit
    await prisma.aISystemSubmission.update({
      where: { id },
      data: { status: "DRAFT" },
    });

    // Ensure review record exists
    let review = submission.review;
    if (!review) {
      review = await prisma.submissionReview.create({
        data: { submissionId: id },
      });
    }

    // Log the action
    await prisma.reviewAction.create({
      data: {
        reviewId: review.id,
        performedById: userId!,
        action: "CHANGES_REQUESTED",
        previousStatus,
        newStatus: "DRAFT",
        notes: body.notes,
      },
    });

    // Also add a comment so the user can see the feedback
    await prisma.reviewComment.create({
      data: {
        reviewId: review.id,
        authorId: userId!,
        content: `Changes Requested:\n\n${body.notes}`,
        isInternal: false,
      },
    });

    // Log to audit trail (non-blocking)
    logStatusChange(id, userId!, "CHANGES_REQUESTED", previousStatus, "DRAFT", body.notes).catch(
      (err) => console.error("Audit log failed:", err)
    );

    // Send status change email (non-blocking)
    if (submission.submittedBy?.email) {
      const emailContent = statusChangeEmail({
        userName: submission.submittedBy.name || "",
        systemName: submission.aiSystemName || "Untitled System",
        submissionId: submission.id,
        oldStatus: previousStatus,
        newStatus: "CHANGES_REQUESTED",
        comments: body.notes,
      });
      sendEmail({
        to: submission.submittedBy.email,
        ...emailContent,
      }).catch((err) => console.error("Email send failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting changes:", error);
    return NextResponse.json(
      { error: "Failed to request changes" },
      { status: 500 }
    );
  }
}
