"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, Plus, FileText, Download, Settings } from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  variant?: "default" | "outline";
  description?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

export function QuickActions({
  actions,
  title = "Quick Actions",
  className,
}: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => (
          <Link key={index} href={action.href} className="block">
            <Button
              variant={action.variant || "outline"}
              className={cn(
                "w-full justify-start gap-3 h-auto py-3",
                action.variant === "default" &&
                  "text-white hover:opacity-90"
              )}
              style={action.variant === "default" ? { backgroundColor: "#000070" } : undefined}
            >
              <action.icon className="h-5 w-5 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
                {action.description && (
                  <div
                    className={cn(
                      "text-xs",
                      action.variant === "default"
                        ? "text-white/70"
                        : "text-gray-500"
                    )}
                  >
                    {action.description}
                  </div>
                )}
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// Pre-defined quick action sets
export const userQuickActions: QuickAction[] = [
  {
    label: "New AI Assessment",
    href: "/intake/new",
    icon: Plus,
    variant: "default",
    description: "Start a new AI system submission",
  },
  {
    label: "View All Submissions",
    href: "/dashboard",
    icon: FileText,
    description: "See all your AI assessments",
  },
];

export const adminQuickActions: QuickAction[] = [
  {
    label: "Review Queue",
    href: "/admin/reviews",
    icon: FileText,
    variant: "default",
    description: "View pending submissions",
  },
  {
    label: "Export Reports",
    href: "/admin/reports",
    icon: Download,
    description: "Generate CSV or PDF exports",
  },
];
