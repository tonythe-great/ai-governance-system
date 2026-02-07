"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendDataPoint {
  date: string;
  submissions: number;
  approved: number;
  rejected: number;
}

interface SubmissionTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  className?: string;
}

export function SubmissionTrendChart({
  data,
  title = "Submissions Over Time",
  className,
}: SubmissionTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white shadow-lg rounded-lg p-3 border">
                        <p className="font-medium text-gray-900 mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                          >
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                name="Submissions"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorSubmissions)"
              />
              <Area
                type="monotone"
                dataKey="approved"
                name="Approved"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorApproved)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Submissions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Approved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to generate trend data from submissions
 */
export function generateTrendData(
  submissions: Array<{
    submittedAt: Date | null;
    status: string;
  }>,
  days: number = 30
): TrendDataPoint[] {
  const now = new Date();
  const result: TrendDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const daySubmissions = submissions.filter((s) => {
      if (!s.submittedAt) return false;
      const submittedDate = new Date(s.submittedAt);
      return submittedDate >= dayStart && submittedDate <= dayEnd;
    });

    result.push({
      date: dateStr,
      submissions: daySubmissions.length,
      approved: daySubmissions.filter((s) => s.status === "APPROVED").length,
      rejected: daySubmissions.filter((s) => s.status === "REJECTED").length,
    });
  }

  return result;
}
