"use client";

interface RiskScoreCardProps {
  score: number;
  level: string;
  summary: string;
}

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  MEDIUM: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  HIGH: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const levelLabels: Record<string, string> = {
  LOW: "Low Risk",
  MEDIUM: "Medium Risk",
  HIGH: "High Risk",
  CRITICAL: "Critical Risk",
};

export function RiskScoreCard({ score, level, summary }: RiskScoreCardProps) {
  const colors = levelColors[level] || levelColors.MEDIUM;

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Risk Assessment</h2>
          <p className="text-sm text-gray-600">AI-powered analysis of your submission</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${colors.text}`}>{score}</div>
          <div className="text-sm text-gray-500">/ 100</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          {levelLabels[level] || level}
        </span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              level === "LOW"
                ? "bg-green-500"
                : level === "MEDIUM"
                ? "bg-yellow-500"
                : level === "HIGH"
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <p className="text-gray-700">{summary}</p>
    </div>
  );
}
