"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, AlertCircle, X, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AppointmentWithDoctor {
  id: string;
  datetime: Date | string;
  status: string;
  reason: string | null;
  meetingLink: string | null;
  clinicalNotes: string | null;
  prescription: string | null;
  doctor: {
    name: string;
    specialization: string;
    clinicDays: string[];
    availability: number[];
  };
}

interface CareTimelineClientProps {
  upcomingAppointments: AppointmentWithDoctor[];
  pastAppointments: AppointmentWithDoctor[];
  ongoingConcerns: string | null;
}

export function CareTimelineClient({
  upcomingAppointments,
  pastAppointments,
  ongoingConcerns,
}: CareTimelineClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedAppt, setSelectedAppt] = useState<AppointmentWithDoctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New State for Doctor-specific Date/Time selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  // Helper 1: Convert float time to readable string (9.5 -> "09:30 AM")
  const formatTime = (timeFloat: number) => {
    const hours = Math.floor(timeFloat);
    const minutes = Math.round((timeFloat - hours) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Helper 2: Generate the next 30 available days matching the doctor's clinic days
  const availableDates = useMemo(() => {
    if (!selectedAppt || !selectedAppt.doctor.clinicDays.length) return [];
    
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Look ahead 60 days to find enough valid slots
    for (let i = 1; i <= 60; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const dayName = futureDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (selectedAppt.doctor.clinicDays.includes(dayName)) {
        dates.push(futureDate);
      }
      if (dates.length >= 14) break; // Provide exactly 14 valid upcoming days
    }
    return dates;
  }, [selectedAppt]);

  const handleAction = async (status: "CANCELLED" | "RESCHEDULED") => {
    if (!selectedAppt) return;
    
    let combinedDatetime = null;

    if (status === "RESCHEDULED") {
      if (!selectedDate || selectedTime === null) {
        toast.error("Please select both an available date and a time slot.");
        return;
      }
      // Combine the selected Date object and the float Time into a single JS Date payload
      combinedDatetime = new Date(selectedDate);
      const hours = Math.floor(selectedTime);
      const minutes = (selectedTime - hours) * 60;
      combinedDatetime.setHours(hours, minutes, 0, 0);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/appointments/${selectedAppt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(combinedDatetime && { newDatetime: combinedDatetime.toISOString() }),
        }),
      });

      if (!response.ok) throw new Error("Failed to process action");

      toast.success(`Appointment successfully ${status.toLowerCase()}!`);
      setIsModalOpen(false);
      setIsRescheduling(false);
      setSelectedDate(null);
      setSelectedTime(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating your appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ONGOING CONCERNS HEADER */}
      <Card className="p-6 border-l-4 border-l-[#6FAEE7] bg-white shadow-sm rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#6FAEE7]/10 rounded-xl text-[#1E3A5F]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/50">Current / Ongoing Concerns</h2>
            <p className="text-base font-semibold text-[#1E3A5F]">
              {ongoingConcerns || "No chronic active conditions or clinical ongoing concerns documented by your practitioners."}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-[#6FAEE7]/20 gap-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === "upcoming" ? "text-[#1E3A5F]" : "text-[#1E3A5F]/40"}`}
        >
          Upcoming Consultations ({upcomingAppointments.length})
          {activeTab === "upcoming" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A5F]" />}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === "past" ? "text-[#1E3A5F]" : "text-[#1E3A5F]/40"}`}
        >
          Past Sessions & Records ({pastAppointments.length})
          {activeTab === "past" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A5F]" />}
        </button>
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        {/* Render UI based on activeTab (Kept identical to previous implementation) */}
        {activeTab === "upcoming" ? (
          upcomingAppointments.length === 0 ? (
            <p className="text-sm text-[#1E3A5F]/50 text-center py-8">No scheduled active appointments found.</p>
          ) : (
            upcomingAppointments.map((appt) => (
              <Card
                key={appt.id}
                onClick={() => { setSelectedAppt(appt); setIsModalOpen(true); }}
                className="p-5 border border-[#6FAEE7]/10 hover:border-[#6FAEE7]/40 shadow-sm rounded-2xl bg-white transition-all cursor-pointer hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${appt.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                      {appt.status}
                    </span>
                    <span className="text-xs text-[#1E3A5F]/50 font-mono">ID: {appt.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1E3A5F] group-hover:text-[#6FAEE7] transition-colors">
                    Dr. {appt.doctor.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-[#1E3A5F]/70">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-[#6FAEE7]" /> {appt.doctor.specialization}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#6FAEE7]" /> {new Date(appt.datetime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#6FAEE7]" /> {new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <span className="text-xs font-bold text-[#6FAEE7] group-hover:translate-x-1 transition-transform">Manage Schedule &rarr;</span>
                </div>
              </Card>
            ))
          )
        ) : (
          pastAppointments.map((appt) => (
              <Card key={appt.id} className={`p-5 border rounded-2xl bg-white flex flex-col gap-4 ${appt.status === "CANCELLED" ? "opacity-60" : "border-[#6FAEE7]/10"}`}>
                <div className="space-y-1">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${appt.status === "COMPLETED" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {appt.status}
                  </span>
                  <h3 className="text-base font-bold text-[#1E3A5F]">Consultation with Dr. {appt.doctor.name}</h3>
                  <p className="text-xs text-[#1E3A5F]/60">{new Date(appt.datetime).toLocaleDateString()}</p>
                </div>
                {appt.status === "COMPLETED" && (
                  <div className="mt-2 p-4 bg-[#F7FAFC] border border-[#6FAEE7]/10 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-[#1E3A5F] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Post-Session Summary & Clinical Records
                    </h4>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-[#1E3A5F]/80 leading-relaxed">
                        <span className="font-semibold text-[#1E3A5F] block text-xs uppercase opacity-60">Clinical Notes:</span> 
                        {appt.clinicalNotes || "No detailed findings documented."}
                      </p>
                      
                      {appt.prescription && (
                        <div className="p-3 bg-white border border-green-100 rounded-lg shadow-sm mt-2">
                           <span className="font-semibold text-green-700 block text-xs uppercase mb-1">E-Prescription Issued:</span> 
                           <p className="text-sm text-[#1E3A5F] whitespace-pre-wrap">{appt.prescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
          ))
        )}
      </div>

      {/* ========================================== */}
      {/* SMART RESCHEDULE MODAL */}
      {/* ========================================== */}
      {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 bg-[#1E3A5F]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#6FAEE7]/20 animate-in zoom-in-95 duration-200 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setIsModalOpen(false); setIsRescheduling(false); setSelectedDate(null); setSelectedTime(null); }}
              className="absolute top-4 right-4 p-1.5 text-[#1E3A5F]/40 hover:text-[#1E3A5F] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1E3A5F]">Manage Consultation</h3>
              <p className="text-sm text-[#1E3A5F]/60">Dr. {selectedAppt.doctor.name} — {selectedAppt.doctor.specialization}</p>
            </div>

            <div className="p-4 bg-[#F7FAFC] rounded-xl text-sm space-y-2 border border-[#6FAEE7]/10">
              <div className="flex justify-between"><span className="text-[#1E3A5F]/60">Current Date:</span><span className="font-semibold text-[#1E3A5F]">{new Date(selectedAppt.datetime).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-[#1E3A5F]/60">Current Time:</span><span className="font-semibold text-[#1E3A5F]">{new Date(selectedAppt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>

            {isRescheduling ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* DOCTOR AVAILABILITY: DATE SELECTOR */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/60">Available Dates</label>
                  {availableDates.length === 0 ? (
                    <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">This doctor has no available clinic days set.</p>
                  ) : (
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-[#6FAEE7]/30">
                      {availableDates.map((date, i) => {
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-xl border transition-all ${
                              isSelected ? "bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-md" : "bg-white border-[#6FAEE7]/20 text-[#1E3A5F] hover:border-[#6FAEE7]"
                            }`}
                          >
                            <span className="text-xs uppercase font-semibold opacity-70">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-lg font-bold">{date.getDate()}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* DOCTOR AVAILABILITY: TIME SELECTOR */}
                {selectedDate && (
                  <div className="space-y-3 animate-in fade-in">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/60">Available Times</label>
                    {selectedAppt.doctor.availability.length === 0 ? (
                      <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">No time slots configured.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedAppt.doctor.availability.map((timeFloat) => {
                          const isSelected = selectedTime === timeFloat;
                          return (
                            <button
                              key={timeFloat}
                              onClick={() => setSelectedTime(timeFloat)}
                              className={`py-2 px-1 text-sm font-semibold rounded-xl border transition-all ${
                                isSelected ? "bg-[#6FAEE7] border-[#6FAEE7] text-white shadow-sm" : "bg-white border-[#6FAEE7]/20 text-[#1E3A5F] hover:border-[#6FAEE7]"
                              }`}
                            >
                              {formatTime(timeFloat)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleAction("RESCHEDULED")}
                    disabled={isSubmitting || !selectedDate || selectedTime === null}
                    className="flex-1 bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating..." : "Confirm Reschedule"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsRescheduling(false)} className="border-[#6FAEE7]/20 text-[#1E3A5F] rounded-xl font-semibold">
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={() => setIsRescheduling(true)} className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Reschedule Appointment
                </Button>
                <Button onClick={() => handleAction("CANCELLED")} disabled={isSubmitting} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <X className="w-4 h-4" /> Cancel Consultation
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}