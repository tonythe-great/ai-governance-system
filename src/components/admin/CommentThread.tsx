"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  author: { name: string | null; email: string };
  createdAt: Date;
  sectionName?: string | null;
}

interface CommentThreadProps {
  submissionId: string;
  reviewId?: string;
  comments: Comment[];
}

export function CommentThread({
  submissionId,
  reviewId,
  comments,
}: CommentThreadProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          reviewId,
          content: newComment,
          isInternal,
        }),
      });

      if (response.ok) {
        setNewComment("");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add comment");
      }
    } catch {
      alert("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Comments & Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded"
              />
              Internal note
            </label>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? "..." : "Add"}
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No comments yet
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg border ${
                  comment.isInternal
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {comment.author.name || comment.author.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                {comment.isInternal && (
                  <span className="inline-block text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded mb-1">
                    Internal
                  </span>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
