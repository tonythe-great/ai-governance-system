import { Resend } from "resend";

// Lazy initialization to avoid errors when API key is not set
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || "AI Governance <noreply@resend.dev>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const client = getResendClient();
  if (!client) {
    console.log("RESEND_API_KEY not configured, skipping email:", { to, subject });
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Email Templates

export function submissionReceivedEmail(params: {
  userName: string;
  systemName: string;
  submissionId: string;
}) {
  return {
    subject: `Submission Received: ${params.systemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Submission Received</h2>
        <p>Hello ${params.userName || "there"},</p>
        <p>Your AI governance submission for <strong>${params.systemName}</strong> has been received and is now pending review.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>System:</strong> ${params.systemName}</p>
          <p style="margin: 8px 0 0;"><strong>Status:</strong> Submitted - Pending Review</p>
        </div>
        <p>Our governance team will review your submission and update you on its status.</p>
        <p style="color: #6b7280; font-size: 14px;">— AI Governance Team</p>
      </div>
    `,
  };
}

export function statusChangeEmail(params: {
  userName: string;
  systemName: string;
  submissionId: string;
  oldStatus: string;
  newStatus: string;
  comments?: string;
}) {
  const statusColors: Record<string, string> = {
    UNDER_REVIEW: "#f59e0b",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
    CHANGES_REQUESTED: "#8b5cf6",
  };

  const statusLabels: Record<string, string> = {
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CHANGES_REQUESTED: "Changes Requested",
  };

  const statusColor = statusColors[params.newStatus] || "#6b7280";
  const statusLabel = statusLabels[params.newStatus] || params.newStatus;

  return {
    subject: `Status Update: ${params.systemName} - ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Status Update</h2>
        <p>Hello ${params.userName || "there"},</p>
        <p>The status of your AI governance submission has been updated.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>System:</strong> ${params.systemName}</p>
          <p style="margin: 8px 0;">
            <strong>New Status:</strong>
            <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
              ${statusLabel}
            </span>
          </p>
          ${params.comments ? `<p style="margin: 8px 0 0;"><strong>Comments:</strong> ${params.comments}</p>` : ""}
        </div>
        ${params.newStatus === "APPROVED" ? `
          <p style="color: #10b981;">Your submission has been approved. You may proceed with the AI system deployment following your organization's guidelines.</p>
        ` : ""}
        ${params.newStatus === "REJECTED" ? `
          <p style="color: #ef4444;">Your submission requires modifications. Please review the comments above and resubmit when ready.</p>
        ` : ""}
        ${params.newStatus === "UNDER_REVIEW" ? `
          <p>A reviewer has begun evaluating your submission. You will be notified when a decision is made.</p>
        ` : ""}
        ${params.newStatus === "CHANGES_REQUESTED" ? `
          <p style="color: #8b5cf6;">The reviewer has requested modifications to your submission. Please review the comments above and make the necessary changes before resubmitting.</p>
        ` : ""}
        <p style="color: #6b7280; font-size: 14px;">— AI Governance Team</p>
      </div>
    `,
  };
}

export function reviewerAssignedEmail(params: {
  reviewerName: string;
  systemName: string;
  submissionId: string;
  submitterName: string;
  riskLevel?: string;
}) {
  const riskColors: Record<string, string> = {
    LOW: "#10b981",
    MEDIUM: "#f59e0b",
    HIGH: "#f97316",
    CRITICAL: "#ef4444",
  };

  return {
    subject: `New Review Assignment: ${params.systemName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Review Assignment</h2>
        <p>Hello ${params.reviewerName || "Reviewer"},</p>
        <p>You have been assigned to review a new AI governance submission.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>System:</strong> ${params.systemName}</p>
          <p style="margin: 8px 0;"><strong>Submitted by:</strong> ${params.submitterName}</p>
          ${params.riskLevel ? `
            <p style="margin: 8px 0;">
              <strong>Risk Level:</strong>
              <span style="background: ${riskColors[params.riskLevel] || "#6b7280"}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
                ${params.riskLevel}
              </span>
            </p>
          ` : ""}
        </div>
        <p>Please log in to the admin dashboard to review this submission.</p>
        <p style="color: #6b7280; font-size: 14px;">— AI Governance System</p>
      </div>
    `,
  };
}
