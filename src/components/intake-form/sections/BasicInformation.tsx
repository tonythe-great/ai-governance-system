"use client";

import { FormSection } from "../FormSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface BasicInformationProps {
  form: any;
}

const useCaseOptions = [
  { value: "content_generation", label: "Content Generation" },
  { value: "data_analysis", label: "Data Analysis" },
  { value: "customer_service", label: "Customer Service" },
  { value: "code_assistance", label: "Code Assistance" },
  { value: "research", label: "Research & Summarization" },
  { value: "automation", label: "Process Automation" },
  { value: "other", label: "Other" },
];

const vendorOptions = [
  { value: "openai", label: "OpenAI (ChatGPT, GPT-4)" },
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "microsoft", label: "Microsoft (Copilot, Azure AI)" },
  { value: "google", label: "Google (Gemini, Vertex AI)" },
  { value: "meta", label: "Meta (Llama)" },
  { value: "amazon", label: "Amazon (Bedrock)" },
  { value: "other", label: "Other" },
];

const stageOptions = [
  { value: "evaluation", label: "Evaluation / Pilot" },
  { value: "development", label: "Development" },
  { value: "testing", label: "Testing / QA" },
  { value: "production", label: "Production" },
  { value: "deprecated", label: "Deprecated / Retiring" },
];

const userCountOptions = [
  { value: "1-10", label: "1-10 users" },
  { value: "11-50", label: "11-50 users" },
  { value: "51-200", label: "51-200 users" },
  { value: "201-1000", label: "201-1000 users" },
  { value: "1000+", label: "1000+ users" },
];

export function BasicInformation({ form }: BasicInformationProps) {
  const { register, setValue, watch, formState: { errors } } = form;

  return (
    <FormSection
      number={1}
      title="Basic Information"
      subtitle="Tell us about the AI system you're assessing"
      color="blue"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="aiSystemName">
            AI System Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="aiSystemName"
            {...register("aiSystemName")}
            placeholder="e.g., ChatGPT Enterprise, Microsoft Copilot"
          />
          {errors.aiSystemName && (
            <p className="text-sm text-red-500">{errors.aiSystemName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="useCase">
            What will this AI be used for? <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("useCase") || ""}
            onValueChange={(value) => setValue("useCase", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a common use case..." />
            </SelectTrigger>
            <SelectContent>
              {useCaseOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.useCase && (
            <p className="text-sm text-red-500">{errors.useCase.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            {...register("businessPurpose")}
            placeholder="Describe the specific business purpose..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">
            AI Provider / Vendor <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("vendor") || ""}
            onValueChange={(value) => setValue("vendor", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vendor..." />
            </SelectTrigger>
            <SelectContent>
              {vendorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vendor && (
            <p className="text-sm text-red-500">{errors.vendor.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentStage">
            Current Stage <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("currentStage") || ""}
            onValueChange={(value) => setValue("currentStage", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select current stage..." />
            </SelectTrigger>
            <SelectContent>
              {stageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currentStage && (
            <p className="text-sm text-red-500">{errors.currentStage.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfUsers">Number of Users</Label>
          <Select
            value={watch("numberOfUsers") || ""}
            onValueChange={(value) => setValue("numberOfUsers", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user count range..." />
            </SelectTrigger>
            <SelectContent>
              {userCountOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormSection>
  );
}
