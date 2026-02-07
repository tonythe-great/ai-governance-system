import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RiskScoreCard } from "@/components/assessment/RiskScoreCard";
import { RiskCategoryBreakdown } from "@/components/assessment/RiskCategoryBreakdown";
import { RecommendationsList } from "@/components/assessment/RecommendationsList";
import { AssessmentExplanation } from "@/components/assessment/AssessmentExplanation";
import { Button } from "@/components/ui/button";

interface AssessmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const userId = (session.user as { id?: string }).id;

  // Get submission with assessment
  const submission = await prisma.aISystemSubmission.findUnique({
    where: { id },
    include: { riskAssessment: true },
  });

  if (!submission) {
    notFound();
  }

  if (submission.submittedById !== userId) {
    redirect("/dashboard");
  }

  const assessment = submission.riskAssessment;

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 mt-2">Risk Assessment</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              No Assessment Available
            </h2>
            <p className="text-yellow-700 mb-4">
              Risk assessments are generated when you submit your form. This submission
              {submission.status === "DRAFT"
                ? " is still a draft."
                : " may have been submitted before the assessment feature was available."}
            </p>
            {submission.status === "DRAFT" && (
              <Link href={`/intake/${id}`}>
                <Button>Continue Editing</Button>
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            &larr; Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {submission.aiSystemName || "Untitled"} - Risk Assessment
              </h1>
              <p className="text-sm text-gray-500">
                Generated on {new Date(assessment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link href={`/intake/${id}`}>
              <Button variant="outline" size="sm">
                View Submission
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Overall Score */}
        <RiskScoreCard
          score={assessment.overallScore}
          level={assessment.overallLevel}
          summary={assessment.summary}
        />

        {/* Two-column layout for categories and recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <RiskCategoryBreakdown
            dataPrivacyScore={assessment.dataPrivacyScore}
            oversightScore={assessment.oversightScore}
            complianceScore={assessment.complianceScore}
            vendorScore={assessment.vendorScore}
          />
          <RecommendationsList
            recommendations={assessment.recommendations}
            riskFlags={assessment.riskFlags}
          />
        </div>

        {/* Detailed Explanation */}
        <AssessmentExplanation explanation={assessment.explanation} />
      </main>
    </div>
  );
}
