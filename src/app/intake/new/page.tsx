"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewIntakePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    const createSubmission = async () => {
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to create submission");
        }

        const data = await response.json();
        router.replace(`/intake/${data.id}`);
      } catch (error) {
        console.error("Create submission error:", error);
        router.push("/dashboard");
      }
    };

    createSubmission();
  }, [router, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Creating new assessment...</p>
      </div>
    </div>
  );
}
