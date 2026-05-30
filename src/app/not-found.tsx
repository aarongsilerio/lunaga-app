import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full bg-[#F7FAFC] px-4 text-center">
      <div className="p-6 bg-white rounded-full shadow-lg border border-[#6FAEE7]/20 mb-6">
        <SearchX className="w-16 h-16 text-[#6FAEE7]" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#1E3A5F] mb-4">404 - Page Not Found</h1>
      <p className="text-[#1E3A5F]/70 max-w-md mx-auto mb-8 leading-relaxed">
        We couldn't find the medical record, doctor, or page you were looking for. It might have been moved or deleted.
      </p>
      <Link href="/">
        <Button className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl h-12 px-6 font-semibold flex items-center gap-2 shadow-md">
          <Home className="w-5 h-5" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}