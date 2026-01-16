import { z } from "zod";

export const submissionSchema = z.object({
  // Section 1 - Basic Information
  aiSystemName: z.string().min(1, "AI System Name is required"),
  useCase: z.string().min(1, "Use case is required"),
  businessPurpose: z.string().optional(),
  vendor: z.string().min(1, "Vendor is required"),
  currentStage: z.string().min(1, "Current stage is required"),
  numberOfUsers: z.string().optional(),

  // Section 2 - Human Oversight
  outputUsage: z.string().min(1, "Output usage is required"),
  humanReviewLevel: z.string().min(1, "Human review level is required"),

  // Section 3 - Data & Privacy
  dataTypes: z.array(z.string()).min(1, "Select at least one data type"),
  vendorDataStorage: z.string().optional(),
  userTrainingRequired: z.boolean().default(false),
  acceptableUseRequired: z.boolean().default(false),

  // Section 4 - Ownership & Accountability
  executiveSponsorName: z.string().min(1, "Executive sponsor name is required"),
  executiveSponsorTitle: z.string().optional(),
  businessOwnerName: z.string().optional(),
  businessOwnerEmail: z.string().email().optional().or(z.literal("")),
  technicalOwnerName: z.string().optional(),
  technicalOwnerEmail: z.string().email().optional().or(z.literal("")),

  // Section 5 - Compliance & Monitoring
  hasFederalContracts: z.string().optional(),
  usageLoggingEnabled: z.boolean().default(false),
  complianceAccess: z.boolean().default(false),
  incidentResponseDoc: z.boolean().default(false),
});

export const draftSubmissionSchema = z.object({
  // All fields optional for drafts
  aiSystemName: z.string().optional(),
  useCase: z.string().optional(),
  businessPurpose: z.string().optional(),
  vendor: z.string().optional(),
  currentStage: z.string().optional(),
  numberOfUsers: z.string().optional(),
  outputUsage: z.string().optional(),
  humanReviewLevel: z.string().optional(),
  dataTypes: z.array(z.string()).default([]),
  vendorDataStorage: z.string().optional(),
  userTrainingRequired: z.boolean().default(false),
  acceptableUseRequired: z.boolean().default(false),
  executiveSponsorName: z.string().optional(),
  executiveSponsorTitle: z.string().optional(),
  businessOwnerName: z.string().optional(),
  businessOwnerEmail: z.string().optional(),
  technicalOwnerName: z.string().optional(),
  technicalOwnerEmail: z.string().optional(),
  hasFederalContracts: z.string().optional(),
  usageLoggingEnabled: z.boolean().default(false),
  complianceAccess: z.boolean().default(false),
  incidentResponseDoc: z.boolean().default(false),
});

export type FormValues = z.infer<typeof draftSubmissionSchema>;
export type SubmitFormValues = z.infer<typeof submissionSchema>;
