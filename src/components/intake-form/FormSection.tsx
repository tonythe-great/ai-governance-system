import { ReactNode } from "react";

interface FormSectionProps {
  number: number;
  title: string;
  subtitle: string;
  color: "blue" | "purple" | "green" | "orange" | "gray";
  children: ReactNode;
}

const colorClasses = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-emerald-500",
  orange: "bg-orange-500",
  gray: "bg-gray-600",
};

export function FormSection({
  number,
  title,
  subtitle,
  color,
  children,
}: FormSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className={`${colorClasses[color]} px-6 py-4`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold">
            {number}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-white/80">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
