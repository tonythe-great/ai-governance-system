import { AISystemSubmission } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateRiskScores, RiskScores } from "@/lib/risk-rules";
import { generateRiskAnalysis } from "@/lib/ai-client";

export interface RiskAssessmentResult {
  id: string;
  submissionId: string;
  overallScore: number;
  overallLevel: string;
  dataPrivacyScore: number;
  oversightScore: number;
  complianceScore: number;
  vendorScore: number;
  riskFlags: string[];
  summary: string;
  recommendations: string[];
  explanation: string;
}

export async function runRiskAssessment(
  submission: AISystemSubmission
): Promise<RiskAssessmentResult> {
  // Step 1: Calculate rule-based scores
  const riskScores: RiskScores = calculateRiskScores(submission);

  // Step 2: Generate AI analysis (explanations and recommendations)
  const submissionData = {
    aiSystemName: submission.aiSystemName,
    useCase: submission.useCase,
    businessPurpose: submission.businessPurpose,
    vendor: submission.vendor,
    currentStage: submission.currentStage,
    numberOfUsers: submission.numberOfUsers,
    outputUsage: submission.outputUsage,
    humanReviewLevel: submission.humanReviewLevel,
    dataTypes: submission.dataTypes,
    vendorDataStorage: submission.vendorDataStorage,
    userTrainingRequired: submission.userTrainingRequired,
    acceptableUseRequired: submission.acceptableUseRequired,
    hasFederalContracts: submission.hasFederalContracts,
    usageLoggingEnabled: submission.usageLoggingEnabled,
    complianceAccess: submission.complianceAccess,
    incidentResponseDoc: submission.incidentResponseDoc,
  };

  const aiAnalysis = await generateRiskAnalysis(submissionData, riskScores);

  // Step 3: Store the assessment in the database
  const assessment = await prisma.riskAssessment.upsert({
    where: { submissionId: submission.id },
    create: {
      submissionId: submission.id,
      overallScore: riskScores.overallScore,
      overallLevel: riskScores.overallLevel,
      dataPrivacyScore: riskScores.dataPrivacyScore,
      oversightScore: riskScores.oversightScore,
      complianceScore: riskScores.complianceScore,
      vendorScore: riskScores.vendorScore,
      riskFlags: riskScores.riskFlags,
      summary: aiAnalysis.summary,
      recommendations: aiAnalysis.recommendations,
      explanation: aiAnalysis.explanation,
    },
    update: {
      overallScore: riskScores.overallScore,
      overallLevel: riskScores.overallLevel,
      dataPrivacyScore: riskScores.dataPrivacyScore,
      oversightScore: riskScores.oversightScore,
      complianceScore: riskScores.complianceScore,
      vendorScore: riskScores.vendorScore,
      riskFlags: riskScores.riskFlags,
      summary: aiAnalysis.summary,
      recommendations: aiAnalysis.recommendations,
      explanation: aiAnalysis.explanation,
    },
  });

  return {
    id: assessment.id,
    submissionId: assessment.submissionId,
    overallScore: assessment.overallScore,
    overallLevel: assessment.overallLevel,
    dataPrivacyScore: assessment.dataPrivacyScore,
    oversightScore: assessment.oversightScore,
    complianceScore: assessment.complianceScore,
    vendorScore: assessment.vendorScore,
    riskFlags: assessment.riskFlags,
    summary: assessment.summary,
    recommendations: assessment.recommendations,
    explanation: assessment.explanation,
  };
}

export async function getAssessmentForSubmission(
  submissionId: string
): Promise<RiskAssessmentResult | null> {
  const assessment = await prisma.riskAssessment.findUnique({
    where: { submissionId },
  });

  if (!assessment) {
    return null;
  }

  return {
    id: assessment.id,
    submissionId: assessment.submissionId,
    overallScore: assessment.overallScore,
    overallLevel: assessment.overallLevel,
    dataPrivacyScore: assessment.dataPrivacyScore,
    oversightScore: assessment.oversightScore,
    complianceScore: assessment.complianceScore,
    vendorScore: assessment.vendorScore,
    riskFlags: assessment.riskFlags,
    summary: assessment.summary,
    recommendations: assessment.recommendations,
    explanation: assessment.explanation,
  };
}
