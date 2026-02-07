import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { SignOutButton } from "@/components/auth/SignOutButton";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const riskLevelColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
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
              <h1 className="text-xl font-semibold text-gray-900">
                AI Governance Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Enterprise Governance Assessment
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Assessments</h2>
          <Link href="/intake/new">
            <Button>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No assessments yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start by creating your first AI system assessment.
              </p>
              <Link href="/intake/new">
                <Button>Create Your First Assessment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {submission.aiSystemName || "Untitled Assessment"}
                      </CardTitle>
                      <CardDescription>
                        {submission.vendor
                          ? `Vendor: ${submission.vendor}`
                          : "No vendor specified"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.riskAssessment && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            riskLevelColors[submission.riskAssessment.overallLevel]
                          }`}
                        >
                          {submission.riskAssessment.overallLevel} Risk
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[submission.status]
                        }`}
                      >
                        {statusLabels[submission.status]}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Created:{" "}
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Updated:{" "}
                        {new Date(submission.updatedAt).toLocaleDateString()}
                      </span>
                      {submission.submittedAt && (
                        <span>
                          Submitted:{" "}
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/intake/${submission.id}`}>
                        <Button variant="outline" size="sm">
                          {submission.status === "DRAFT" ? "Edit" : "View"}
                        </Button>
                      </Link>
                      {submission.riskAssessment && (
                        <Link href={`/submissions/${submission.id}/assessment`}>
                          <Button variant="outline" size="sm">
                            View Risk
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
