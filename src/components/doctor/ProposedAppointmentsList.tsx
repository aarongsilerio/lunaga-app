"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarClock, Check, X, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reviewProposedAppointment } from "@/app/doctor/dashboard/actions";

interface ProposedAppointment {
  id: string;
  datetime: Date;
  reason: string | null;
  patient: {
    user: { firstName: string | null; lastName: string | null };
  };
}

export function ProposedAppointmentsList({ proposals }: { proposals: ProposedAppointment[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDatetime, setNewDatetime] = useState<string>("");

  if (!proposals || proposals.length === 0) return null;

  async function handleAction(id: string, action: "ACCEPT" | "REJECT" | "RESCHEDULE") {
    setProcessingId(id);

    const result = await reviewProposedAppointment(
      id, 
      action, 
      action === "RESCHEDULE" ? newDatetime : undefined
    );

    if (result.success) {
      toast.success(result.message);
      setRescheduleId(null);
      setNewDatetime("");
    } else {
      toast.error(result.message);
    }
    
    setProcessingId(null);
  }

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-lg font-bold text-[#1E3A5F] flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-amber-500" />
        Patient Time Proposals ({proposals.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proposals.map((apt) => (
          <Card key={apt.id} className="p-5 border-amber-200 bg-amber-50/30 shadow-sm rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[#1E3A5F]">
                  {apt.patient.user.firstName} {apt.patient.user.lastName}
                </h3>
                <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                  PROPOSED
                </span>
              </div>
              
              <div className="text-sm text-[#1E3A5F]/80 space-y-1 mb-4">
                <p><strong>Date:</strong> {new Date(apt.datetime).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(apt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                {apt.reason && <p className="mt-2 text-xs italic opacity-80">"{apt.reason}"</p>}
              </div>
            </div>

            {/* Reschedule Form (Hidden by default) */}
            {rescheduleId === apt.id ? (
              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-3 animate-in fade-in">
                <label className="text-xs font-bold text-[#1E3A5F]">Propose a Different Time</label>
                <Input 
                  type="datetime-local" 
                  value={newDatetime}
                  onChange={(e) => setNewDatetime(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAction(apt.id, "RESCHEDULE")}
                    disabled={processingId === apt.id || !newDatetime}
                    className="flex-1 bg-[#1E3A5F] text-white"
                  >
                    {processingId === apt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRescheduleId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-auto">
                <Button 
                  size="sm" 
                  onClick={() => handleAction(apt.id, "ACCEPT")}
                  disabled={processingId === apt.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                >
                  <Check className="w-4 h-4 mr-1" /> Accept
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setRescheduleId(apt.id)}
                  disabled={processingId === apt.id}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  <Clock className="w-4 h-4 mr-1" /> Reschedule
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleAction(apt.id, "REJECT")}
                  disabled={processingId === apt.id}
                  variant="destructive"
                  className="px-3"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}