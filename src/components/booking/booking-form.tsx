"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { bookAppointment } from "@/app/patient/doctors/[id]/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarDays, Loader2, CheckCircle, Lock } from "lucide-react";

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
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Calculate the next available days
  const availableDates = useMemo(() => {
    if (!doctor.clinicDays || doctor.clinicDays.length === 0) return [];
    
    const validDays = doctor.clinicDays.map((day: string) => DAY_MAP[day]);
    const dates: Date[] = [];
    let currentDate = new Date();
    // Start today, not tomorrow, to allow same-day bookings if slots are open
    
    for (let i = 0; i < 30 && dates.length < 4; i++) {
      if (validDays.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [doctor.clinicDays]);

  // 2. Extract strictly booked times for the currently selected date
  const bookedTimesForSelectedDate = useMemo(() => {
    if (!selectedDate || !doctor.appointments) return [];

    return doctor.appointments
      .map((apt: { datetime: Date | string }) => new Date(apt.datetime))
      .filter((dateObj: Date) => dateObj.toDateString() === selectedDate.toDateString())
      .map((dateObj: Date) => {
        // Convert the Date object back to the float schema format (e.g., 14.5 for 2:30 PM)
        return dateObj.getHours() + (dateObj.getMinutes() / 60);
      });
  }, [selectedDate, doctor.appointments]);

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || selectedTime === null) {
      setError("Please select both a date and a time slot.");
      return;
    }

    setIsPending(true);
    setError(null);

    const finalDatetime = new Date(selectedDate);
    const hours = Math.floor(selectedTime);
    const minutes = Math.round((selectedTime - hours) * 60);
    finalDatetime.setHours(hours, minutes, 0, 0);

    const formData = new FormData();
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
      // Reset selected time since it failed (likely due to race condition)
      setSelectedTime(null);
    }
  }

  if (availableDates.length === 0 || !doctor.availability) {
    return (
      <Card className="border-none shadow-sm bg-white rounded-2xl">
        <CardContent className="p-8 text-center">
          <CalendarDays className="w-12 h-12 text-[#1E3A5F]/20 mx-auto mb-4" />
          <h3 className="font-semibold text-[#1E3A5F]">Schedule Unavailable</h3>
          <p className="text-sm text-[#1E3A5F]/60 mt-2">This doctor is not currently accepting new appointments.</p>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="border-none shadow-sm bg-emerald-50 rounded-2xl border border-emerald-100">
        <CardContent className="p-8 text-center animate-in zoom-in-95">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-emerald-900 mb-2">Booking Confirmed!</h3>
          <p className="text-emerald-700">Your consultation has been secured. Redirecting to your dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#6FAEE7]/20 shadow-lg bg-white rounded-2xl overflow-hidden sticky top-4">
      <CardHeader className="bg-[#F7FAFC] border-b border-[#6FAEE7]/10 pb-4">
        <CardTitle className="text-xl text-[#1E3A5F] flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#6FAEE7]" /> Secure Your Slot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleBooking} className="space-y-6">
          
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-[#1E3A5F]">Select a Date</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableDates.map((date, idx) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime(null); // Reset time when date changes
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? "border-[#1E3A5F] bg-[#1E3A5F] text-white shadow-md" 
                        : "border-[#6FAEE7]/30 bg-white text-[#1E3A5F] hover:border-[#6FAEE7] hover:bg-[#F7FAFC]"
                    }`}
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
                  
                  // 3. Prevent Double Booking Logic
                  // We check if the DB booked time is within a safe decimal margin (0.01) to avoid JavaScript float math errors.
                  const isBooked = bookedTimesForSelectedDate.some((bookedFloat: number) => Math.abs(bookedFloat - time) < 0.01);
                  
                  // 4. Prevent Past Time Logic (If looking at today's schedule, disable past hours)
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
                      className={`py-2 rounded-xl border text-sm font-medium flex items-center justify-center transition-all ${
                        isDisabled
                          ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                          : isSelected 
                            ? "border-[#8ED8C3] bg-[#8ED8C3] text-[#1E3A5F] shadow-sm" 
                            : "border-[#6FAEE7]/30 bg-white text-[#1E3A5F] hover:border-[#6FAEE7] hover:bg-[#F7FAFC]"
                      }`}
                    >
                      {isBooked ? <Lock className="w-3.5 h-3.5 mr-1" /> : null}
                      {formatTime(time)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTime && (
            <div className="space-y-3 animate-in slide-in-from-top-2 fade-in">
              <Label htmlFor="notes" className="text-sm font-semibold text-[#1E3A5F]">Reason for Visit (Optional)</Label>
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

          <Button 
            type="submit" 
            disabled={!selectedDate || selectedTime === null || isPending} 
            className="w-full h-14 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-semibold text-lg shadow-md transition-all disabled:opacity-70"
          >
            {isPending ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</> : "Confirm Appointment"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}