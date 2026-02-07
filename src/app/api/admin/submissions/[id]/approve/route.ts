import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canReviewSubmissions } from "@/lib/admin-auth";

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

    const submission = await prisma.aISystemSubmission.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== "SUBMITTED" && submission.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        { error: "Submission cannot be approved in current state" },
        { status: 400 }
      );
    }

    const previousStatus = submission.status;

    // Update submission status
    await prisma.aISystemSubmission.update({
      where: { id },
      data: { status: "APPROVED" },
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
        action: "APPROVED",
        previousStatus,
        newStatus: "APPROVED",
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving submission:", error);
    return NextResponse.json(
      { error: "Failed to approve submission" },
      { status: 500 }
    );
  }
}
