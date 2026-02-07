import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireReviewer } from "@/lib/admin-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { CommentThread } from "@/components/admin/CommentThread";
import { ReviewHistory } from "@/components/admin/ReviewHistory";
import { AuditTrail } from "@/components/admin/AuditTrail";
import { DownloadPDFButton } from "@/components/admin/DownloadPDFButton";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Pending Review",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const riskColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
};

export default async function SubmissionReviewPage({ params }: ReviewPageProps) {
  await requireReviewer();
  const { id } = await params;

  const submission = await prisma.aISystemSubmission.findUnique({
    where: { id },
    include: {
      submittedBy: true,
      riskAssessment: true,
      review: {
        include: {
          assignedTo: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: "desc" },
          },
          actions: {
            include: { performedBy: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/reviews" className="hover:text-gray-700">
          Review Queue
        </Link>
        <span>/</span>
        <span className="text-gray-900">{submission.aiSystemName || "Untitled"}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {submission.aiSystemName || "Untitled Submission"}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[submission.status]
              }`}
            >
              {statusLabels[submission.status]}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            Submitted by {submission.submittedBy?.name || submission.submittedBy?.email}
            {submission.submittedAt && (
              <span className="ml-2">
                on {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DownloadPDFButton submissionId={id} />
          <ReviewActions
            submissionId={id}
            currentStatus={submission.status}
            reviewId={submission.review?.id}
          />
        </div>
      </div>

      {submission.riskAssessment && (
        <Card className={`border-2 ${riskColors[submission.riskAssessment.overallLevel]}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {submission.riskAssessment.overallScore}
                  </p>
                  <p className="text-sm opacity-75">Risk Score</p>
                </div>
                <div className="h-12 w-px bg-current opacity-20" />
                <div>
                  <p className="font-semibold text-lg">
                    {submission.riskAssessment.overallLevel} Risk
                  </p>
                  <p className="text-sm opacity-75">
                    {submission.riskAssessment.summary}
                  </p>
                </div>
              </div>
              <Link
                href={`/submissions/${id}/assessment`}
                className="text-sm font-medium underline hover:no-underline"
              >
                View Full Assessment
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="AI System Name" value={submission.aiSystemName} />
              <InfoRow label="Use Case" value={submission.useCase} />
              <InfoRow label="Business Purpose" value={submission.businessPurpose} />
              <InfoRow label="Vendor" value={submission.vendor} />
              <InfoRow label="Current Stage" value={submission.currentStage} />
              <InfoRow label="Number of Users" value={submission.numberOfUsers} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Human Oversight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Output Usage" value={submission.outputUsage} />
              <InfoRow label="Human Review Level" value={submission.humanReviewLevel} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="Data Types"
                value={submission.dataTypes.length > 0 ? submission.dataTypes.join(", ") : null}
              />
              <InfoRow label="Vendor Data Storage" value={submission.vendorDataStorage} />
              <InfoRow
                label="User Training Required"
                value={submission.userTrainingRequired ? "Yes" : "No"}
              />
              <InfoRow
                label="Acceptable Use Policy"
                value={submission.acceptableUseRequired ? "Yes" : "No"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ownership & Accountability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                label="Executive Sponsor"
                value={
                  submission.executiveSponsorName
                    ? `${submission.executiveSponsorName}${submission.executiveSponsorTitle ? ` (${submission.executiveSponsorTitle})` : ""}`
                    : null
                }
              />
              <InfoRow
                label="Business Owner"
                value={
                  submission.businessOwnerName
                    ? `${submission.businessOwnerName}${submission.businessOwnerEmail ? ` - ${submission.businessOwnerEmail}` : ""}`
                    : null
                }
              />
              <InfoRow
                label="Technical Owner"
                value={
                  submission.technicalOwnerName
                    ? `${submission.technicalOwnerName}${submission.technicalOwnerEmail ? ` - ${submission.technicalOwnerEmail}` : ""}`
                    : null
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance & Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="Federal Contracts" value={submission.hasFederalContracts} />
              <InfoRow
                label="Usage Logging"
                value={submission.usageLoggingEnabled ? "Enabled" : "Disabled"}
              />
              <InfoRow
                label="Compliance Access"
                value={submission.complianceAccess ? "Yes" : "No"}
              />
              <InfoRow
                label="Incident Response Plan"
                value={submission.incidentResponseDoc ? "Documented" : "Not documented"}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <CommentThread
            submissionId={id}
            reviewId={submission.review?.id}
            comments={submission.review?.comments || []}
          />
          <AuditTrail submissionId={id} />
          <ReviewHistory actions={submission.review?.actions || []} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start">
      <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value || "—"}</span>
    </div>
  );
}
