import { prisma } from "@/lib/prisma";
import { requireReviewer } from "@/lib/admin-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed";
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { SubmissionTrendChart, generateTrendData } from "@/components/charts/SubmissionTrendChart";
import { SLABadge } from "@/components/admin/SLABadge";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";

export default async function AdminDashboardPage() {
  await requireReviewer();

  // Get status counts
  const stats = await prisma.aISystemSubmission.groupBy({
    by: ["status"],
    _count: true,
  });

  // Get risk level counts
  const riskStats = await prisma.riskAssessment.groupBy({
    by: ["overallLevel"],
    _count: true,
  });

  // Get all submissions for trend chart
  const allSubmissions = await prisma.aISystemSubmission.findMany({
    select: {
      submittedAt: true,
      status: true,
    },
    where: {
      submittedAt: { not: null },
    },
    orderBy: { submittedAt: "desc" },
  });

  // Get SLA stats
  const overdueCount = await prisma.submissionReview.count({
    where: {
      dueDate: { lt: new Date() },
      submission: {
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      },
    },
  });

  // Calculate stats
  const totalCount = stats.reduce((acc, s) => acc + s._count, 0);
  const submittedCount = stats.find((s) => s.status === "SUBMITTED")?._count || 0;
  const underReviewCount = stats.find((s) => s.status === "UNDER_REVIEW")?._count || 0;
  const approvedCount = stats.find((s) => s.status === "APPROVED")?._count || 0;
  const rejectedCount = stats.find((s) => s.status === "REJECTED")?._count || 0;
  const pendingCount = submittedCount + underReviewCount;

  const lowRisk = riskStats.find((s) => s.overallLevel === "LOW")?._count || 0;
  const mediumRisk = riskStats.find((s) => s.overallLevel === "MEDIUM")?._count || 0;
  const highRisk = riskStats.find((s) => s.overallLevel === "HIGH")?._count || 0;
  const criticalRisk = riskStats.find((s) => s.overallLevel === "CRITICAL")?._count || 0;

  // Calculate approval rate
  const completedCount = approvedCount + rejectedCount;
  const approvalRate = completedCount > 0
    ? Math.round((approvedCount / completedCount) * 100)
    : 0;

  // Generate trend data
  const trendData = generateTrendData(
    allSubmissions.map((s) => ({
      submittedAt: s.submittedAt,
      status: s.status,
    })),
    14 // Last 14 days
  );

  // Get recent activity across all submissions
  const recentActivity = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      submission: {
        select: { aiSystemName: true },
      },
      performedBy: {
        select: { name: true, email: true },
      },
    },
  });

  // Transform to activity items
  const activityItems: ActivityItem[] = recentActivity.map((log) => ({
    id: log.id,
    action: getActivityAction(log.action),
    description: log.submission.aiSystemName || "Untitled submission",
    timestamp: log.createdAt,
    user: log.performedBy.name || log.performedBy.email,
    type: mapAuditActionToType(log.action),
  }));

  // Get urgent submissions (overdue or critical/high risk)
  const urgentSubmissions = await prisma.aISystemSubmission.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      OR: [
        {
          riskAssessment: {
            overallLevel: { in: ["CRITICAL", "HIGH"] },
          },
        },
        {
          review: {
            dueDate: { lt: new Date() },
          },
        },
      ],
    },
    orderBy: [
      { review: { priority: "desc" } },
      { submittedAt: "asc" },
    ],
    take: 5,
    include: {
      submittedBy: {
        select: { name: true, email: true },
      },
      riskAssessment: {
        select: { overallLevel: true, overallScore: true },
      },
      review: {
        select: { priority: true, dueDate: true, escalationLevel: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage AI system submissions
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Submissions"
          value={totalCount}
          icon="FileText"
          color="blue"
          description={`${pendingCount} pending review`}
          href="/admin/reviews"
        />
        <MetricCard
          title="Pending Review"
          value={pendingCount}
          icon="Clock"
          color="yellow"
          description={overdueCount > 0 ? `${overdueCount} overdue` : "All on track"}
          href="/admin/reviews?status=SUBMITTED"
        />
        <MetricCard
          title="Approval Rate"
          value={`${approvalRate}%`}
          icon="CheckCircle"
          color="green"
          description={`${approvedCount} approved / ${completedCount} completed`}
        />
        <MetricCard
          title="High Risk Items"
          value={criticalRisk + highRisk}
          icon="AlertTriangle"
          color={criticalRisk > 0 ? "red" : highRisk > 0 ? "yellow" : "green"}
          description={
            criticalRisk > 0
              ? `${criticalRisk} critical, ${highRisk} high`
              : highRisk > 0
              ? `${highRisk} high risk`
              : "No high-risk items"
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubmissionTrendChart
          data={trendData}
          title="Submission Trends (14 Days)"
        />
        <RiskDistributionChart
          data={{
            low: lowRisk,
            medium: mediumRisk,
            high: highRisk,
            critical: criticalRisk,
          }}
          title="Risk Distribution"
        />
      </div>

      {/* Activity and Urgent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed
          activities={activityItems}
          title="Recent Activity"
          emptyMessage="No recent activity"
          maxItems={6}
        />

        {/* Urgent Attention Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Needs Attention
              </CardTitle>
              <Link
                href="/admin/reviews"
                className="text-sm font-medium" style={{ color: "#000070" }}
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {urgentSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>All caught up! No urgent items.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentSubmissions.map((submission) => (
                  <Link
                    key={submission.id}
                    href={`/admin/reviews/${submission.id}`}
                    className="block p-3 rounded-lg border hover:border-[#000070]/20 hover:bg-[#000070]/5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {submission.aiSystemName || "Untitled"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {submission.submittedBy?.name || submission.submittedBy?.email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {submission.riskAssessment && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
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
                        {submission.review && (
                          <SLABadge
                            submittedAt={submission.submittedAt}
                            dueDate={submission.review.dueDate}
                            riskLevel={submission.riskAssessment?.overallLevel || null}
                            escalationLevel={submission.review.escalationLevel}
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-[#000070]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{underReviewCount}</p>
                <p className="text-sm text-gray-500">In Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getActivityAction(action: string): string {
  const actions: Record<string, string> = {
    CREATED: "New submission created",
    UPDATED: "Submission updated",
    SUBMITTED: "Submitted for review",
    APPROVED: "Submission approved",
    REJECTED: "Submission rejected",
    CHANGES_REQUESTED: "Changes requested",
    COMMENT_ADDED: "Comment added",
    ESCALATED: "Submission escalated",
  };
  return actions[action] || action;
}

function mapAuditActionToType(action: string): ActivityItem["type"] {
  const mapping: Record<string, ActivityItem["type"]> = {
    CREATED: "created",
    UPDATED: "updated",
    SUBMITTED: "submitted",
    APPROVED: "approved",
    REJECTED: "rejected",
    CHANGES_REQUESTED: "changes_requested",
    COMMENT_ADDED: "comment",
    ESCALATED: "escalated",
  };
  return mapping[action] || "updated";
}
