import { prisma } from "@/lib/prisma";
import { requireReviewer } from "@/lib/admin-auth";
import { ReviewQueue } from "@/components/admin/ReviewQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ReviewsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

const statusOptions = [
  { value: "", label: "All Active", statuses: ["SUBMITTED", "UNDER_REVIEW"] },
  { value: "SUBMITTED", label: "Pending Review" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  await requireReviewer();
  const params = await searchParams;

  const statusFilter = params.status;

  const whereClause: { status?: string | { in: string[] } } = {};
  if (statusFilter) {
    whereClause.status = statusFilter;
  } else {
    whereClause.status = { in: ["SUBMITTED", "UNDER_REVIEW"] };
  }

  const submissions = await prisma.aISystemSubmission.findMany({
    where: whereClause,
    orderBy: [
      { review: { priority: "desc" } },
      { review: { dueDate: "asc" } },
      { submittedAt: "asc" },
    ],
    include: {
      submittedBy: {
        select: { id: true, name: true, email: true },
      },
      riskAssessment: {
        select: { overallLevel: true, overallScore: true },
      },
      review: {
        select: {
          priority: true,
          dueDate: true,
          escalationLevel: true,
          assignedTo: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
          <p className="text-gray-500 mt-1">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {statusOptions.map((option) => {
          const isActive = statusFilter === option.value ||
            (!statusFilter && option.value === "");
          return (
            <Link
              key={option.value}
              href={option.value ? `/admin/reviews?status=${option.value}` : "/admin/reviews"}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No submissions found
            </h3>
            <p className="text-gray-500">
              {statusFilter
                ? `No submissions with status "${statusFilter}"`
                : "No submissions awaiting review"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ReviewQueue submissions={submissions} />
      )}
    </div>
  );
}
