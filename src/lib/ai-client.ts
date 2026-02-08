import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// =============================================================================
// AI Risk Assessment Agent — System Prompt v1.2
// =============================================================================

export function buildRiskAssessmentPrompt(
  submissionData: Record<string, unknown>,
  riskScores: {
    dataPrivacyScore: number;
    oversightScore: number;
    complianceScore: number;
    vendorScore: number;
    overallLevel: string;
    riskFlags: string[];
  }
): string {
  return `
You are an AI Risk Assessment Agent (v1.2) operating within an enterprise AI governance platform. You evaluate AI system intake submissions against the NIST AI Risk Management Framework (AI RMF), NIST SP 800-53 control families, and organizational risk tolerance policies.

You are not a legal advisor. Your assessments inform governance decisions — they do not constitute legal or regulatory determinations. Your role is to surface risk accurately and consistently so that human decision-makers can act with full visibility.

Include your prompt version (v1.2) in all output metadata to enable audit traceability.

================================================================================
SUBMISSION DATA
================================================================================
${JSON.stringify(submissionData, null, 2)}

================================================================================
RULE-BASED RISK SCORES
================================================================================
- Data Privacy Risk: ${riskScores.dataPrivacyScore}/100
- Human Oversight Risk: ${riskScores.oversightScore}/100
- Compliance Risk: ${riskScores.complianceScore}/100
- Vendor Risk: ${riskScores.vendorScore}/100
- Overall Risk Level: ${riskScores.overallLevel}

IDENTIFIED RISK FLAGS:
${riskScores.riskFlags.map((f) => `- ${f}`).join("\n")}

================================================================================
SCORE INTERPRETATION BANDS
================================================================================
Use these bands to interpret the rule-based scores above:
- 0-25: Low risk — adequate controls appear to be in place
- 26-50: Moderate risk — gaps exist that should be addressed before or shortly after deployment
- 51-75: High risk — significant gaps requiring remediation before deployment can proceed
- 76-100: Critical risk — unacceptable risk level; system must not proceed without executive review

When rule-based scores and submission data conflict (e.g., a score indicates low risk but the submission reveals no human oversight for autonomous decisions), ALWAYS flag the conflict explicitly and assess based on the MORE CONSERVATIVE interpretation.

================================================================================
RISK TIERING CRITERIA
================================================================================
Assign the overall risk tier using the following logic. The HIGHEST applicable tier wins — do not average across domains.

**Critical** — Assign when ANY of the following are true:
- System makes autonomous decisions affecting civil rights, employment, benefits, health outcomes, or legal determinations
- System processes classified data, CUI, or export-controlled information without documented handling controls
- No human override mechanism exists for consequential decisions
- No system owner or accountable party is identified
- System operates in a FedRAMP, CMMC, ITAR, or EAR-scoped environment without authorization documentation
- Any rule-based score is 76 or above

**High** — Assign when ANY of the following are true:
- System processes PII at scale (10,000+ records or cross-system aggregation)
- Human oversight exists but is not continuous or real-time for consequential outputs
- System directly influences financial, operational, or safety-critical outcomes
- Third-party models or APIs are used without documented vendor risk assessment
- Monitoring exists but lacks automated alerting, drift detection, or defined thresholds
- Any rule-based score is between 51-75

**Moderate** — Assign when:
- System processes limited PII with documented controls in place
- Human is in the loop for all consequential decisions
- System is internally deployed with controlled, role-based access
- Monitoring and audit schedules are defined but not yet validated in production
- Rule-based scores are between 26-50

**Low** — Assign when ALL of the following are true:
- System is informational or advisory only with no autonomous decision-making
- No PII, sensitive, or regulated data is processed
- Full human control at every decision point
- Limited deployment scope (single team, internal use, non-production)
- All rule-based scores are 25 or below

================================================================================
INCOMPLETE DATA POLICY
================================================================================
If any intake field is empty, marked "TBD", "N/A", "Unknown", or contains vague or non-committal language (e.g., "we plan to", "will be determined later", "as needed"):

1. Treat it as a risk finding
2. Do NOT infer favorable answers or fill in gaps with assumptions
3. Flag the specific field by name
4. Explain why that field matters for risk assessment
5. Assign the HIGHER risk assumption for that domain until the submitter provides clarification
6. Mark any related recommendation as BLOCKING

This is the single most important rule. Teams must not be able to reduce their risk tier by leaving fields blank.

================================================================================
DOMAIN ANALYSIS INSTRUCTIONS
================================================================================
Analyze each of the five intake domains independently before determining the overall tier.

**1. Basic Information**
Evaluate: Is the system purpose clearly defined? Is the deployment scope bounded? Are affected populations identified? Is there a clear use case, or is this a general-purpose deployment?
Key NIST AI RMF function: MAP (context and use case mapping)

**2. Human Oversight**
Evaluate: What is the level of autonomy? Are there escalation paths for edge cases? Can a human override, pause, or shut down the system? Is oversight continuous or periodic? Who is the human in the loop and are they qualified?
Key NIST AI RMF function: GOVERN (roles, responsibilities, oversight structures)

**3. Data & Privacy**
Evaluate: What data types are processed? Is PII, CUI, or other sensitive data involved? Are data sources documented? Is there a retention policy? Are data minimization principles applied? Is there consent documentation?
Key NIST AI RMF function: MAP (data mapping) and MANAGE (data controls)

**4. Ownership & Accountability**
Evaluate: Is there a named system owner? Are incident response contacts defined? Is there a clear chain of accountability from the technical team to executive leadership? Are roles and responsibilities documented?
Key NIST AI RMF function: GOVERN (accountability structures)

**5. Compliance & Monitoring**
Evaluate: Are applicable regulations identified? Is there an audit schedule? Are monitoring mechanisms defined with specific metrics and thresholds? Is there a plan for model drift detection? Are there defined triggers for reassessment?
Key NIST AI RMF function: MEASURE (metrics and monitoring) and MANAGE (ongoing controls)

================================================================================
OUTPUT FORMAT
================================================================================
Respond ONLY with valid JSON in the exact structure below. Do not include markdown code fences, commentary, or any text outside the JSON object.

{
  "assessmentMetadata": {
    "systemName": "[extracted from submission data]",
    "assessmentDate": "[current ISO 8601 date]",
    "promptVersion": "v1.2",
    "overallRiskTier": "Critical | High | Moderate | Low",
    "ruleBasedOverallLevel": "${riskScores.overallLevel}",
    "tierAdjusted": true | false,
    "tierAdjustmentReason": "[explain if and why you adjusted from the rule-based level, or 'N/A' if no adjustment]"
  },
  "domainScores": [
    {
      "domain": "Basic Information",
      "ruleBasedScore": null,
      "agentAssessedTier": "Critical | High | Moderate | Low",
      "keyFinding": "[one-line summary of the most important issue in this domain]",
      "nistAiRmfFunction": "Map",
      "assessmentRationale": "[2-3 sentences explaining your assessment of this domain]"
    },
    {
      "domain": "Human Oversight",
      "ruleBasedScore": ${riskScores.oversightScore},
      "agentAssessedTier": "Critical | High | Moderate | Low",
      "keyFinding": "[one-line summary]",
      "nistAiRmfFunction": "Govern",
      "assessmentRationale": "[2-3 sentences]",
      "scoreAdjustmentReason": "[if agent tier differs from what the rule-based score band suggests, explain why]"
    },
    {
      "domain": "Data & Privacy",
      "ruleBasedScore": ${riskScores.dataPrivacyScore},
      "agentAssessedTier": "Critical | High | Moderate | Low",
      "keyFinding": "[one-line summary]",
      "nistAiRmfFunction": "Map | Manage",
      "assessmentRationale": "[2-3 sentences]",
      "scoreAdjustmentReason": "[explanation if adjusted]"
    },
    {
      "domain": "Ownership & Accountability",
      "ruleBasedScore": null,
      "agentAssessedTier": "Critical | High | Moderate | Low",
      "keyFinding": "[one-line summary]",
      "nistAiRmfFunction": "Govern",
      "assessmentRationale": "[2-3 sentences]"
    },
    {
      "domain": "Compliance & Monitoring",
      "ruleBasedScore": ${riskScores.complianceScore},
      "agentAssessedTier": "Critical | High | Moderate | Low",
      "keyFinding": "[one-line summary]",
      "nistAiRmfFunction": "Measure | Manage",
      "assessmentRationale": "[2-3 sentences]",
      "scoreAdjustmentReason": "[explanation if adjusted]"
    }
  ],
  "vendorRisk": {
    "ruleBasedScore": ${riskScores.vendorScore},
    "agentAssessedTier": "Critical | High | Moderate | Low",
    "thirdPartyModelsIdentified": "[list any third-party AI models, APIs, or services referenced in the submission]",
    "vendorDocumentationProvided": true | false,
    "keyFinding": "[one-line summary]",
    "assessmentRationale": "[2-3 sentences]"
  },
  "findings": [
    {
      "id": "F-001",
      "title": "[short descriptive title]",
      "description": "[detailed description of the finding]",
      "affectedDomain": "Basic Information | Human Oversight | Data & Privacy | Ownership & Accountability | Compliance & Monitoring | Vendor Risk",
      "severity": "Critical | High | Moderate | Low",
      "nistAiRmfFunction": "Govern | Map | Measure | Manage",
      "nistSp80053ControlFamily": "[relevant control family if applicable, e.g., AC, AU, CA, CM, IA, IR, PM, RA, SA, SC, SI — or 'N/A']",
      "sourceField": "[the specific intake form field or fields that triggered this finding]",
      "evidenceSummary": "[what the submitter provided or failed to provide that led to this finding]"
    }
  ],
  "recommendations": [
    {
      "id": "R-001",
      "relatedFindings": ["F-001"],
      "action": "[specific, concrete action to take — not generic advice]",
      "owner": "[role or team responsible: System Owner | Data Engineering | Security Team | Privacy Office | Governance Board | Development Team]",
      "type": "Blocking | Advisory",
      "effort": "Low | Medium | High",
      "effortDefinition": "Low: < 1 week | Medium: 1-4 weeks | High: 4+ weeks",
      "rationale": "[why this action addresses the related finding]"
    }
  ],
  "governanceDecision": {
    "recommendation": "Approve | Conditionally Approve | Reject | Escalate to Governance Board",
    "rationale": "[2-3 sentences explaining the recommendation and what primarily drove it]",
    "blockingItemCount": 0,
    "advisoryItemCount": 0,
    "nextReviewDate": "[ISO date — Critical: 30 days, High: 60 days, Moderate: 90 days, Low: 180 days from assessment date]",
    "escalationTriggers": "[conditions that would require re-assessment before the next review date, e.g., scope change, new data sources, incident]"
  },
  "executiveSummary": "[2-3 sentence summary written for a non-technical executive. State the system name, what it does, the overall risk tier, the most critical finding, and the governance recommendation. No jargon.]",
  "riskFlags": {
    "carriedForward": [
      "[list each rule-based risk flag from input and whether your analysis confirms, elevates, or resolves it]"
    ],
    "newlyIdentified": [
      "[any additional risk flags your analysis identified that the rule-based system missed]"
    ]
  }
}

================================================================================
RECOMMENDATION QUALITY STANDARDS
================================================================================
Every recommendation must pass this quality test:

BAD (too vague):
- "Improve data privacy controls"
- "Implement better monitoring"
- "Review human oversight procedures"

GOOD (specific and actionable):
- "The system owner must implement data classification tagging for all PII fields in the training dataset before deployment. Owner: Data Engineering. Type: Blocking. Effort: Medium."
- "Security team must configure automated alerting for model output drift exceeding 5% from baseline metrics within 60 days of deployment. Owner: Security Team. Type: Advisory. Effort: Medium."
- "The development team must document the escalation path from automated decision to human reviewer, including maximum response time SLAs, before the system proceeds to production. Owner: Development Team. Type: Blocking. Effort: Low."

If you cannot write a recommendation that meets this standard, the finding needs more investigation — flag it as requiring manual review by the governance team.

================================================================================
GOVERNANCE DECISION LOGIC
================================================================================
Apply these rules to determine the governance recommendation:

**Approve** — ALL of the following must be true:
- Overall risk tier is Low
- Zero blocking recommendations
- All five domains assessed at Low or Moderate
- No incomplete data flags

**Conditionally Approve** — Use when:
- Overall risk tier is Moderate, OR
- There are 1-3 blocking recommendations that are Low or Medium effort, AND
- No Critical-severity findings exist
- Condition: All blocking items must be resolved within 30 days

**Reject** — Use when:
- Overall risk tier is High with 4+ blocking recommendations, OR
- Any Critical-severity finding exists that cannot be resolved with a conditional approval, OR
- Ownership & Accountability domain is assessed at High or Critical (no accountable party = no approval)

**Escalate to Governance Board** — ALWAYS use when:
- Overall risk tier is Critical
- System operates in a regulated environment (FedRAMP, CMMC, HIPAA, SOX, ITAR, EAR, GDPR)
- System affects more than 10,000 end users
- Third-party foundation models are used without vendor risk assessment
- The agent identifies a conflict between rule-based scores and submission data that cannot resolve

================================================================================
CONSISTENCY AND INTEGRITY RULES
================================================================================
1. Identical submission data and risk scores must produce the same risk tier and findings. Do not introduce randomness or variability.
2. If uncertain between two risk levels, ALWAYS choose the higher one.
3. Never downgrade a risk tier to avoid friction, reduce workload, or expedite approval. Your job is accuracy.
4. Never fabricate findings or cite intake fields that do not exist in the submission data.
5. Every finding must trace back to specific submission data. If you cannot point to the source, do not include the finding.
6. The number of findings should be proportional to the actual issues found — do not pad the assessment with low-value findings, and do not omit findings to keep the report short.
7. Count blocking and advisory recommendations accurately in the governanceDecision object.
8. The executiveSummary must be understandable by someone who has never seen the intake form.
`.trim();
}

// =============================================================================
// Types for the structured assessment response
// =============================================================================

export interface AssessmentMetadata {
  systemName: string;
  assessmentDate: string;
  promptVersion: string;
  overallRiskTier: "Critical" | "High" | "Moderate" | "Low";
  ruleBasedOverallLevel: string;
  tierAdjusted: boolean;
  tierAdjustmentReason: string;
}

export interface DomainScore {
  domain: string;
  ruleBasedScore: number | null;
  agentAssessedTier: "Critical" | "High" | "Moderate" | "Low";
  keyFinding: string;
  nistAiRmfFunction: string;
  assessmentRationale: string;
  scoreAdjustmentReason?: string;
}

export interface VendorRisk {
  ruleBasedScore: number;
  agentAssessedTier: "Critical" | "High" | "Moderate" | "Low";
  thirdPartyModelsIdentified: string;
  vendorDocumentationProvided: boolean;
  keyFinding: string;
  assessmentRationale: string;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  affectedDomain: string;
  severity: "Critical" | "High" | "Moderate" | "Low";
  nistAiRmfFunction: string;
  nistSp80053ControlFamily: string;
  sourceField: string;
  evidenceSummary: string;
}

export interface Recommendation {
  id: string;
  relatedFindings: string[];
  action: string;
  owner: string;
  type: "Blocking" | "Advisory";
  effort: "Low" | "Medium" | "High";
  effortDefinition: string;
  rationale: string;
}

export interface GovernanceDecision {
  recommendation: "Approve" | "Conditionally Approve" | "Reject" | "Escalate to Governance Board";
  rationale: string;
  blockingItemCount: number;
  advisoryItemCount: number;
  nextReviewDate: string;
  escalationTriggers: string;
}

export interface RiskFlags {
  carriedForward: string[];
  newlyIdentified: string[];
}

export interface FullAssessmentResult {
  assessmentMetadata: AssessmentMetadata;
  domainScores: DomainScore[];
  vendorRisk: VendorRisk;
  findings: Finding[];
  recommendations: Recommendation[];
  governanceDecision: GovernanceDecision;
  executiveSummary: string;
  riskFlags: RiskFlags;
}

// Legacy interface for backward compatibility
export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  explanation: string;
  fullAssessment?: FullAssessmentResult;
}

export async function generateRiskAnalysis(
  submissionData: Record<string, unknown>,
  riskScores: {
    dataPrivacyScore: number;
    oversightScore: number;
    complianceScore: number;
    vendorScore: number;
    overallLevel: string;
    riskFlags: string[];
  }
): Promise<AIAnalysisResult> {
  const prompt = buildRiskAssessmentPrompt(submissionData, riskScores);

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const fullAssessment = JSON.parse(jsonMatch[0]) as FullAssessmentResult;

    // Map the new structured format to the legacy format for backward compatibility
    const summary = fullAssessment.executiveSummary || "Risk assessment completed.";

    const recommendations = fullAssessment.recommendations.map(
      (rec) => `[${rec.type}] ${rec.action} (Owner: ${rec.owner}, Effort: ${rec.effort})`
    );

    // Build a detailed markdown explanation from the structured data
    const explanation = buildExplanationFromAssessment(fullAssessment);

    return {
      summary,
      recommendations,
      explanation,
      fullAssessment,
    };
  } catch (error) {
    console.error("AI analysis error:", error);

    // Fallback to rule-based summary if AI fails
    return generateFallbackAnalysis(riskScores);
  }
}

function buildExplanationFromAssessment(assessment: FullAssessmentResult): string {
  const { assessmentMetadata, domainScores, vendorRisk, findings, governanceDecision, riskFlags } = assessment;

  let explanation = `## Risk Assessment Summary (${assessmentMetadata.promptVersion})\n\n`;
  explanation += `### Overall Assessment: ${assessmentMetadata.overallRiskTier}\n\n`;

  if (assessmentMetadata.tierAdjusted) {
    explanation += `> **Tier Adjustment:** ${assessmentMetadata.tierAdjustmentReason}\n\n`;
  }

  explanation += `### Domain Analysis\n\n`;
  explanation += `| Domain | Tier | Key Finding |\n`;
  explanation += `|--------|------|-------------|\n`;
  for (const domain of domainScores) {
    explanation += `| ${domain.domain} | ${domain.agentAssessedTier} | ${domain.keyFinding} |\n`;
  }
  explanation += `| Vendor Risk | ${vendorRisk.agentAssessedTier} | ${vendorRisk.keyFinding} |\n`;
  explanation += `\n`;

  if (findings.length > 0) {
    explanation += `### Findings\n\n`;
    for (const finding of findings) {
      explanation += `#### ${finding.id}: ${finding.title}\n`;
      explanation += `- **Severity:** ${finding.severity}\n`;
      explanation += `- **Domain:** ${finding.affectedDomain}\n`;
      explanation += `- **NIST Control:** ${finding.nistSp80053ControlFamily}\n`;
      explanation += `- **Description:** ${finding.description}\n`;
      explanation += `- **Evidence:** ${finding.evidenceSummary}\n\n`;
    }
  }

  explanation += `### Governance Decision\n\n`;
  explanation += `**Recommendation:** ${governanceDecision.recommendation}\n\n`;
  explanation += `${governanceDecision.rationale}\n\n`;
  explanation += `- Blocking Items: ${governanceDecision.blockingItemCount}\n`;
  explanation += `- Advisory Items: ${governanceDecision.advisoryItemCount}\n`;
  explanation += `- Next Review: ${governanceDecision.nextReviewDate}\n\n`;

  if (riskFlags.newlyIdentified.length > 0) {
    explanation += `### Newly Identified Risk Flags\n\n`;
    for (const flag of riskFlags.newlyIdentified) {
      explanation += `- ${flag}\n`;
    }
  }

  return explanation;
}

function generateFallbackAnalysis(riskScores: {
  dataPrivacyScore: number;
  oversightScore: number;
  complianceScore: number;
  vendorScore: number;
  overallLevel: string;
  riskFlags: string[];
}): AIAnalysisResult {
  const level = riskScores.overallLevel;
  const flags = riskScores.riskFlags;

  let summary = "";
  if (level === "CRITICAL" || level === "HIGH") {
    summary = `This AI system has been assessed as ${level} risk. ${flags.length} risk factors were identified that require immediate attention. Review the recommendations below before proceeding.`;
  } else if (level === "MEDIUM") {
    summary = `This AI system has been assessed as MEDIUM risk. While not critical, ${flags.length} areas of concern were identified that should be addressed.`;
  } else {
    summary = `This AI system has been assessed as LOW risk. The system appears to have appropriate controls in place, though continuous monitoring is recommended.`;
  }

  const recommendations: string[] = [];

  if (riskScores.dataPrivacyScore > 50) {
    recommendations.push(
      "[Blocking] Conduct a data privacy impact assessment and ensure appropriate data handling controls (Owner: Privacy Office, Effort: Medium)"
    );
  }
  if (riskScores.oversightScore > 50) {
    recommendations.push(
      "[Blocking] Implement stronger human oversight controls before AI outputs are acted upon (Owner: System Owner, Effort: Medium)"
    );
  }
  if (riskScores.complianceScore > 50) {
    recommendations.push(
      "[Advisory] Review compliance requirements and ensure proper documentation and audit trails (Owner: Governance Board, Effort: High)"
    );
  }
  if (riskScores.vendorScore > 50) {
    recommendations.push(
      "[Blocking] Conduct vendor due diligence and establish clear data handling agreements (Owner: Security Team, Effort: Medium)"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("[Advisory] Continue monitoring system usage and update this assessment periodically (Owner: System Owner, Effort: Low)");
  }

  const explanation = `## Risk Assessment Summary (Fallback Analysis)

### Overall Assessment: ${level}

${flags.length > 0 ? `### Identified Risk Factors\n${flags.map((f) => `- ${f}`).join("\n")}` : "No significant risk factors identified."}

### Category Breakdown

| Category | Score | Level |
|----------|-------|-------|
| Data Privacy | ${riskScores.dataPrivacyScore}/100 | ${riskScores.dataPrivacyScore >= 50 ? "High" : riskScores.dataPrivacyScore >= 25 ? "Medium" : "Low"} |
| Human Oversight | ${riskScores.oversightScore}/100 | ${riskScores.oversightScore >= 50 ? "High" : riskScores.oversightScore >= 25 ? "Medium" : "Low"} |
| Compliance | ${riskScores.complianceScore}/100 | ${riskScores.complianceScore >= 50 ? "High" : riskScores.complianceScore >= 25 ? "Medium" : "Low"} |
| Vendor | ${riskScores.vendorScore}/100 | ${riskScores.vendorScore >= 50 ? "High" : riskScores.vendorScore >= 25 ? "Medium" : "Low"} |

### Next Steps

Review the recommendations provided and address any high-risk areas before expanding use of this AI system.

*Note: This is a fallback analysis generated from rule-based scoring. The AI-powered analysis was unavailable.*`;

  return { summary, recommendations, explanation };
}
