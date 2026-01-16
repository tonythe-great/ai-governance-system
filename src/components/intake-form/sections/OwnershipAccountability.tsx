"use client";

import { FormSection } from "../FormSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OwnershipAccountabilityProps {
  form: any;
}

export function OwnershipAccountability({ form }: OwnershipAccountabilityProps) {
  const { register, formState: { errors } } = form;

  return (
    <FormSection
      number={4}
      title="Ownership & Accountability"
      subtitle="Who is responsible for this AI system?"
      color="orange"
    >
      <div className="space-y-6">
        {/* Executive Sponsor Section */}
        <div className="bg-orange-50 rounded-lg p-4 space-y-4">
          <Label className="text-orange-700">
            Executive Sponsor / Approving Authority <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                {...register("executiveSponsorName")}
                placeholder="Full Name"
              />
              {errors.executiveSponsorName && (
                <p className="text-sm text-red-500">{errors.executiveSponsorName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                {...register("executiveSponsorTitle")}
                placeholder="Title (e.g., CTO, VP Engineering)"
              />
            </div>
          </div>
        </div>

        {/* Business Owner Section */}
        <div className="space-y-4">
          <div>
            <Label>Business Owner</Label>
            <p className="text-sm text-gray-500">Person responsible for business outcomes</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register("businessOwnerName")}
              placeholder="Full Name"
            />
            <Input
              {...register("businessOwnerEmail")}
              type="email"
              placeholder="Email"
            />
          </div>
        </div>

        {/* Technical Owner Section */}
        <div className="space-y-4">
          <div>
            <Label>Technical Owner</Label>
            <p className="text-sm text-gray-500">Person responsible for technical implementation</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register("technicalOwnerName")}
              placeholder="Full Name"
            />
            <Input
              {...register("technicalOwnerEmail")}
              type="email"
              placeholder="Email"
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}
