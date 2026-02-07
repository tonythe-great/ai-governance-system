import { prisma } from "@/lib/prisma";
import { requireReviewer } from "@/lib/admin-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface StatCardProps {
  title: string;
  count: number;
  color: "blue" | "yellow" | "green" | "red" | "gray";
  href?: string;
}

function StatCard({ title, count, color, href }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const content = (
    <Card className={`border ${colorClasses[color]} ${href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium opacity-80">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{count}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default async function AdminDashboardPage() {
  await requireReviewer();

  const stats = await prisma.aISystemSubmission.groupBy({
    by: ["status"],
    _count: true,
  });

  const riskStats = await prisma.riskAssessment.groupBy({
    by: ["overallLevel"],
    _count: true,
  });

  const submittedCount = stats.find((s) => s.status === "SUBMITTED")?._count || 0;
  const underReviewCount = stats.find((s) => s.status === "UNDER_REVIEW")?._count || 0;
  const approvedCount = stats.find((s) => s.status === "APPROVED")?._count || 0;
  const rejectedCount = stats.find((s) => s.status === "REJECTED")?._count || 0;
  const draftCount = stats.find((s) => s.status === "DRAFT")?._count || 0;

  const criticalRisk = riskStats.find((s) => s.overallLevel === "CRITICAL")?._count || 0;
  const highRisk = riskStats.find((s) => s.overallLevel === "HIGH")?._count || 0;

  const recentSubmissions = await prisma.aISystemSubmission.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
    },
    orderBy: { submittedAt: "asc" },
    take: 5,
    include: {
      submittedBy: {
        select: { name: true, email: true },
      },
      riskAssessment: {
        select: { overallLevel: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">Monitor and manage AI system submissions</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="Pending Review"
          count={submittedCount}
          color="blue"
          href="/admin/reviews?status=SUBMITTED"
        />
        <StatCard
          title="Under Review"
          count={underReviewCount}
          color="yellow"
          href="/admin/reviews?status=UNDER_REVIEW"
        />
        <StatCard
          title="Approved"
          count={approvedCount}
          color="green"
          href="/admin/reviews?status=APPROVED"
        />
        <StatCard
          title="Rejected"
          count={rejectedCount}
          color="red"
          href="/admin/reviews?status=REJECTED"
        />
        <StatCard
          title="Drafts"
          count={draftCount}
          color="gray"
        />
      </div>

      {(criticalRisk > 0 || highRisk > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {criticalRisk > 0 && <span className="font-semibold">{criticalRisk} CRITICAL</span>}
              {criticalRisk > 0 && highRisk > 0 && " and "}
              {highRisk > 0 && <span className="font-semibold">{highRisk} HIGH</span>}
              {" "}risk submissions require immediate attention.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Submissions Awaiting Review</CardTitle>
            <Link
              href="/admin/reviews"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No submissions awaiting review
            </p>
          ) : (
            <div className="divide-y">
              {recentSubmissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/admin/reviews/${submission.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-4 px-4 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {submission.aiSystemName || "Untitled"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {submission.submittedBy?.name || submission.submittedBy?.email}
                      {submission.submittedAt && (
                        <span className="ml-2">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.riskAssessment && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          {
                            LOW: "bg-green-100 text-green-700",
                            MEDIUM: "bg-yellow-100 text-yellow-700",
                            HIGH: "bg-orange-100 text-orange-700",
                            CRITICAL: "bg-red-100 text-red-700",
                          }[submission.riskAssessment.overallLevel]
                        }`}
                      >
                        {submission.riskAssessment.overallLevel}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === "SUBMITTED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {submission.status === "SUBMITTED" ? "Pending" : "In Review"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
