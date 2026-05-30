"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Clock, Video, Settings, X, CheckSquare, Loader2, RefreshCw, Edit, Check } from "lucide-react";
import Link from "next/link";
import { updateAvailability, manageAppointment } from "@/app/doctor/schedule/actions";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_TIME_SLOTS = Array.from({ length: 19 }, (_, i) => 8 + i * 0.5); 

const formatTime = (timeFloat: number) => {
  const hours = Math.floor(timeFloat);
  const minutes = Math.round((timeFloat - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export function ScheduleClient({ userId, appointments, profile }: any) {
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDatetime, setNewDatetime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!pusherClient || !userId) return;
    const channelName = `user-${userId}`;
    const channel = pusherClient.subscribe(channelName);
    channel.bind("new-notification", () => router.refresh());
    return () => { pusherClient?.unsubscribe(channelName); };
  }, [userId, router]);

  async function handleAvailabilitySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdatingAvailability(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateAvailability(formData);
    
    if (result.error) toast.error(result.error);
    else { toast.success("Availability updated!"); setIsModalOpen(false); }
    setIsUpdatingAvailability(false);
  }

  async function handleManageAction(action: "CANCELLED" | "RESCHEDULED" | "ACCEPTED" | "REJECTED", targetId?: string) {
    const idToUpdate = targetId || selectedAppt?.id;
    if (!idToUpdate) return;
    
    setProcessingId(idToUpdate);
    setIsSubmitting(true);
    
    const result = await manageAppointment(
      idToUpdate, 
      action, 
      action === "RESCHEDULED" ? newDatetime : undefined
    );

    if (result.success) {
      toast.success(result.message);
      setIsManageModalOpen(false);
      setIsRescheduling(false);
      setNewDatetime("");
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setProcessingId(null);
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E3A5F]">My Schedule</h1>
          <p className="text-[#1E3A5F]/70 font-medium mt-1">Manage your consultations and time slots.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-bold rounded-xl h-11 px-6 shadow-md flex items-center gap-2">
          <Settings className="w-4 h-4" /> Edit Availability
        </Button>
      </div>

      {/* APPOINTMENTS LIST */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card className="p-12 border-dashed border-2 border-[#6FAEE7]/30 bg-white flex flex-col items-center justify-center text-center rounded-3xl">
            <Calendar className="w-12 h-12 text-[#1E3A5F]/20 mb-4" />
            <h3 className="text-lg font-bold text-[#1E3A5F]">No Appointments Scheduled</h3>
            <p className="text-[#1E3A5F]/60 max-w-sm mt-2">Your consultation calendar is currently clear.</p>
          </Card>
        ) : (
          appointments.map((appt: any) => {
            // FIX: Safely extract names with defensive fallbacks
            const patientFirst = appt.patient?.user?.firstName || "Unknown";
            const patientLast = appt.patient?.user?.lastName || "Patient";
            const patientFullName = `${patientFirst} ${patientLast}`.trim();

            return (
              <Card key={appt.id} className={`p-6 border shadow-sm rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${appt.status === "CANCELLED" || appt.status === "REJECTED" ? "opacity-60 border-gray-100 bg-gray-50" : appt.status === "PROPOSED" ? "bg-amber-50/40 border-amber-200" : "bg-white border-[#6FAEE7]/20 hover:border-[#6FAEE7]/50"}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1E3A5F]/5 flex items-center justify-center text-[#1E3A5F] font-bold text-xl shrink-0">
                    {patientFirst.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#1E3A5F]">{patientFullName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${appt.status === "SCHEDULED" || appt.status === "RESCHEDULED" ? "bg-blue-50 text-blue-700" : appt.status === "PROPOSED" ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-700"}`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#1E3A5F]/70 line-clamp-1">{appt.reason || "General Consultation"}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs font-bold text-[#1E3A5F]/60">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#6FAEE7]" /> {new Date(appt.datetime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#6FAEE7]" /> {new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                  {(appt.status === "SCHEDULED" || appt.status === "RESCHEDULED") && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => { setSelectedAppt(appt); setIsManageModalOpen(true); }}
                        className="border-[#6FAEE7]/30 text-[#1E3A5F] rounded-xl h-11 px-4 font-semibold"
                      >
                        <Edit className="w-4 h-4 mr-2" /> Manage
                      </Button>
                      <Link href={`/doctor/consultation/${appt.id}`} className="w-full sm:w-auto">
                        <Button className="w-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-bold rounded-xl h-11 px-6 flex items-center justify-center gap-2 shadow-md">
                          <Video className="w-4 h-4" /> Enter LunaRoom
                        </Button>
                      </Link>
                    </>
                  )}

                  {appt.status === "PROPOSED" && (
                    <>
                      <Button onClick={() => handleManageAction("ACCEPTED", appt.id)} disabled={processingId === appt.id} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-4 font-semibold shadow-sm">
                        {processingId === appt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Accept</>}
                      </Button>
                      <Button onClick={() => { setSelectedAppt(appt); setIsManageModalOpen(true); setIsRescheduling(true); }} disabled={processingId === appt.id} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-4 font-semibold shadow-sm">
                        <Clock className="w-4 h-4 mr-2" /> Reschedule
                      </Button>
                      <Button onClick={() => handleManageAction("REJECTED", appt.id)} disabled={processingId === appt.id} variant="destructive" className="rounded-xl h-11 px-3 shadow-sm">
                        {processingId === appt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* APPOINTMENT MANAGEMENT MODAL */}
      {isManageModalOpen && selectedAppt && (
        <div className="fixed inset-0 bg-[#1E3A5F]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#6FAEE7]/20 animate-in zoom-in-95 duration-200 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setIsManageModalOpen(false); setIsRescheduling(false); }} className="absolute top-4 right-4 p-1.5 text-[#1E3A5F]/40 hover:text-[#1E3A5F] rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1E3A5F]">Manage Appointment</h3>
              {/* FIX: Safe Fallback for Modal Name */}
              <p className="text-sm text-[#1E3A5F]/60">
                Patient: {selectedAppt.patient?.user?.firstName || "Unknown"} {selectedAppt.patient?.user?.lastName || "Patient"}
              </p>
            </div>

            <div className="p-4 bg-[#F7FAFC] rounded-xl text-sm space-y-2 border border-[#6FAEE7]/10">
              <div className="flex justify-between"><span className="text-[#1E3A5F]/60">Current Date:</span><span className="font-semibold text-[#1E3A5F]">{new Date(selectedAppt.datetime).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-[#1E3A5F]/60">Current Time:</span><span className="font-semibold text-[#1E3A5F]">{new Date(selectedAppt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>

            {isRescheduling ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Select New Date & Time</label>
                  <Input type="datetime-local" value={newDatetime} onChange={(e) => setNewDatetime(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]" />
                  <p className="text-xs text-[#1E3A5F]/50">Patients will automatically receive a notification of this change.</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleManageAction("RESCHEDULED")} disabled={isSubmitting || !newDatetime} className="flex-1 bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm Change"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsRescheduling(false)} className="border-[#6FAEE7]/20 text-[#1E3A5F] rounded-xl font-semibold">Back</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={() => setIsRescheduling(true)} className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 h-12">
                  <RefreshCw className="w-4 h-4" /> Reschedule Appointment
                </Button>
                <Button onClick={() => handleManageAction("CANCELLED")} disabled={isSubmitting} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2 h-12">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><X className="w-4 h-4" /> Cancel Consultation</>}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* AVAILABILITY MATRIX MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1E3A5F]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#6FAEE7]/20 p-6 relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-[#1E3A5F]/40 hover:text-[#1E3A5F] rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 shrink-0">
              <h3 className="text-xl font-bold text-[#1E3A5F]">Availability Control Matrix</h3>
              <p className="text-sm text-[#1E3A5F]/60 mt-1">Select the days and specific times you are available to accept bookings.</p>
            </div>
            <form onSubmit={handleAvailabilitySubmit} className="overflow-y-auto pr-2 space-y-6 flex-1 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Working Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="flex items-center gap-2 p-2.5 rounded-xl border border-[#6FAEE7]/20 bg-white hover:bg-[#F7FAFC] cursor-pointer transition-colors has-checked::bg-[#1E3A5F] has-checked::text-white has-checked::border-[#1E3A5F]">
                      <input type="checkbox" name="clinicDays" value={day} defaultChecked={profile.clinicDays.includes(day)} className="hidden" />
                      <CheckSquare className="w-4 h-4 opacity-70" />
                      <span className="text-sm font-semibold">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Specific Time Slots</label>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-3">
                  <p className="text-xs text-blue-700 font-medium">Patients will only be able to book you during the exact time slots selected below.</p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {ALL_TIME_SLOTS.map((timeFloat) => (
                    <label key={timeFloat} className="flex flex-col items-center justify-center p-2 rounded-xl border border-[#6FAEE7]/20 bg-white hover:bg-[#F7FAFC] cursor-pointer transition-colors has-checked::bg-[#6FAEE7] has-checked::text-white has-checked::border-[#6FAEE7] has-checked::shadow-sm text-[#1E3A5F]">
                      <input type="checkbox" name="availability" value={timeFloat} defaultChecked={profile.availability.includes(timeFloat)} className="hidden" />
                      <span className="text-sm font-semibold">{formatTime(timeFloat)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-6 sticky bottom-0 bg-white border-t border-[#6FAEE7]/10 mt-auto pb-2">
                <Button type="submit" disabled={isUpdatingAvailability} className="w-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl h-12 font-bold shadow-md">
                  {isUpdatingAvailability ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Availability Restrictions"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}