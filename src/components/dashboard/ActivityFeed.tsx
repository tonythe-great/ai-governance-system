"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  Send,
  Edit,
  LucideIcon,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  systemName?: string;
  user?: string;
  type: "created" | "submitted" | "approved" | "rejected" | "comment" | "updated" | "escalated" | "changes_requested";
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
}

const activityConfig: Record<
  ActivityItem["type"],
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  created: {
    icon: FileText,
    color: "text-[#000070]",
    bgColor: "bg-[#000070]/10",
  },
  submitted: {
    icon: Send,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  comment: {
    icon: MessageSquare,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  updated: {
    icon: Edit,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  escalated: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  changes_requested: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
}

export function ActivityFeed({
  activities,
  title = "Recent Activity",
  emptyMessage = "No recent activity",
  maxItems = 5,
  className,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "flex gap-3",
                    index !== displayedActivities.length - 1 && "pb-4 border-b"
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 p-2 rounded-lg",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                      {activity.user && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            {activity.user}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ActivityFeedSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardHeader className="pb-3">
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 pb-4 border-b last:border-0">
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-56 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
