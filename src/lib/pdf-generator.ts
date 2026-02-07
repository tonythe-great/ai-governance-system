import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SubmissionData {
  id: string;
  aiSystemName: string | null;
  useCase: string | null;
  businessPurpose: string | null;
  vendor: string | null;
  currentStage: string | null;
  numberOfUsers: string | null;
  outputUsage: string | null;
  humanReviewLevel: string | null;
  dataTypes: string[];
  vendorDataStorage: string | null;
  userTrainingRequired: boolean;
  acceptableUseRequired: boolean;
  executiveSponsorName: string | null;
  executiveSponsorTitle: string | null;
  businessOwnerName: string | null;
  businessOwnerEmail: string | null;
  technicalOwnerName: string | null;
  technicalOwnerEmail: string | null;
  hasFederalContracts: string | null;
  usageLoggingEnabled: boolean;
  complianceAccess: boolean;
  incidentResponseDoc: boolean;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  submittedBy?: {
    name: string | null;
    email: string;
  };
  riskAssessment?: {
    overallLevel: string;
    overallScore: number;
    summary: string;
    recommendations: string[];
    riskFlags: string[];
  };
}

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Pending Review",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function generateSubmissionPDF(submission: SubmissionData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("AI Governance Submission Report", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 15;

  // System name and status
  doc.setFontSize(14);
  doc.text(submission.aiSystemName || "Untitled System", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Status: ${statusLabels[submission.status] || submission.status}`,
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 5;

  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 15;

  // Risk Assessment Section (if available)
  if (submission.riskAssessment) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Risk Assessment", 14, yPos);
    yPos += 8;

    const riskColor =
      submission.riskAssessment.overallLevel === "LOW"
        ? [34, 197, 94]
        : submission.riskAssessment.overallLevel === "MEDIUM"
        ? [234, 179, 8]
        : submission.riskAssessment.overallLevel === "HIGH"
        ? [249, 115, 22]
        : [239, 68, 68];

    doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.roundedRect(14, yPos, 50, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(
      `${submission.riskAssessment.overallLevel} RISK (Score: ${submission.riskAssessment.overallScore})`,
      16,
      yPos + 7
    );
    doc.setTextColor(0, 0, 0);
    yPos += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(
      submission.riskAssessment.summary,
      pageWidth - 28
    );
    doc.text(summaryLines, 14, yPos);
    yPos += summaryLines.length * 5 + 10;
  }

  // Basic Information Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Basic Information", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["AI System Name", submission.aiSystemName || "—"],
      ["Vendor", submission.vendor || "—"],
      ["Use Case", submission.useCase || "—"],
      ["Business Purpose", submission.businessPurpose || "—"],
      ["Current Stage", submission.currentStage || "—"],
      ["Number of Users", submission.numberOfUsers || "—"],
    ],
    theme: "striped",
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Human Oversight Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Human Oversight", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Output Usage", submission.outputUsage || "—"],
      ["Human Review Level", submission.humanReviewLevel || "—"],
    ],
    theme: "striped",
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Data & Privacy Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Data & Privacy", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Data Types", submission.dataTypes.join(", ") || "—"],
      ["Vendor Data Storage", submission.vendorDataStorage || "—"],
      ["User Training Required", submission.userTrainingRequired ? "Yes" : "No"],
      [
        "Acceptable Use Required",
        submission.acceptableUseRequired ? "Yes" : "No",
      ],
    ],
    theme: "striped",
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Ownership Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Ownership & Accountability", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      [
        "Executive Sponsor",
        submission.executiveSponsorName
          ? `${submission.executiveSponsorName} (${submission.executiveSponsorTitle || ""})`
          : "—",
      ],
      [
        "Business Owner",
        submission.businessOwnerName
          ? `${submission.businessOwnerName} - ${submission.businessOwnerEmail || ""}`
          : "—",
      ],
      [
        "Technical Owner",
        submission.technicalOwnerName
          ? `${submission.technicalOwnerName} - ${submission.technicalOwnerEmail || ""}`
          : "—",
      ],
    ],
    theme: "striped",
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Compliance Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Compliance & Monitoring", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Federal Contracts", submission.hasFederalContracts || "—"],
      [
        "Usage Logging",
        submission.usageLoggingEnabled ? "Enabled" : "Disabled",
      ],
      ["Compliance Access", submission.complianceAccess ? "Yes" : "No"],
      [
        "Incident Response Doc",
        submission.incidentResponseDoc ? "Yes" : "No",
      ],
    ],
    theme: "striped",
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Recommendations (if available)
  if (
    submission.riskAssessment &&
    submission.riskAssessment.recommendations.length > 0
  ) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Recommendations", 14, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    submission.riskAssessment.recommendations.forEach((rec, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - 28);
      doc.text(lines, 14, yPos);
      yPos += lines.length * 5 + 2;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `AI Governance System - Submission ID: ${submission.id}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Download
  const filename = `ai-governance-${submission.aiSystemName?.replace(/[^a-z0-9]/gi, "-") || submission.id}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
