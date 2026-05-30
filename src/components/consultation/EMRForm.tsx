"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, FileText, Pill, Activity, CheckCircle } from "lucide-react";
import { saveEMRNotes } from "@/app/doctor/consultation/actions";

interface EMRFormProps {
  appointment: any;
  medicalRecord: any;
}

export function EMRForm({ appointment, medicalRecord }: EMRFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await saveEMRNotes(appointment.id, appointment.patientId, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Clinical notes saved successfully!");
      if (result.completed) {
        toast.success("Session marked as completed. Redirecting...");
        setTimeout(() => router.push("/doctor/dashboard"), 1500);
      }
    }
    setIsLoading(false);
  }

  const isCompleted = appointment.status === "COMPLETED";

  return (
    <Card className="h-full flex flex-col bg-white border-[#6FAEE7]/20 shadow-lg rounded-3xl overflow-hidden">
      <div className="p-5 bg-[#1E3A5F] text-white shrink-0">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#6FAEE7]" /> Clinical Workspace
        </h2>
        <p className="text-white/70 text-xs mt-1">Real-time EMR synchronization</p>
      </div>

      <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        
        {/* Session Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#6FAEE7]" /> Findings & Diagnosis
          </label>
          <Textarea 
            name="clinicalNotes" 
            defaultValue={appointment.clinicalNotes || ""} 
            placeholder="Document subjective/objective findings..." 
            className="min-h-30 rounded-xl text-sm" 
            disabled={isCompleted}
          />
        </div>

        {/* Prescription */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-green-500" /> E-Prescription
          </label>
          <Textarea 
            name="prescription" 
            defaultValue={appointment.prescription || ""} 
            placeholder="Rx: Medication name, dosage, frequency..." 
            className="min-h-25 rounded-xl text-sm" 
            disabled={isCompleted}
          />
        </div>

        {/* Global Ongoing Concerns */}
        <div className="space-y-2 pt-4 border-t border-[#6FAEE7]/10">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-red-400" /> Patient Ongoing Concerns
          </label>
          <p className="text-[10px] text-[#1E3A5F]/50 leading-tight mb-2">Updates to this field overwrite the patient's global EMR header.</p>
          <Textarea 
            name="ongoingConcerns" 
            defaultValue={medicalRecord?.ongoingConcerns || ""} 
            placeholder="Chronic conditions, active monitoring..." 
            className="min-h-20 rounded-xl text-sm border-amber-200 focus-visible:ring-amber-200" 
          />
        </div>

        {!isCompleted && (
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
            <input type="checkbox" name="markCompleted" className="w-4 h-4 rounded text-[#1E3A5F]" />
            <span className="text-sm font-semibold text-[#1E3A5F]">End session & mark as Completed</span>
          </label>
        )}

        <div className="pt-2 sticky bottom-0 bg-white">
          <Button type="submit" disabled={isLoading || isCompleted} className="w-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl h-12 font-bold shadow-md">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isCompleted ? "Session Finalized" : <><Save className="w-4 h-4 mr-2"/> Save Clinical Notes</>}
          </Button>
        </div>
      </form>
    </Card>
  );
}