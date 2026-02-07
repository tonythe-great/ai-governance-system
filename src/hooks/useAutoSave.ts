"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { FormValues } from "@/lib/validations/submission";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  submissionId: string;
  enabled?: boolean;
  delay?: number;
}

export function useAutoSave({ submissionId, enabled = true, delay = 2000 }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const savePromiseRef = useRef<Promise<void> | null>(null);

  const saveData = useCallback(
    async (data: Partial<FormValues>) => {
      if (!enabled || !submissionId) return;

      setStatus("saving");
      const savePromise = (async () => {
        try {
          const response = await fetch(`/api/submissions/${submissionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error("Failed to save");
          }

          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        } catch (error) {
          console.error("Auto-save error:", error);
          setStatus("error");
          setTimeout(() => setStatus("idle"), 3000);
        } finally {
          savePromiseRef.current = null;
        }
      })();

      savePromiseRef.current = savePromise;
      await savePromise;
    },
    [enabled, submissionId]
  );

  const debouncedSave = useDebouncedCallback(saveData, delay);

  const trigger = useCallback(
    (data: Partial<FormValues>) => {
      if (enabled) {
        debouncedSave(data);
      }
    },
    [debouncedSave, enabled]
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Flush any pending debounced saves and wait for completion
  const flush = useCallback(async () => {
    if (debouncedSave.isPending()) {
      debouncedSave.flush();
    }
    // Wait for any in-flight save to complete
    if (savePromiseRef.current) {
      await savePromiseRef.current;
    }
  }, [debouncedSave]);

  return { status, trigger, saveNow: saveData, flush };
}
