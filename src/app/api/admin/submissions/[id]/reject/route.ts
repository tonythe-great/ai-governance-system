import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canReviewSubmissions } from "@/lib/admin-auth";
import { sendEmail, statusChangeEmail } from "@/lib/email";

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
        { error: "Rejection reason is required" },
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
        { error: "Submission cannot be rejected in current state" },
        { status: 400 }
      );
    }

    const previousStatus = submission.status;

    // Update submission status
    await prisma.aISystemSubmission.update({
      where: { id },
      data: { status: "REJECTED" },
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
        action: "REJECTED",
        previousStatus,
        newStatus: "REJECTED",
        notes: body.notes,
      },
    });

    // Send status change email (non-blocking)
    if (submission.submittedBy?.email) {
      const emailContent = statusChangeEmail({
        userName: submission.submittedBy.name || "",
        systemName: submission.aiSystemName || "Untitled System",
        submissionId: submission.id,
        oldStatus: previousStatus,
        newStatus: "REJECTED",
        comments: body.notes,
      });
      sendEmail({
        to: submission.submittedBy.email,
        ...emailContent,
      }).catch((err) => console.error("Email send failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting submission:", error);
    return NextResponse.json(
      { error: "Failed to reject submission" },
      { status: 500 }
    );
  }
}
