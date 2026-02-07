import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/ActivityFeed";
import { QuickActions, userQuickActions } from "@/components/dashboard/QuickActions";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  Eye,
  BarChart3,
} from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
  SUBMITTED: "bg-[#000070]/10 text-[#000070] border-[#000070]/20",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const riskLevelColors: Record<string, string> = {
  LOW: "text-green-600 bg-green-50",
  MEDIUM: "text-yellow-600 bg-yellow-50",
  HIGH: "text-orange-600 bg-orange-50",
  CRITICAL: "text-red-600 bg-red-50",
};

// Progress percentages for each status
const statusProgress: Record<string, number> = {
  DRAFT: 25,
  SUBMITTED: 50,
  UNDER_REVIEW: 75,
  APPROVED: 100,
  REJECTED: 100,
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id;
  const userName = session.user.name;

  const submissions = await prisma.aISystemSubmission.findMany({
    where: { submittedById: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      aiSystemName: true,
      vendor: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      submittedAt: true,
      riskAssessment: {
        select: {
          overallLevel: true,
          overallScore: true,
        },
      },
    },
  });

  // Fetch recent activity for the user
  const recentActivity = await prisma.auditLog.findMany({
    where: {
      submission: {
        submittedById: userId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      submission: {
        select: { aiSystemName: true },
      },
    },
  });

  // Calculate stats
  const totalSubmissions = submissions.length;
  const pendingReview = submissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW"
  ).length;
  const approved = submissions.filter((s) => s.status === "APPROVED").length;
  const drafts = submissions.filter((s) => s.status === "DRAFT").length;

  // Calculate average risk score
  const submissionsWithRisk = submissions.filter((s) => s.riskAssessment);
  const avgRiskScore =
    submissionsWithRisk.length > 0
      ? Math.round(
          submissionsWithRisk.reduce(
            (acc, s) => acc + (s.riskAssessment?.overallScore || 0),
            0
          ) / submissionsWithRisk.length
        )
      : 0;

  // Transform audit logs to activity items
  const activityItems: ActivityItem[] = recentActivity.map((log) => ({
    id: log.id,
    action: getActivityAction(log.action),
    description: log.submission.aiSystemName || "Untitled submission",
    timestamp: log.createdAt,
    type: mapAuditActionToType(log.action),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(to bottom right, #000070, #000050)", boxShadow: "0 10px 15px -3px rgba(0, 0, 112, 0.2)" }}>
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#000070" }}>
                AI Governance
              </h1>
              <p className="text-sm text-gray-500">
                Enterprise Assessment Portal
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Hero */}
        <WelcomeHero userName={userName} />

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Submissions"
            value={totalSubmissions}
            icon="FileText"
            color="blue"
            description={drafts > 0 ? `${drafts} draft${drafts !== 1 ? "s" : ""}` : undefined}
          />
          <MetricCard
            title="Pending Review"
            value={pendingReview}
            icon="Clock"
            color="yellow"
            description="Awaiting decision"
          />
          <MetricCard
            title="Approved"
            value={approved}
            icon="CheckCircle"
            color="green"
            description={
              totalSubmissions > 0
                ? `${Math.round((approved / totalSubmissions) * 100)}% approval rate`
                : undefined
            }
          />
          <MetricCard
            title="Avg Risk Score"
            value={avgRiskScore > 0 ? avgRiskScore : "—"}
            icon="BarChart3"
            color={avgRiskScore > 70 ? "red" : avgRiskScore > 40 ? "yellow" : "green"}
            description={avgRiskScore > 0 ? getRiskLabel(avgRiskScore) : "No assessments"}
          />
        </div>

        {/* Activity and Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityFeed
              activities={activityItems}
              title="Recent Activity"
              emptyMessage="No recent activity on your submissions"
            />
          </div>
          <QuickActions actions={userQuickActions} />
        </div>

        {/* Submissions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Submissions</h2>
            <Link href="/intake/new">
              <Button size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Assessment
              </Button>
            </Link>
          </div>

          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No assessments yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Start by creating your first AI system assessment to ensure
                  compliance with governance policies.
                </p>
                <Link href="/intake/new">
                  <Button size="lg">Create Your First Assessment</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {submissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="hover:shadow-md transition-all hover:border-[#000070]/20"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {submission.aiSystemName || "Untitled Assessment"}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              statusColors[submission.status]
                            }`}
                          >
                            {statusLabels[submission.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          {submission.vendor
                            ? `Vendor: ${submission.vendor}`
                            : "No vendor specified"}
                          {" • "}
                          Updated {formatRelativeDate(submission.updatedAt)}
                        </p>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                submission.status === "APPROVED"
                                  ? "bg-green-500"
                                  : submission.status === "REJECTED"
                                  ? "bg-red-500"
                                  : "bg-[#000070]"
                              }`}
                              style={{
                                width: `${statusProgress[submission.status]}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-20">
                            {getProgressLabel(submission.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        {submission.riskAssessment && (
                          <div
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              riskLevelColors[submission.riskAssessment.overallLevel]
                            }`}
                          >
                            <span className="text-lg font-bold mr-1">
                              {submission.riskAssessment.overallScore}
                            </span>
                            {submission.riskAssessment.overallLevel}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Link href={`/intake/${submission.id}`}>
                            <Button variant="outline" size="sm">
                              {submission.status === "DRAFT" ? (
                                <>
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </>
                              )}
                            </Button>
                          </Link>
                          {submission.riskAssessment && (
                            <Link href={`/submissions/${submission.id}/assessment`}>
                              <Button variant="outline" size="sm">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                Risk
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getActivityAction(action: string): string {
  const actions: Record<string, string> = {
    CREATED: "Assessment created",
    UPDATED: "Assessment updated",
    SUBMITTED: "Submitted for review",
    APPROVED: "Assessment approved",
    REJECTED: "Assessment rejected",
    CHANGES_REQUESTED: "Changes requested",
    COMMENT_ADDED: "Comment added",
    ESCALATED: "Escalated",
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

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return new Date(date).toLocaleDateString();
}

function getProgressLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "In Progress",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Reviewing",
    APPROVED: "Complete",
    REJECTED: "Closed",
  };
  return labels[status] || status;
}

function getRiskLabel(score: number): string {
  if (score >= 75) return "Critical risk level";
  if (score >= 50) return "High risk level";
  if (score >= 25) return "Medium risk level";
  return "Low risk level";
}
