"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

// Map of icon names to icon components - keeps icons inside the client component
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Settings,
  TrendingUp,
  TrendingDown,
};

export type IconName = keyof typeof iconMap;

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: IconName;
  description?: string;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  href?: string;
  className?: string;
}

const colorStyles = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    border: "border-blue-100",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    border: "border-green-100",
    text: "text-green-600",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "bg-yellow-100 text-yellow-600",
    border: "border-yellow-100",
    text: "text-yellow-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    border: "border-red-100",
    text: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    border: "border-purple-100",
    text: "text-purple-600",
  },
  gray: {
    bg: "bg-gray-50",
    icon: "bg-gray-100 text-gray-600",
    border: "border-gray-100",
    text: "text-gray-600",
  },
};

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  neutral: "text-gray-500",
};

const TrendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function MetricCard({
  title,
  value,
  icon,
  description,
  trend,
  color = "blue",
  href,
  className,
}: MetricCardProps) {
  const styles = colorStyles[color];
  const Icon = iconMap[icon] || FileText;

  const content = (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md",
        href && "cursor-pointer hover:scale-[1.02]",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
            {trend && (
              <div className={cn("flex items-center gap-1 text-sm", trendColors[trend.direction])}>
                {(() => {
                  const TrendIconComponent = TrendIconMap[trend.direction];
                  return <TrendIconComponent className="h-4 w-4" />;
                })()}
                <span className="font-medium">
                  {trend.direction === "up" ? "+" : trend.direction === "down" ? "" : ""}
                  {trend.value}
                </span>
                <span className="text-gray-500">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", styles.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {/* Decorative gradient corner */}
        <div
          className={cn(
            "absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-20",
            styles.bg
          )}
        />
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

interface MetricCardSkeletonProps {
  className?: string;
}

export function MetricCardSkeleton({ className }: MetricCardSkeletonProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}
