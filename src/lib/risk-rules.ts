import { AISystemSubmission } from "@prisma/client";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskScores {
  dataPrivacyScore: number;
  oversightScore: number;
  complianceScore: number;
  vendorScore: number;
  overallScore: number;
  overallLevel: RiskLevel;
  riskFlags: string[];
}

const WEIGHTS = {
  dataPrivacy: 0.35,
  oversight: 0.25,
  compliance: 0.25,
  vendor: 0.15,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

function scoreDataPrivacy(submission: AISystemSubmission): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];
  const dataTypes = submission.dataTypes || [];

  // High-risk data types
  if (dataTypes.includes("health")) {
    score += 40;
    flags.push("Handles protected health information (PHI)");
  }
  if (dataTypes.includes("pii")) {
    score += 30;
    flags.push("Processes personally identifiable information (PII)");
  }
  if (dataTypes.includes("financial")) {
    score += 25;
    flags.push("Accesses financial data");
  }

  // Medium-risk data types
  if (dataTypes.includes("customer")) {
    score += 15;
    flags.push("Uses customer data");
  }
  if (dataTypes.includes("employee")) {
    score += 10;
    flags.push("Processes employee data");
  }

  // Low-risk data types (minimal score)
  if (dataTypes.includes("business_strategy")) {
    score += 5;
  }
  if (dataTypes.includes("internal_docs")) {
    score += 3;
  }

  // Vendor storage multiplier
  if (submission.vendorDataStorage === "persistent") {
    score = Math.round(score * 1.3);
    flags.push("Vendor stores data persistently");
  } else if (submission.vendorDataStorage === "unknown") {
    score = Math.round(score * 1.5);
    flags.push("Vendor data storage policy is unknown");
  }

  // No training required is a risk
  if (!submission.userTrainingRequired && dataTypes.length > 0) {
    score += 10;
    flags.push("No user training required despite handling sensitive data");
  }

  return { score: clamp(score, 0, 100), flags };
}

function scoreOversight(submission: AISystemSubmission): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];

  // Output usage risk
  switch (submission.outputUsage) {
    case "direct_action":
      score += 45;
      flags.push("AI output used for direct action without review");
      break;
    case "automated_with_oversight":
      score += 25;
      break;
    case "advisory_only":
      score += 10;
      break;
    case "human_review_required":
      score += 5;
      break;
  }

  // Human review level
  switch (submission.humanReviewLevel) {
    case "none":
      score += 45;
      flags.push("No human review of AI outputs");
      break;
    case "spot_check":
      score += 30;
      flags.push("Only spot-check review of outputs");
      break;
    case "review_before_critical":
      score += 15;
      break;
    case "always_reviewed":
      score += 5;
      break;
  }

  return { score: clamp(score, 0, 100), flags };
}

function scoreCompliance(submission: AISystemSubmission): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];

  // Federal contracts trigger major compliance requirements
  if (submission.hasFederalContracts === "yes") {
    score += 40;
    flags.push("Federal contracts require FedRAMP/FISMA compliance");
  } else if (submission.hasFederalContracts === "unknown") {
    score += 20;
    flags.push("Federal contract status unknown - potential compliance gap");
  }

  // No usage logging
  if (!submission.usageLoggingEnabled) {
    score += 20;
    flags.push("Usage logging not enabled - audit trail missing");
  }

  // No compliance team access
  if (!submission.complianceAccess) {
    score += 15;
    flags.push("Compliance team lacks access to system");
  }

  // No incident response documentation
  if (!submission.incidentResponseDoc) {
    score += 15;
    flags.push("No incident response documentation");
  }

  // No acceptable use policy
  if (!submission.acceptableUseRequired) {
    score += 10;
    flags.push("No acceptable use agreement required");
  }

  return { score: clamp(score, 0, 100), flags };
}

function scoreVendor(submission: AISystemSubmission): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];

  // Newer/less established vendors may have higher risk
  const establishedVendors = ["openai", "anthropic", "google", "microsoft", "amazon"];
  const vendor = submission.vendor?.toLowerCase() || "";

  if (vendor && !establishedVendors.includes(vendor)) {
    score += 25;
    flags.push("Using non-major AI vendor - may need additional due diligence");
  }

  // Stage of deployment
  switch (submission.currentStage) {
    case "production":
      score += 20;
      flags.push("System is in production - changes require careful rollout");
      break;
    case "testing":
      score += 10;
      break;
    case "development":
      score += 5;
      break;
    case "evaluation":
      score += 0;
      break;
  }

  // Large user base increases impact
  switch (submission.numberOfUsers) {
    case "1000+":
      score += 25;
      flags.push("Large user base (1000+) increases impact of issues");
      break;
    case "201-1000":
      score += 15;
      break;
    case "51-200":
      score += 10;
      break;
    case "11-50":
      score += 5;
      break;
    case "1-10":
      score += 0;
      break;
  }

  // Unknown vendor data storage
  if (submission.vendorDataStorage === "unknown") {
    score += 20;
  }

  return { score: clamp(score, 0, 100), flags };
}

export function calculateRiskScores(submission: AISystemSubmission): RiskScores {
  const dataPrivacy = scoreDataPrivacy(submission);
  const oversight = scoreOversight(submission);
  const compliance = scoreCompliance(submission);
  const vendor = scoreVendor(submission);

  // Calculate weighted overall score
  const overallScore = Math.round(
    dataPrivacy.score * WEIGHTS.dataPrivacy +
    oversight.score * WEIGHTS.oversight +
    compliance.score * WEIGHTS.compliance +
    vendor.score * WEIGHTS.vendor
  );

  // Collect all flags
  const allFlags = [
    ...dataPrivacy.flags,
    ...oversight.flags,
    ...compliance.flags,
    ...vendor.flags,
  ];

  return {
    dataPrivacyScore: dataPrivacy.score,
    oversightScore: oversight.score,
    complianceScore: compliance.score,
    vendorScore: vendor.score,
    overallScore: clamp(overallScore, 0, 100),
    overallLevel: getRiskLevel(overallScore),
    riskFlags: allFlags,
  };
}
