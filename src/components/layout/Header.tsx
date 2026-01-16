"use client";

import Link from "next/link";

interface HeaderProps {
  showBackToDashboard?: boolean;
}

export function Header({ showBackToDashboard = true }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
            <h1 className="text-xl font-semibold text-gray-900">AI System Intake Form</h1>
            <p className="text-sm text-gray-500">Enterprise Governance Assessment</p>
          </div>
        </div>
        {showBackToDashboard && (
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        )}
      </div>
    </header>
  );
}
