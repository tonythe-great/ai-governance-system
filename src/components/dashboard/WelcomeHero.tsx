"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WelcomeHeroProps {
  userName?: string | null;
  className?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeHero({ userName, className }: WelcomeHeroProps) {
  const greeting = getGreeting();
  const displayName = userName?.split(" ")[0] || "there";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {displayName}!
        </h1>
        <p className="text-blue-100 mb-6 max-w-xl">
          Manage your AI system assessments and track their review status. Start a
          new assessment or check the progress of existing submissions.
        </p>
        <Link href="/intake/new">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <Plus className="mr-2 h-5 w-5" />
            New AI Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}
