import { prisma } from "@/lib/prisma";
import { requireReviewer } from "@/lib/admin-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportControls } from "@/components/admin/ExportControls";

export default async function ReportsPage() {
  await requireReviewer();

  // Get submission stats
  const stats = await prisma.aISystemSubmission.groupBy({
    by: ["status"],
    _count: true,
  });

  const riskStats = await prisma.riskAssessment.groupBy({
    by: ["overallLevel"],
    _count: true,
  });

  const totalSubmissions = stats.reduce((acc, s) => acc + s._count, 0);
  const submittedCount = stats.find((s) => s.status === "SUBMITTED")?._count || 0;
  const underReviewCount = stats.find((s) => s.status === "UNDER_REVIEW")?._count || 0;
  const approvedCount = stats.find((s) => s.status === "APPROVED")?._count || 0;
  const rejectedCount = stats.find((s) => s.status === "REJECTED")?._count || 0;

  const lowRisk = riskStats.find((s) => s.overallLevel === "LOW")?._count || 0;
  const mediumRisk = riskStats.find((s) => s.overallLevel === "MEDIUM")?._count || 0;
  const highRisk = riskStats.find((s) => s.overallLevel === "HIGH")?._count || 0;
  const criticalRisk = riskStats.find((s) => s.overallLevel === "CRITICAL")?._count || 0;

  // Calculate approval rate
  const decidedCount = approvedCount + rejectedCount;
  const approvalRate = decidedCount > 0 ? Math.round((approvedCount / decidedCount) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>
        <p className="text-gray-500 mt-1">
          View metrics and export submission data
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{totalSubmissions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {submittedCount + underReviewCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approvalRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              High/Critical Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {highRisk + criticalRisk}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar
                label="Pending Review"
                count={submittedCount}
                total={totalSubmissions}
                color="bg-blue-500"
              />
              <StatusBar
                label="Under Review"
                count={underReviewCount}
                total={totalSubmissions}
                color="bg-yellow-500"
              />
              <StatusBar
                label="Approved"
                count={approvedCount}
                total={totalSubmissions}
                color="bg-green-500"
              />
              <StatusBar
                label="Rejected"
                count={rejectedCount}
                total={totalSubmissions}
                color="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar
                label="Low Risk"
                count={lowRisk}
                total={totalSubmissions}
                color="bg-green-500"
              />
              <StatusBar
                label="Medium Risk"
                count={mediumRisk}
                total={totalSubmissions}
                color="bg-yellow-500"
              />
              <StatusBar
                label="High Risk"
                count={highRisk}
                total={totalSubmissions}
                color="bg-orange-500"
              />
              <StatusBar
                label="Critical Risk"
                count={criticalRisk}
                total={totalSubmissions}
                color="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportControls />
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
