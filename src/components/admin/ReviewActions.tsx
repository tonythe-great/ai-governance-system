"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ReviewActionsProps {
  submissionId: string;
  currentStatus: string;
  reviewId?: string;
}

export function ReviewActions({
  submissionId,
  currentStatus,
  reviewId,
}: ReviewActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | "request-changes">();

  const canTakeAction =
    currentStatus === "SUBMITTED" || currentStatus === "UNDER_REVIEW";

  const handleAction = async (action: "approve" | "reject" | "request-changes") => {
    if (action === "reject" || action === "request-changes") {
      setActionType(action);
      setShowFeedback(true);
      return;
    }

    await submitAction(action, "");
  };

  const submitAction = async (action: string, notes: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, reviewId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "An error occurred");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setIsLoading(false);
      setShowFeedback(false);
      setFeedback("");
      setActionType(undefined);
    }
  };

  if (!canTakeAction) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Review complete
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => handleAction("approve")}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? "..." : "Approve"}
        </Button>
        <Button
          onClick={() => handleAction("request-changes")}
          disabled={isLoading}
          variant="outline"
          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
        >
          Request Changes
        </Button>
        <Button
          onClick={() => handleAction("reject")}
          disabled={isLoading}
          variant="destructive"
        >
          Reject
        </Button>
      </div>

      {showFeedback && (
        <div className="bg-white p-4 rounded-lg border shadow-lg space-y-3">
          <h3 className="font-medium text-gray-900">
            {actionType === "reject" ? "Rejection Reason" : "Changes Required"}
          </h3>
          <p className="text-sm text-gray-500">
            {actionType === "reject"
              ? "Explain why this submission is being rejected."
              : "Describe what changes are needed before approval."}
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowFeedback(false);
                setFeedback("");
                setActionType(undefined);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitAction(actionType!, feedback)}
              disabled={isLoading || !feedback.trim()}
              className={
                actionType === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }
            >
              {isLoading ? "Submitting..." : "Confirm"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
