import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submissionSchema } from "@/lib/validations/submission";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership and draft status
    const existing = await prisma.aISystemSubmission.findFirst({
      where: {
        id,
        submittedById: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Submit submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
