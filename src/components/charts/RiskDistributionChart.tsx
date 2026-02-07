"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface RiskData {
  name: string;
  value: number;
  color: string;
}

interface RiskDistributionChartProps {
  data: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  title?: string;
  className?: string;
}

const RISK_COLORS = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export function RiskDistributionChart({
  data,
  title = "Risk Distribution",
  className,
}: RiskDistributionChartProps) {
  const chartData: RiskData[] = [
    { name: "Low", value: data.low, color: RISK_COLORS.LOW },
    { name: "Medium", value: data.medium, color: RISK_COLORS.MEDIUM },
    { name: "High", value: data.high, color: RISK_COLORS.HIGH },
    { name: "Critical", value: data.critical, color: RISK_COLORS.CRITICAL },
  ].filter((item) => item.value > 0);

  const total = data.low + data.medium + data.high + data.critical;

  if (total === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No risk data available
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as RiskData;
                    const percentage = ((data.value / total) * 100).toFixed(1);
                    return (
                      <div className="bg-white shadow-lg rounded-lg p-3 border">
                        <p className="font-medium">{data.name} Risk</p>
                        <p className="text-sm text-gray-600">
                          {data.value} submissions ({percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-sm text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Summary below chart */}
        <div className="grid grid-cols-4 gap-2 mt-2 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{data.low}</div>
            <div className="text-xs text-gray-500">Low</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{data.medium}</div>
            <div className="text-xs text-gray-500">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{data.high}</div>
            <div className="text-xs text-gray-500">High</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{data.critical}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
