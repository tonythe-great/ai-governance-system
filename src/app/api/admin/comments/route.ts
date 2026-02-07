import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canReviewSubmissions } from "@/lib/admin-auth";

export async function POST(request: Request) {
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

    const body = await request.json();

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (!body.submissionId) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }

    // Get or create review record
    let reviewId = body.reviewId;

    if (!reviewId) {
      const review = await prisma.submissionReview.upsert({
        where: { submissionId: body.submissionId },
        create: { submissionId: body.submissionId },
        update: {},
      });
      reviewId = review.id;
    }

    // Create the comment
    const comment = await prisma.reviewComment.create({
      data: {
        reviewId,
        authorId: userId!,
        content: body.content,
        isInternal: body.isInternal || false,
        sectionName: body.sectionName || null,
        fieldName: body.fieldName || null,
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
