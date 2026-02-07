import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SLABadge } from "./SLABadge";

interface Submission {
  id: string;
  aiSystemName: string | null;
  vendor: string | null;
  status: string;
  submittedAt: Date | null;
  submittedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  riskAssessment: {
    overallLevel: string;
    overallScore: number;
  } | null;
  review: {
    priority: string;
    dueDate: Date | null;
    escalationLevel: number;
    assignedTo: {
      id: string;
      name: string | null;
    } | null;
  } | null;
}

interface ReviewQueueProps {
  submissions: Submission[];
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
  SUBMITTED: "Pending",
  UNDER_REVIEW: "In Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const riskColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export function ReviewQueue({ submissions }: ReviewQueueProps) {
  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <Link key={submission.id} href={`/admin/reviews/${submission.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {submission.aiSystemName || "Untitled Submission"}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[submission.status]
                      }`}
                    >
                      {statusLabels[submission.status]}
                    </span>
                    {submission.riskAssessment && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          riskColors[submission.riskAssessment.overallLevel]
                        }`}
                      >
                        {submission.riskAssessment.overallLevel} Risk
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {submission.vendor && (
                      <span>Vendor: {submission.vendor}</span>
                    )}
                    <span>
                      Submitted by: {submission.submittedBy?.name || submission.submittedBy?.email}
                    </span>
                    {submission.submittedAt && (
                      <span>
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {submission.review && (
                    <SLABadge
                      submittedAt={submission.submittedAt}
                      dueDate={submission.review.dueDate}
                      riskLevel={submission.riskAssessment?.overallLevel || null}
                      escalationLevel={submission.review.escalationLevel}
                      showPriority
                      priority={submission.review.priority}
                    />
                  )}
                  {submission.review?.assignedTo && (
                    <div className="text-sm text-gray-500">
                      <span className="text-gray-400">Assigned: </span>
                      {submission.review.assignedTo.name}
                    </div>
                  )}
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
