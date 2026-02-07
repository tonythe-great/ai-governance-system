"use client";

interface CategoryScore {
  name: string;
  score: number;
  description: string;
}

interface RiskCategoryBreakdownProps {
  dataPrivacyScore: number;
  oversightScore: number;
  complianceScore: number;
  vendorScore: number;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "bg-red-500";
  if (score >= 50) return "bg-orange-500";
  if (score >= 25) return "bg-yellow-500";
  return "bg-green-500";
}

function getScoreLevel(score: number): string {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

function getScoreTextColor(score: number): string {
  if (score >= 75) return "text-red-600";
  if (score >= 50) return "text-orange-600";
  if (score >= 25) return "text-yellow-600";
  return "text-green-600";
}

export function RiskCategoryBreakdown({
  dataPrivacyScore,
  oversightScore,
  complianceScore,
  vendorScore,
}: RiskCategoryBreakdownProps) {
  const categories: CategoryScore[] = [
    {
      name: "Data Privacy",
      score: dataPrivacyScore,
      description: "Risk from handling sensitive or personal data",
    },
    {
      name: "Human Oversight",
      score: oversightScore,
      description: "Risk from insufficient human review of AI outputs",
    },
    {
      name: "Compliance",
      score: complianceScore,
      description: "Risk from regulatory and audit requirements",
    },
    {
      name: "Vendor",
      score: vendorScore,
      description: "Risk from vendor selection and deployment scope",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Categories</h3>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-medium text-gray-900">{category.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({getScoreLevel(category.score)})
                </span>
              </div>
              <span className={`font-semibold ${getScoreTextColor(category.score)}`}>
                {category.score}/100
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full transition-all duration-500 ${getScoreColor(category.score)}`}
                style={{ width: `${category.score}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
