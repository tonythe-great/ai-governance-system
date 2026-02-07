"use client";

import { ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditEntry {
  id: string;
  action: string;
  category: string;
  previousStatus: string | null;
  newStatus: string | null;
  fieldName: string | null;
  previousValue: string | null;
  newValue: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  performedBy: {
    name: string | null;
    email: string;
    role: string;
  };
  createdAt: string;
}

interface AuditTrailProps {
  submissionId: string;
}

const actionIcons: Record<string, { bg: string; icon: ReactNode }> = {
  CREATED: {
    bg: "bg-blue-100",
    icon: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  SUBMITTED: {
    bg: "bg-indigo-100",
    icon: (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  UPDATED: {
    bg: "bg-gray-100",
    icon: (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  APPROVED: {
    bg: "bg-green-100",
    icon: (
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  REJECTED: {
    bg: "bg-red-100",
    icon: (
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  CHANGES_REQUESTED: {
    bg: "bg-yellow-100",
    icon: (
      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  COMMENT_ADDED: {
    bg: "bg-purple-100",
    icon: (
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
};

const defaultIcon = {
  bg: "bg-gray-100",
  icon: (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const categoryLabels: Record<string, string> = {
  LIFECYCLE: "Lifecycle",
  STATUS_CHANGE: "Status",
  FORM_EDIT: "Edit",
  COMMENT: "Comment",
};

export function AuditTrail({ submissionId }: AuditTrailProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuditTrail() {
      try {
        const res = await fetch(`/api/admin/submissions/${submissionId}/audit`);
        if (!res.ok) throw new Error("Failed to fetch audit trail");
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAuditTrail();
  }, [submissionId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500 text-center py-4">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No audit entries recorded
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {entries.map((entry) => {
            const { bg, icon } = actionIcons[entry.action] || defaultIcon;
            return (
              <div key={entry.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {entry.description || entry.action}
                      </p>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {categoryLabels[entry.category] || entry.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    by {entry.performedBy.name || entry.performedBy.email}
                    <span className="text-xs ml-1 text-gray-400">
                      ({entry.performedBy.role})
                    </span>
                  </p>
                  {entry.metadata && "changes" in entry.metadata && (
                    <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Fields changed:</p>
                      <ul className="list-disc list-inside">
                        {(entry.metadata.changes as Array<{ field: string }>).slice(0, 5).map((change, i) => (
                          <li key={i}>{change.field}</li>
                        ))}
                        {(entry.metadata.changes as Array<unknown>).length > 5 && (
                          <li>...and {(entry.metadata.changes as Array<unknown>).length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {entry.metadata && "notes" in entry.metadata && (
                    <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                      {String(entry.metadata.notes)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
