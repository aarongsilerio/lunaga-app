"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your observability platform (e.g., Sentry) in production
    console.error("[Global Error Boundary caught error]:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full bg-[#F7FAFC] px-4 text-center">
      <div className="p-6 bg-red-50 rounded-full border border-red-100 mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#1E3A5F] mb-4">Something went wrong!</h1>
      <p className="text-[#1E3A5F]/70 max-w-md mx-auto mb-8 leading-relaxed">
        We experienced an unexpected systemic error. Our engineering team has been notified.
      </p>
      <Button 
        onClick={() => reset()} // Attempts to recover by re-rendering the segment
        className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl h-12 px-6 font-semibold flex items-center gap-2 shadow-md"
      >
        <RefreshCcw className="w-5 h-5" /> Try Again
      </Button>
    </div>
  );
}