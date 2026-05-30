"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, CheckCircle2, X, Send } from "lucide-react";
import { toast } from "sonner";

export function ProviderSupportCard({ doctorName }: { doctorName: string }) {
  const [step, setStep] = useState<"idle" | "form" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    if (!message || message.trim() === "") {
      toast.error("Please describe your issue before submitting.");
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Replace this simulated delay with your actual API endpoint or server action 
      // e.g., await sendSupportTicket(doctorName, message);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setStep("success");
      toast.success("Ticket submitted successfully.");

      // Auto-reset the card after 5 seconds
      setTimeout(() => setStep("idle"), 5000);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6 bg-[#1E3A5F] text-white rounded-3xl shadow-lg relative overflow-hidden mt-8 transition-all duration-300 ease-in-out">
      {/* Decorative background circle */}
      <div className="absolute top-5 right-5 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {step === "idle" && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#6FAEE7]" /> Provider Support
          </h3>
          <p className="text-sm text-white/80 mb-4 leading-relaxed relative z-10">
            Need assistance with LunaRooms or managing records? Our IT desk is available.
          </p>
          <Button 
            onClick={() => setStep("form")}
            variant="secondary" 
            className="w-full bg-white text-[#1E3A5F] hover:bg-white/90 font-bold rounded-xl relative z-10 transition-transform active:scale-95"
          >
            Contact Support
          </Button>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={handleSubmit} className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#6FAEE7]" /> How can we help?
            </h3>
            <button 
              type="button" 
              onClick={() => setStep("idle")}
              className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <Textarea 
            name="message"
            autoFocus
            placeholder="Describe the issue you are facing..." 
            className="min-h-25 mb-3 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl text-sm focus-visible:ring-[#6FAEE7]/50 custom-scrollbar"
          />
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#6FAEE7] hover:bg-[#6FAEE7]/90 text-[#1E3A5F] font-bold rounded-xl shadow-md transition-transform active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Ticket</span>
            )}
          </Button>
        </form>
      )}

      {step === "success" && (
        <div className="text-center py-4 relative z-10 animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="font-bold text-base mb-1">Ticket Sent!</h3>
          <p className="text-xs text-white/70">
            Our IT desk will contact you shortly via email.
          </p>
        </div>
      )}
    </Card>
  );
}