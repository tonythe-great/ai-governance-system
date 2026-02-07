import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewAction {
  id: string;
  action: string;
  previousStatus: string | null;
  newStatus: string | null;
  notes: string | null;
  performedBy: { name: string | null; email: string };
  createdAt: Date;
}

interface ReviewHistoryProps {
  actions: ReviewAction[];
}

const actionLabels: Record<string, string> = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CHANGES_REQUESTED: "Changes Requested",
  ASSIGNED: "Assigned",
  STATUS_CHANGED: "Status Changed",
  COMMENT_ADDED: "Comment Added",
};

const actionIcons: Record<string, ReactNode> = {
  APPROVED: (
    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  REJECTED: (
    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  CHANGES_REQUESTED: (
    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
};

const defaultIcon = (
  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
);

export function ReviewHistory({ actions }: ReviewHistoryProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No activity recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div key={action.id} className="flex gap-3">
              {actionIcons[action.action] || defaultIcon}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {actionLabels[action.action] || action.action}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(action.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  by {action.performedBy.name || action.performedBy.email}
                </p>
                {action.notes && (
                  <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                    {action.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
