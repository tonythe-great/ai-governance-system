import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canReviewSubmissions } from "@/lib/admin-auth";

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
        submittedBy: {
          select: { name: true, email: true },
        },
        riskAssessment: {
          select: {
            overallLevel: true,
            overallScore: true,
            summary: true,
            recommendations: true,
            riskFlags: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission data:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission data" },
      { status: 500 }
    );
  }
}
