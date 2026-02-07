import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { logFormUpdate } from "@/lib/audit";

export async function GET(
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

    const submission = await prisma.aISystemSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (submission.submittedById !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id?: string }).id;
    const body = await request.json();

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

    const updateData = {
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
    };

    const submission = await prisma.aISystemSubmission.update({
      where: { id },
      data: updateData,
    });

    // Log form changes to audit trail (non-blocking)
    logFormUpdate(id, userId!, existing as Record<string, unknown>, updateData).catch(
      (err) => console.error("Audit log failed:", err)
    );

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Update submission error:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
