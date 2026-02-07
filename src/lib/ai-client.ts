import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  explanation: string;
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
  const prompt = `You are an AI Governance risk analyst. Analyze this AI system submission and provide insights.

SUBMISSION DATA:
${JSON.stringify(submissionData, null, 2)}

RULE-BASED RISK SCORES:
- Data Privacy Risk: ${riskScores.dataPrivacyScore}/100
- Human Oversight Risk: ${riskScores.oversightScore}/100
- Compliance Risk: ${riskScores.complianceScore}/100
- Vendor Risk: ${riskScores.vendorScore}/100
- Overall Risk Level: ${riskScores.overallLevel}

IDENTIFIED RISK FLAGS:
${riskScores.riskFlags.map((f) => `- ${f}`).join("\n")}

Provide your analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary of the key risks and overall assessment",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "explanation": "A detailed markdown explanation of your analysis, including why each risk was flagged and what the organization should consider. Use headers, bullet points, and clear structure."
}

Focus on actionable insights. Be specific about what could go wrong and how to prevent it. Tailor recommendations to this specific AI system and use case.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
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

    const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;

    return {
      summary: parsed.summary || "Risk assessment completed.",
      recommendations: parsed.recommendations || [],
      explanation: parsed.explanation || "Analysis completed.",
    };
  } catch (error) {
    console.error("AI analysis error:", error);

    // Fallback to rule-based summary if AI fails
    return generateFallbackAnalysis(riskScores);
  }
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
      "Conduct a data privacy impact assessment and ensure appropriate data handling controls"
    );
  }
  if (riskScores.oversightScore > 50) {
    recommendations.push(
      "Implement stronger human oversight controls before AI outputs are acted upon"
    );
  }
  if (riskScores.complianceScore > 50) {
    recommendations.push(
      "Review compliance requirements and ensure proper documentation and audit trails"
    );
  }
  if (riskScores.vendorScore > 50) {
    recommendations.push(
      "Conduct vendor due diligence and establish clear data handling agreements"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue monitoring system usage and update this assessment periodically");
  }

  const explanation = `## Risk Assessment Summary

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

Review the recommendations provided and address any high-risk areas before expanding use of this AI system.`;

  return { summary, recommendations, explanation };
}
