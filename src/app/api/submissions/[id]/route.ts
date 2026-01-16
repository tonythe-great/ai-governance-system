import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const submission = await prisma.aISystemSubmission.findFirst({
      where: {
        id,
        submittedById: session.user.id,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

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
        { error: "Cannot edit a submitted form" },
        { status: 400 }
      );
    }

    // Update only allowed fields
    const {
      aiSystemName,
      useCase,
      businessPurpose,
      vendor,
      currentStage,
      numberOfUsers,
      outputUsage,
      humanReviewLevel,
      dataTypes,
      vendorDataStorage,
      userTrainingRequired,
      acceptableUseRequired,
      executiveSponsorName,
      executiveSponsorTitle,
      businessOwnerName,
      businessOwnerEmail,
      technicalOwnerName,
      technicalOwnerEmail,
      hasFederalContracts,
      usageLoggingEnabled,
      complianceAccess,
      incidentResponseDoc,
    } = body;

    const submission = await prisma.aISystemSubmission.update({
      where: { id },
      data: {
        aiSystemName,
        useCase,
        businessPurpose,
        vendor,
        currentStage,
        numberOfUsers,
        outputUsage,
        humanReviewLevel,
        dataTypes,
        vendorDataStorage,
        userTrainingRequired,
        acceptableUseRequired,
        executiveSponsorName,
        executiveSponsorTitle,
        businessOwnerName,
        businessOwnerEmail,
        technicalOwnerName,
        technicalOwnerEmail,
        hasFederalContracts,
        usageLoggingEnabled,
        complianceAccess,
        incidentResponseDoc,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Update submission error:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
