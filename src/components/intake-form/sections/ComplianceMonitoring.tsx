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
interface ComplianceMonitoringProps {
  form: any;
}

const federalContractOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
];

export function ComplianceMonitoring({ form }: ComplianceMonitoringProps) {
  const { setValue, watch } = form;

  return (
    <FormSection
      number={5}
      title="Compliance & Monitoring"
      subtitle="How will usage be tracked and monitored?"
      color="gray"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="hasFederalContracts">
            Does your organization hold federal contracts?
          </Label>
          <Select
            value={watch("hasFederalContracts") || ""}
            onValueChange={(value) => setValue("hasFederalContracts", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {federalContractOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Monitoring & Logging</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <Checkbox
                id="usageLoggingEnabled"
                checked={watch("usageLoggingEnabled")}
                onCheckedChange={(checked) =>
                  setValue("usageLoggingEnabled", checked as boolean, { shouldDirty: true })
                }
              />
              <Label htmlFor="usageLoggingEnabled" className="cursor-pointer font-normal">
                Usage logging is enabled
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <Checkbox
                id="complianceAccess"
                checked={watch("complianceAccess")}
                onCheckedChange={(checked) =>
                  setValue("complianceAccess", checked as boolean, { shouldDirty: true })
                }
              />
              <Label htmlFor="complianceAccess" className="cursor-pointer font-normal">
                Compliance team has access to monitoring
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <Checkbox
                id="incidentResponseDoc"
                checked={watch("incidentResponseDoc")}
                onCheckedChange={(checked) =>
                  setValue("incidentResponseDoc", checked as boolean, { shouldDirty: true })
                }
              />
              <Label htmlFor="incidentResponseDoc" className="cursor-pointer font-normal">
                Incident response process is documented
              </Label>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
