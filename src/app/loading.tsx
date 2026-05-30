import { Moon } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full bg-[#F7FAFC]">
      <div className="relative flex items-center justify-center animate-pulse">
        {/* Pulsing aura */}
        <div className="absolute inset-0 bg-[#6FAEE7]/20 blur-xl rounded-full w-24 h-24" />
        <Moon className="w-12 h-12 text-[#1E3A5F] relative z-10 animate-bounce" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-[#1E3A5F] animate-pulse">Loading Lunága...</h2>
      <p className="text-[#1E3A5F]/60 text-sm mt-2">Preparing your healthcare portal</p>
    </div>
  );
}