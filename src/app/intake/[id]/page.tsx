import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IntakeForm } from "@/components/intake-form/IntakeForm";

interface IntakePageProps {
  params: Promise<{ id: string }>;
}

export default async function IntakePage({ params }: IntakePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const submission = await prisma.aISystemSubmission.findFirst({
    where: {
      id,
      submittedById: session.user.id,
    },
  });

  if (!submission) {
    notFound();
  }

  return (
    <IntakeForm
      submissionId={submission.id}
      initialData={{
        aiSystemName: submission.aiSystemName || "",
        useCase: submission.useCase || "",
        businessPurpose: submission.businessPurpose || "",
        vendor: submission.vendor || "",
        currentStage: submission.currentStage || "",
        numberOfUsers: submission.numberOfUsers || "",
        outputUsage: submission.outputUsage || "",
        humanReviewLevel: submission.humanReviewLevel || "",
        dataTypes: submission.dataTypes || [],
        vendorDataStorage: submission.vendorDataStorage || "",
        userTrainingRequired: submission.userTrainingRequired || false,
        acceptableUseRequired: submission.acceptableUseRequired || false,
        executiveSponsorName: submission.executiveSponsorName || "",
        executiveSponsorTitle: submission.executiveSponsorTitle || "",
        businessOwnerName: submission.businessOwnerName || "",
        businessOwnerEmail: submission.businessOwnerEmail || "",
        technicalOwnerName: submission.technicalOwnerName || "",
        technicalOwnerEmail: submission.technicalOwnerEmail || "",
        hasFederalContracts: submission.hasFederalContracts || "",
        usageLoggingEnabled: submission.usageLoggingEnabled || false,
        complianceAccess: submission.complianceAccess || false,
        incidentResponseDoc: submission.incidentResponseDoc || false,
      }}
      status={submission.status}
    />
  );
}
