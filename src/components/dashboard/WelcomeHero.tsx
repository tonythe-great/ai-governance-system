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
      className={`relative overflow-hidden rounded-2xl p-8 text-white ${className}`}
      style={{ background: "linear-gradient(to right, #000070, #000050)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: "rgba(200, 155, 0, 0.2)" }} />

      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {displayName}!
        </h1>
        <p className="text-white/80 mb-6 max-w-xl">
          Manage your AI system assessments and track their review status. Start a
          new assessment or check the progress of existing submissions.
        </p>
        <Link href="/intake/new">
          <Button
            size="lg"
            className="font-semibold"
            style={{ backgroundColor: "#C89B00", color: "#000070" }}
          >
            <Plus className="mr-2 h-5 w-5" />
            New AI Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}
