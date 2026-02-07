import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { submissionSchema } from "@/lib/validations/submission";
import { runRiskAssessment } from "@/lib/agents/risk-assessment";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id?: string }).id;

    // Verify existence and draft status
    const existing = await prisma.aISystemSubmission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.submittedById !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Submission has already been submitted" },
        { status: 400 }
      );
    }

    // Validate the submission data
    const validationResult = submissionSchema.safeParse({
      aiSystemName: existing.aiSystemName,
      useCase: existing.useCase,
      businessPurpose: existing.businessPurpose,
      vendor: existing.vendor,
      currentStage: existing.currentStage,
      numberOfUsers: existing.numberOfUsers,
      outputUsage: existing.outputUsage,
      humanReviewLevel: existing.humanReviewLevel,
      dataTypes: existing.dataTypes,
      vendorDataStorage: existing.vendorDataStorage,
      userTrainingRequired: existing.userTrainingRequired,
      acceptableUseRequired: existing.acceptableUseRequired,
      executiveSponsorName: existing.executiveSponsorName,
      executiveSponsorTitle: existing.executiveSponsorTitle,
      businessOwnerName: existing.businessOwnerName,
      businessOwnerEmail: existing.businessOwnerEmail,
      technicalOwnerName: existing.technicalOwnerName,
      technicalOwnerEmail: existing.technicalOwnerEmail,
      hasFederalContracts: existing.hasFederalContracts,
      usageLoggingEnabled: existing.usageLoggingEnabled,
      complianceAccess: existing.complianceAccess,
      incidentResponseDoc: existing.incidentResponseDoc,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Missing required fields", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Update status to SUBMITTED
    const submission = await prisma.aISystemSubmission.update({
      where: { id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    // Run the Risk Assessment Agent
    let assessment = null;
    try {
      assessment = await runRiskAssessment(submission);
    } catch (assessmentError) {
      console.error("Risk assessment error (non-blocking):", assessmentError);
      // Don't fail the submission if assessment fails
    }

    return NextResponse.json({
      ...submission,
      riskAssessment: assessment,
    });
  } catch (error) {
    console.error("Submit submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
