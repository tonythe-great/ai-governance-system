"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { BasicInformation } from "./sections/BasicInformation";
import { HumanOversight } from "./sections/HumanOversight";
import { DataPrivacy } from "./sections/DataPrivacy";
import { OwnershipAccountability } from "./sections/OwnershipAccountability";
import { ComplianceMonitoring } from "./sections/ComplianceMonitoring";
import {
  FormValues,
  draftSubmissionSchema,
  submissionSchema,
} from "@/lib/validations/submission";
import { useAutoSave } from "@/hooks/useAutoSave";

interface IntakeFormProps {
  submissionId: string;
  initialData?: Partial<FormValues>;
  status: string;
}

export function IntakeForm({ submissionId, initialData, status }: IntakeFormProps) {
  const router = useRouter();
  const isDraft = status === "DRAFT";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(draftSubmissionSchema) as any,
    defaultValues: {
      aiSystemName: initialData?.aiSystemName || "",
      useCase: initialData?.useCase || "",
      businessPurpose: initialData?.businessPurpose || "",
      vendor: initialData?.vendor || "",
      currentStage: initialData?.currentStage || "",
      numberOfUsers: initialData?.numberOfUsers || "",
      outputUsage: initialData?.outputUsage || "",
      humanReviewLevel: initialData?.humanReviewLevel || "",
      dataTypes: initialData?.dataTypes || [],
      vendorDataStorage: initialData?.vendorDataStorage || "",
      userTrainingRequired: initialData?.userTrainingRequired || false,
      acceptableUseRequired: initialData?.acceptableUseRequired || false,
      executiveSponsorName: initialData?.executiveSponsorName || "",
      executiveSponsorTitle: initialData?.executiveSponsorTitle || "",
      businessOwnerName: initialData?.businessOwnerName || "",
      businessOwnerEmail: initialData?.businessOwnerEmail || "",
      technicalOwnerName: initialData?.technicalOwnerName || "",
      technicalOwnerEmail: initialData?.technicalOwnerEmail || "",
      hasFederalContracts: initialData?.hasFederalContracts || "",
      usageLoggingEnabled: initialData?.usageLoggingEnabled || false,
      complianceAccess: initialData?.complianceAccess || false,
      incidentResponseDoc: initialData?.incidentResponseDoc || false,
    },
  });

  const { status: saveStatus, trigger, flush } = useAutoSave({
    submissionId,
    enabled: isDraft,
  });

  // Watch all form values for auto-save
  const watchedValues = form.watch();

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (form.formState.isDirty && isDraft) {
        trigger(data as Partial<FormValues>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, trigger, isDraft]);

  const handleSaveDraft = async () => {
    const data = form.getValues();
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Save draft error:", error);
    }
  };

  const handleSubmitForReview = async () => {
    // Flush any pending auto-saves first
    await flush();

    const data = form.getValues();

    // Validate with full schema for submission
    const result = submissionSchema.safeParse(data);
    if (!result.success) {
      // Set errors on the form
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof FormValues;
        form.setError(path, { message: issue.message });
      });
      return;
    }

    try {
      // First save the current data
      const saveResponse = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save form data");
      }

      // Then submit for review
      const response = await fetch(`/api/submissions/${submissionId}/submit`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to submit for review");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">Complete all required fields</p>
          {isDraft && <AutoSaveIndicator status={saveStatus} />}
        </div>

        <div className="space-y-6">
          <BasicInformation form={form} />
          <HumanOversight form={form} />
          <DataPrivacy form={form} />
          <OwnershipAccountability form={form} />
          <ComplianceMonitoring form={form} />
        </div>

        {isDraft && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Ready to submit?</h3>
                <p className="text-sm text-gray-500">
                  Your assessment will be reviewed by the governance team
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button onClick={handleSubmitForReview}>Submit for Review</Button>
              </div>
            </div>
          </div>
        )}

        {!isDraft && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              This submission has been submitted and cannot be edited. Status: {status}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
