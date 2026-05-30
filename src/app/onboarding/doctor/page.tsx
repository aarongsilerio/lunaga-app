"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Stethoscope, Loader2, CheckSquare } from "lucide-react";
import { createDoctorProfile } from "./actions";
import { LegalFooter } from "@/components/legal/LegalFooter";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorOnboarding() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createDoctorProfile(formData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success("Profile created successfully!");
      router.push("/doctor/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4 py-12">
      <Card className="max-w-2xl w-full p-8 rounded-3xl shadow-xl border border-[#6FAEE7]/20 bg-white">
        
        <div className="flex items-center gap-4 mb-8 border-b border-[#6FAEE7]/10 pb-6">
          <div className="p-3 bg-[#1E3A5F] rounded-2xl text-white shadow-md">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Doctor Registration</h1>
            <p className="text-sm text-[#1E3A5F]/60">Complete your professional profile to join Lunága.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Full Name, Title</label>
              <Input name="name" placeholder="e.g., Jane Doe, MD" required className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Primary Specialization</label>
              <Input name="specialization" placeholder="e.g., Cardiology" required className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Contact Number</label>
              <Input name="phoneNumber" placeholder="+63 912 345 6789" className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Clinic Room No.</label>
              <Input name="roomNumber" placeholder="e.g., Room 402, St. Luke's" className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Professional Biography</label>
            <Textarea name="bio" placeholder="Briefly describe your experience and medical philosophy..." className="min-h-[120px] rounded-xl bg-[#F7FAFC]" />
          </div>

          {/* Custom Checkbox Group for Clinic Days */}
          <div className="space-y-3 pt-4 border-t border-[#6FAEE7]/10">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Available Clinic Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <label key={day} className="flex items-center gap-2 p-3 rounded-xl border border-[#6FAEE7]/20 bg-white hover:bg-[#F7FAFC] cursor-pointer transition-colors has-[:checked]:bg-[#1E3A5F] has-[:checked]:text-white has-[:checked]:border-[#1E3A5F]">
                  <input type="checkbox" name="clinicDays" value={day} className="hidden" />
                  <CheckSquare className="w-4 h-4 opacity-70" />
                  <span className="text-sm font-semibold">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-bold text-lg mt-8 shadow-md">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit Application"}
          </Button>
          <p className="text-xs text-center text-[#1E3A5F]/50">
            By submitting, your profile will be sent to the platform administrators for verification.
          </p>
        </form>

      </Card>

      <div className="absolute bottom-0 w-full pb-4">
        <LegalFooter />
      </div>
    </div>
  );
}