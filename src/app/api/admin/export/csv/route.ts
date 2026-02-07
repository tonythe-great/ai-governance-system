import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canReviewSubmissions } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role || "";

    if (!canReviewSubmissions(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const riskLevel = searchParams.get("riskLevel");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filter conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // If filtering by risk level, we need to include the assessment
    const includeRiskFilter = riskLevel && riskLevel !== "all";

    const submissions = await prisma.aISystemSubmission.findMany({
      where,
      include: {
        submittedBy: {
          select: { name: true, email: true },
        },
        riskAssessment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by risk level if specified
    const filteredSubmissions = includeRiskFilter
      ? submissions.filter(
          (s) => s.riskAssessment?.overallLevel === riskLevel
        )
      : submissions;

    // Generate CSV content
    const headers = [
      "ID",
      "AI System Name",
      "Vendor",
      "Status",
      "Risk Level",
      "Risk Score",
      "Submitted By",
      "Submitted At",
      "Created At",
      "Use Case",
      "Business Purpose",
      "Current Stage",
      "Number of Users",
      "Output Usage",
      "Human Review Level",
      "Data Types",
      "Vendor Data Storage",
      "User Training Required",
      "Acceptable Use Required",
      "Executive Sponsor",
      "Business Owner",
      "Technical Owner",
      "Federal Contracts",
      "Usage Logging",
      "Compliance Access",
      "Incident Response Doc",
    ];

    const rows = filteredSubmissions.map((s) => [
      s.id,
      s.aiSystemName || "",
      s.vendor || "",
      s.status,
      s.riskAssessment?.overallLevel || "N/A",
      s.riskAssessment?.overallScore?.toString() || "N/A",
      s.submittedBy?.name || s.submittedBy?.email || "",
      s.submittedAt?.toISOString() || "",
      s.createdAt.toISOString(),
      s.useCase || "",
      s.businessPurpose || "",
      s.currentStage || "",
      s.numberOfUsers || "",
      s.outputUsage || "",
      s.humanReviewLevel || "",
      s.dataTypes.join("; "),
      s.vendorDataStorage || "",
      s.userTrainingRequired ? "Yes" : "No",
      s.acceptableUseRequired ? "Yes" : "No",
      s.executiveSponsorName
        ? `${s.executiveSponsorName} (${s.executiveSponsorTitle || ""})`
        : "",
      s.businessOwnerName
        ? `${s.businessOwnerName} - ${s.businessOwnerEmail || ""}`
        : "",
      s.technicalOwnerName
        ? `${s.technicalOwnerName} - ${s.technicalOwnerEmail || ""}`
        : "",
      s.hasFederalContracts || "",
      s.usageLoggingEnabled ? "Enabled" : "Disabled",
      s.complianceAccess ? "Yes" : "No",
      s.incidentResponseDoc ? "Yes" : "No",
    ]);

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => escapeCSV(String(cell))).join(",")),
    ].join("\n");

    // Return as downloadable CSV file
    const filename = `ai-governance-submissions-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  }
}
