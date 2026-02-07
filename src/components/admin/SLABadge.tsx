"use client";

import { useMemo } from "react";
import { calculateSLAStatus, getSLAStatusColors, getSLAStatusLabel } from "@/lib/sla";
import { getPriorityColors, getPriorityLabel } from "@/lib/workflow-config";

interface SLABadgeProps {
  submittedAt: Date | string | null;
  dueDate: Date | string | null;
  riskLevel: string | null;
  escalationLevel?: number;
  showPriority?: boolean;
  priority?: string;
}

export function SLABadge({
  submittedAt,
  dueDate,
  riskLevel,
  escalationLevel = 0,
  showPriority = false,
  priority,
}: SLABadgeProps) {
  const slaInfo = useMemo(() => {
    return calculateSLAStatus({
      submittedAt: submittedAt ? new Date(submittedAt) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      riskLevel,
      currentEscalationLevel: escalationLevel,
    });
  }, [submittedAt, dueDate, riskLevel, escalationLevel]);

  if (!dueDate) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {showPriority && priority && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColors(priority)}`}
        >
          {getPriorityLabel(priority)}
        </span>
      )}
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSLAStatusColors(slaInfo.status)}`}
        title={`Due: ${new Date(dueDate).toLocaleString()}`}
      >
        {slaInfo.status === "OVERDUE" && (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
        {slaInfo.status === "AT_RISK" && (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {getSLAStatusLabel(slaInfo.status)}: {slaInfo.displayText}
      </span>
      {escalationLevel > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          Escalated L{escalationLevel}
        </span>
      )}
    </div>
  );
}

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColors(priority)}`}
    >
      {getPriorityLabel(priority)}
    </span>
  );
}
