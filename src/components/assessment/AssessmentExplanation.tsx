"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AssessmentExplanationProps {
  explanation: string;
}

export function AssessmentExplanation({ explanation }: AssessmentExplanationProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-gray-600"
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
        Detailed Analysis
      </h3>
      <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:text-gray-700 prose-p:my-2 prose-li:text-gray-700 prose-li:my-0.5 prose-strong:text-gray-900 prose-table:border-collapse prose-table:w-full prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-td:text-gray-700 prose-ul:my-2 prose-ol:my-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
      </div>
    </div>
  );
}
