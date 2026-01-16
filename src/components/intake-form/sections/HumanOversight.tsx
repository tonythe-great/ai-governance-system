"use client";

import { FormSection } from "../FormSection";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface HumanOversightProps {
  form: any;
}

const outputUsageOptions = [
  { value: "direct_action", label: "Direct action (AI output used as-is)" },
  { value: "human_review_required", label: "Human review required before action" },
  { value: "advisory_only", label: "Advisory only (suggestions for humans)" },
  { value: "automated_with_oversight", label: "Automated with human oversight" },
];

const humanReviewOptions = [
  { value: "none", label: "No human review" },
  { value: "spot_check", label: "Spot check (random sampling)" },
  { value: "review_before_critical", label: "Review before critical decisions" },
  { value: "always", label: "Always reviewed by human" },
];

export function HumanOversight({ form }: HumanOversightProps) {
  const { setValue, watch, formState: { errors } } = form;

  return (
    <FormSection
      number={2}
      title="Human Oversight"
      subtitle="How will humans be involved in AI decisions?"
      color="purple"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="outputUsage">
            How will AI outputs be used? <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("outputUsage") || ""}
            onValueChange={(value) => setValue("outputUsage", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select how outputs will be used..." />
            </SelectTrigger>
            <SelectContent>
              {outputUsageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.outputUsage && (
            <p className="text-sm text-red-500">{errors.outputUsage.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="humanReviewLevel">
            Level of Human Review <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("humanReviewLevel") || ""}
            onValueChange={(value) => setValue("humanReviewLevel", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level of human review..." />
            </SelectTrigger>
            <SelectContent>
              {humanReviewOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.humanReviewLevel && (
            <p className="text-sm text-red-500">{errors.humanReviewLevel.message}</p>
          )}
        </div>
      </div>
    </FormSection>
  );
}
