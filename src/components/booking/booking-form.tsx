"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { bookAppointment } from "@/app/patient/doctors/[id]/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarDays, Loader2, CheckCircle, Lock, Clock, HelpCircle } from "lucide-react";

const DAY_MAP: Record<string, number> = {
  "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
  "Thursday": 4, "Friday": 5, "Saturday": 6
};

const formatTime = (decimalTime: number) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export function BookingForm({ doctor }: { doctor: any }) {
  const router = useRouter();
  
  // Toggle between Standard Booking and Proposing a Time
  const [bookingMode, setBookingMode] = useState<"standard" | "propose">("standard");

  // Standard Mode State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  // Propose Mode State
  const [proposedDate, setProposedDate] = useState<string>("");
  const [proposedTime, setProposedTime] = useState<string>("");

  const [notes, setNotes] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate the next available strictly scheduled days
  const availableDates = useMemo(() => {
    if (!doctor.clinicDays || doctor.clinicDays.length === 0) return [];
    
    const validDays = doctor.clinicDays.map((day: string) => DAY_MAP[day]);
    const dates: Date[] = [];
    let currentDate = new Date();
    
    for (let i = 0; i < 30 && dates.length < 4; i++) {
      if (validDays.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [doctor.clinicDays]);

  // Extract strictly booked times for the currently selected date
  const bookedTimesForSelectedDate = useMemo(() => {
    if (!selectedDate || !doctor.appointments) return [];

    return doctor.appointments
      .map((apt: { datetime: Date | string }) => new Date(apt.datetime))
      .filter((dateObj: Date) => dateObj.toDateString() === selectedDate.toDateString())
      .map((dateObj: Date) => dateObj.getHours() + (dateObj.getMinutes() / 60));
  }, [selectedDate, doctor.appointments]);

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    let finalDatetime = new Date();
    const formData = new FormData();

    if (bookingMode === "standard") {
      if (!selectedDate || selectedTime === null) {
        setError("Please select both a date and a time slot.");
        setIsPending(false);
        return;
      }
      finalDatetime = new Date(selectedDate);
      const hours = Math.floor(selectedTime);
      const minutes = Math.round((selectedTime - hours) * 60);
      finalDatetime.setHours(hours, minutes, 0, 0);
      formData.append("isProposed", "false"); 

    } else {
      if (!proposedDate || !proposedTime) {
        setError("Please provide a date and time for your proposal.");
        setIsPending(false);
        return;
      }
      const [year, month, day] = proposedDate.split("-").map(Number);
      const [hours, minutes] = proposedTime.split(":").map(Number);
      finalDatetime = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      if (finalDatetime < new Date()) {
        setError("Proposed time must be in the future.");
        setIsPending(false);
        return;
      }
      formData.append("isProposed", "true"); 
    }

    formData.append("doctorId", doctor.id.toString());
    formData.append("datetime", finalDatetime.toISOString());
    formData.append("notes", notes);

    const result = await bookAppointment(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/patient/dashboard"), 2000);
    } else {
      setError(result.message);
      setIsPending(false);
      setSelectedTime(null);
    }
  }

  // SUCCESS STATE EARLY RETURN
  if (success) {
    return (
      <Card className="border-none shadow-sm bg-emerald-50 rounded-2xl border border-emerald-100">
        <CardContent className="p-8 text-center animate-in zoom-in-95">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-emerald-900 mb-2">
            {bookingMode === "standard" ? "Booking Confirmed!" : "Proposal Sent!"}
          </h3>
          <p className="text-emerald-700">
            {bookingMode === "standard" 
              ? "Your consultation has been secured. Redirecting to your dashboard..." 
              : "Your time proposal has been sent to the doctor for review. Redirecting..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Helper variable to check if doctor has standard slots
  const hasStandardSlots = availableDates.length > 0 && doctor.availability && doctor.availability.length > 0;

  return (
    <Card className="border border-[#6FAEE7]/20 shadow-lg bg-white rounded-2xl overflow-hidden sticky top-4">
      <CardHeader className="bg-[#F7FAFC] border-b border-[#6FAEE7]/10 pb-4">
        <CardTitle className="text-xl text-[#1E3A5F] flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#6FAEE7]" /> Schedule Consultation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        
        {/* Toggle Switcher ALWAYS Renders */}
        <div className="flex p-1 mb-6 bg-[#F7FAFC] rounded-xl border border-[#6FAEE7]/20">
          <button 
            type="button" 
            onClick={() => setBookingMode("standard")} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${bookingMode === "standard" ? "bg-white text-[#1E3A5F] shadow-sm" : "text-[#1E3A5F]/50 hover:text-[#1E3A5F]"}`}
          >
            Available Slots
          </button>
          <button 
            type="button" 
            onClick={() => setBookingMode("propose")} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${bookingMode === "propose" ? "bg-white text-[#1E3A5F] shadow-sm" : "text-[#1E3A5F]/50 hover:text-[#1E3A5F]"}`}
          >
            Propose Time
          </button>
        </div>

        <form onSubmit={handleBooking} className="space-y-6">
          
          {/* ================= STANDARD MODE ================= */}
          {bookingMode === "standard" && (
            <div className="space-y-6 animate-in fade-in">
              {/* If no standard slots exist, show the unavailable message HERE, not globally */}
              {!hasStandardSlots ? (
                <div className="text-center py-8 p-4 bg-[#F7FAFC] rounded-xl border border-[#6FAEE7]/10">
                  <CalendarDays className="w-10 h-10 text-[#1E3A5F]/20 mx-auto mb-3" />
                  <h3 className="font-semibold text-[#1E3A5F]">No Standard Slots Set</h3>
                  <p className="text-sm text-[#1E3A5F]/60 mt-1">This doctor hasn't set their recurring availability yet. Please click "Propose Time" above to request a custom appointment.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-[#1E3A5F]">Select a Date</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableDates.map((date, idx) => {
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                            className={`p-3 rounded-xl border text-left transition-all ${isSelected ? "border-[#1E3A5F] bg-[#1E3A5F] text-white shadow-md" : "border-[#6FAEE7]/30 bg-white text-[#1E3A5F] hover:border-[#6FAEE7] hover:bg-[#F7FAFC]"}`}
                          >
                            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? "text-[#6FAEE7]" : "text-[#1E3A5F]/50"}`}>
                              {date.toLocaleDateString("en-US", { weekday: "short" })}
                            </div>
                            <div className="font-semibold">
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 fade-in">
                      <Label className="text-sm font-semibold text-[#1E3A5F]">Select a Time</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {doctor.availability.map((time: number) => {
                          const isBooked = bookedTimesForSelectedDate.some((bookedFloat: number) => Math.abs(bookedFloat - time) < 0.01);
                          const now = new Date();
                          const isToday = selectedDate.toDateString() === now.toDateString();
                          const currentFloatTime = now.getHours() + (now.getMinutes() / 60);
                          const isPast = isToday && time <= currentFloatTime;
                          const isDisabled = isBooked || isPast;
                          const isSelected = selectedTime === time;

                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 rounded-xl border text-sm font-medium flex items-center justify-center transition-all ${isDisabled ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60" : isSelected ? "border-[#8ED8C3] bg-[#8ED8C3] text-[#1E3A5F] shadow-sm" : "border-[#6FAEE7]/30 bg-white text-[#1E3A5F] hover:border-[#6FAEE7] hover:bg-[#F7FAFC]"}`}
                            >
                              {isBooked ? <Lock className="w-3.5 h-3.5 mr-1" /> : null}
                              {formatTime(time)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ================= PROPOSE TIME MODE ================= */}
          {bookingMode === "propose" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/50 flex gap-3 text-[#1E3A5F]">
                <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs leading-relaxed opacity-80 font-medium">
                  If standard slots are unavailable, propose a custom time. The doctor will review and confirm if they can accommodate your request.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1E3A5F]">Preferred Date</Label>
                  <Input 
                    type="date" 
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]} 
                    className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC] focus-visible:ring-[#6FAEE7]/50" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1E3A5F]">Preferred Time</Label>
                  <Input 
                    type="time" 
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC] focus-visible:ring-[#6FAEE7]/50" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shared Notes Field */}
          {((bookingMode === "standard" && selectedTime) || bookingMode === "propose") && (
            <div className="space-y-3 animate-in slide-in-from-top-2 fade-in">
              <Label htmlFor="notes" className="text-sm font-semibold text-[#1E3A5F]">Reason for Visit</Label>
              <Textarea 
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your symptoms to help the doctor prepare..." 
                className="min-h-25 border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50 rounded-xl bg-[#F7FAFC]" 
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-lg border border-red-100">{error}</p>}

          {/* Only show submit button if we are in propose mode, OR if standard mode actually has slots */}
          {(bookingMode === "propose" || hasStandardSlots) && (
            <Button 
              type="submit" 
              disabled={
                isPending || 
                (bookingMode === "standard" && (!selectedDate || selectedTime === null)) || 
                (bookingMode === "propose" && (!proposedDate || !proposedTime))
              } 
              className="w-full h-14 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-semibold text-lg shadow-md transition-all disabled:opacity-70"
            >
              {isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
              ) : bookingMode === "propose" ? (
                <><Clock className="w-5 h-5 mr-2" /> Propose Time</>
              ) : (
                "Confirm Appointment"
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}