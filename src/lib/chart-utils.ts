/**
 * Chart utility functions - can be used in both server and client components
 */

export interface TrendDataPoint {
  date: string;
  submissions: number;
  approved: number;
  rejected: number;
}

/**
 * Generate trend data from submissions for chart display
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
