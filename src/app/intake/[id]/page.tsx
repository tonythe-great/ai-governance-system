import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { IntakeForm } from "@/components/intake-form/IntakeForm";

interface IntakePageProps {
  params: Promise<{ id: string }>;
}

export default async function IntakePage({ params }: IntakePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const userId = (session.user as { id?: string }).id;

  const submission = await prisma.aISystemSubmission.findUnique({
    where: { id },
  });

  if (!submission) {
    notFound();
  }

  if (submission.submittedById !== userId) {
    redirect("/dashboard");
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
