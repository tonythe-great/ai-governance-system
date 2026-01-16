"use client";

import { FormSection } from "../FormSection";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataPrivacyProps {
  form: any;
}

const dataTypeOptions = [
  { value: "public_information", label: "Public Information" },
  { value: "internal_documents", label: "Internal Documents" },
  { value: "business_strategy", label: "Business Strategy" },
  { value: "employee_data", label: "Employee Data" },
  { value: "customer_data", label: "Customer Data" },
  { value: "financial_data", label: "Financial Data" },
  { value: "pii", label: "Personal Information (PII)" },
  { value: "health_data", label: "Health Data" },
];

const vendorStorageOptions = [
  { value: "no_storage", label: "No - Data is not stored by vendor" },
  { value: "temporary", label: "Temporary - Deleted after processing" },
  { value: "persistent", label: "Yes - Data is stored persistently" },
  { value: "unknown", label: "Unknown / Not sure" },
];

export function DataPrivacy({ form }: DataPrivacyProps) {
  const { setValue, watch, formState: { errors } } = form;
  const dataTypes = watch("dataTypes") || [];

  const handleDataTypeChange = (value: string, checked: boolean) => {
    const currentTypes = dataTypes || [];
    if (checked) {
      setValue("dataTypes", [...currentTypes, value], { shouldDirty: true });
    } else {
      setValue(
        "dataTypes",
        currentTypes.filter((t: string) => t !== value),
        { shouldDirty: true }
      );
    }
  };

  return (
    <FormSection
      number={3}
      title="Data & Privacy"
      subtitle="What data will be used with this AI?"
      color="green"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>
            What types of data will be used? <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500">Select all that apply</p>
          <div className="grid grid-cols-2 gap-3">
            {dataTypeOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 rounded-md border p-3"
              >
                <Checkbox
                  id={option.value}
                  checked={dataTypes.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleDataTypeChange(option.value, checked as boolean)
                  }
                />
                <Label htmlFor={option.value} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.dataTypes && (
            <p className="text-sm text-red-500">{errors.dataTypes.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorDataStorage">Does the vendor store your data?</Label>
          <Select
            value={watch("vendorDataStorage") || ""}
            onValueChange={(value) => setValue("vendorDataStorage", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select data retention policy..." />
            </SelectTrigger>
            <SelectContent>
              {vendorStorageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>User Training & Awareness</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <Checkbox
                id="userTrainingRequired"
                checked={watch("userTrainingRequired")}
                onCheckedChange={(checked) =>
                  setValue("userTrainingRequired", checked as boolean, { shouldDirty: true })
                }
              />
              <Label htmlFor="userTrainingRequired" className="cursor-pointer font-normal">
                Users will receive training on proper use
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <Checkbox
                id="acceptableUseRequired"
                checked={watch("acceptableUseRequired")}
                onCheckedChange={(checked) =>
                  setValue("acceptableUseRequired", checked as boolean, { shouldDirty: true })
                }
              />
              <Label htmlFor="acceptableUseRequired" className="cursor-pointer font-normal">
                Users must sign an acceptable use agreement
              </Label>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
