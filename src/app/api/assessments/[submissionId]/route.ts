import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getAssessmentForSubmission } from "@/lib/agents/risk-assessment";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = await params;
    const userId = (session.user as { id?: string }).id;

    // Verify the submission exists and belongs to the user
    const submission = await prisma.aISystemSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.submittedById !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the assessment
    const assessment = await getAssessmentForSubmission(submissionId);

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found. Has this submission been submitted?" },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Get assessment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
