"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Clock, Video, Settings, X, CheckSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { updateAvailability } from "@/app/doctor/schedule/actions";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Generate time slots from 8:00 AM (8.0) to 5:00 PM (17.0) in 30-minute increments
const ALL_TIME_SLOTS = Array.from({ length: 19 }, (_, i) => 8 + i * 0.5); 

// Helper to format float to 12-hour time (e.g., 9.5 -> "09:30 AM")
const formatTime = (timeFloat: number) => {
  const hours = Math.floor(timeFloat);
  const minutes = Math.round((timeFloat - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

interface ScheduleClientProps {
  userId: string;
  appointments: any[];
  profile: {
    clinicDays: string[];
    availability: number[];
  };
}

export function ScheduleClient({ userId, appointments, profile }: ScheduleClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // REAL-TIME PUSHER SYNC
  // ==========================================
  useEffect(() => {
    if (!pusherClient || !userId) return;

    const channelName = `user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-notification", () => {
      // Silently refresh the server data when a notification (booking/cancellation) arrives
      router.refresh();
    });

    return () => {
      pusherClient?.unsubscribe(channelName);
    };
  }, [userId, router]);

  // ==========================================
  // FORM HANDLING
  // ==========================================
  async function handleAvailabilitySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateAvailability(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Availability matrix updated successfully!");
      setIsModalOpen(false);
    }
    setIsLoading(false);
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
          appointments.map((appt) => (
            <Card key={appt.id} className={`p-6 border shadow-sm rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${appt.status === "CANCELLED" ? "opacity-60 border-gray-100 bg-gray-50" : "bg-white border-[#6FAEE7]/20 hover:border-[#6FAEE7]/50"}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1E3A5F]/5 flex items-center justify-center text-[#1E3A5F] font-bold text-xl shrink-0">
                  {appt.patient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#1E3A5F]">{appt.patient.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${appt.status === "SCHEDULED" || appt.status === "RESCHEDULED" ? "bg-blue-50 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
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

              {(appt.status === "SCHEDULED" || appt.status === "RESCHEDULED") && (
                <Link href={`/doctor/consultation/${appt.id}`} className="shrink-0 w-full md:w-auto">
                  <Button className="w-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-bold rounded-xl h-11 px-6 flex items-center gap-2 shadow-md">
                    <Video className="w-4 h-4" /> Enter LunaRoom
                  </Button>
                </Link>
              )}
            </Card>
          ))
        )}
      </div>

      {/* ========================================== */}
      {/* AVAILABILITY MATRIX MODAL */}
      {/* ========================================== */}
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
              
              {/* CLINIC DAYS */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Working Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="flex items-center gap-2 p-2.5 rounded-xl border border-[#6FAEE7]/20 bg-white hover:bg-[#F7FAFC] cursor-pointer transition-colors has-[:checked]:bg-[#1E3A5F] has-[:checked]:text-white has-[:checked]:border-[#1E3A5F]">
                      <input type="checkbox" name="clinicDays" value={day} defaultChecked={profile.clinicDays.includes(day)} className="hidden" />
                      <CheckSquare className="w-4 h-4 opacity-70" />
                      <span className="text-sm font-semibold">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* TIME SLOTS (RESTRICTING AVAILABILITY) */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Specific Time Slots</label>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-3">
                  <p className="text-xs text-blue-700 font-medium">Patients will only be able to book you during the exact time slots selected below.</p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {ALL_TIME_SLOTS.map((timeFloat) => (
                    <label key={timeFloat} className="flex flex-col items-center justify-center p-2 rounded-xl border border-[#6FAEE7]/20 bg-white hover:bg-[#F7FAFC] cursor-pointer transition-colors has-[:checked]:bg-[#6FAEE7] has-[:checked]:text-white has-[:checked]:border-[#6FAEE7] has-[:checked]:shadow-sm text-[#1E3A5F]">
                      <input type="checkbox" name="availability" value={timeFloat} defaultChecked={profile.availability.includes(timeFloat)} className="hidden" />
                      <span className="text-sm font-semibold">{formatTime(timeFloat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 sticky bottom-0 bg-white border-t border-[#6FAEE7]/10 mt-auto pb-2">
                <Button type="submit" disabled={isLoading} className="w-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl h-12 font-bold shadow-md">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Availability Restrictions"}
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}
    </div>
  );
}