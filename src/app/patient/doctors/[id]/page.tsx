import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/booking/booking-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Award, BookOpen, Stethoscope, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DoctorProfilePage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Next.js 15+ best practice for dynamic route params
  const { id } = await params;
  const doctorId = parseInt(id);

  // FIX 1: Add 'return' to halt execution
  if (isNaN(doctorId)) return notFound();

  // Fetch the specific doctor's profile AND their future booked appointments
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: { 
      user: true,
      appointments: {
        where: {
          datetime: { gte: new Date() }, // Only fetch appointments from right now onward
          status: "SCHEDULED",           // Only count active bookings
        },
        select: { datetime: true },      // We only need the dates to calculate availability
      }
    },
  });

  // FIX 2: Add 'return' to halt execution and satisfy TypeScript
  if (!doctor) return notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Back Button */}
      <Link href="/patient/doctors">
        <Button variant="ghost" className="text-[#1E3A5F]/70 hover:text-[#1E3A5F] hover:bg-[#6FAEE7]/10 -ml-4 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Doctor Credentials & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-[#6FAEE7]/10 shadow-sm">
            <Avatar className="w-32 h-32 border-4 border-[#F7FAFC] shadow-md">
              {/* Safely fallback to an empty string if profileImage doesn't exist */}
              <AvatarImage src={""} className="object-cover" />
              <AvatarFallback className="bg-[#1E3A5F] text-white text-3xl font-bold">
                {doctor.name.charAt(4)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-extrabold text-[#1E3A5F] tracking-tight">{doctor.name}</h1>
              <p className="text-lg font-semibold text-[#6FAEE7] mt-1">{doctor.specialization}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-amber-700">{(doctor.rating ?? 0) > 0 ? `${doctor.rating} Rating` : "New Doctor"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#1E3A5F]/70 bg-[#F7FAFC] px-3 py-1 rounded-full border border-[#6FAEE7]/10">
                  <BookOpen className="w-4 h-4" />
                  {doctor.totalConsultations} Consults Completed
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white p-8 rounded-3xl border border-[#6FAEE7]/10 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-[#6FAEE7]" /> Professional Background
              </h3>
              <p className="text-[#1E3A5F]/80 leading-relaxed text-base">
                {doctor.bio || "This doctor has not provided a professional biography yet."}
              </p>
            </div>

            <hr className="border-[#6FAEE7]/10" />

            <div>
              <h3 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-[#6FAEE7]" /> Sub-Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.subSpecializations && doctor.subSpecializations.length > 0 ? (
                  doctor.subSpecializations.map((sub: string) => (
                    <Badge key={sub} variant="secondary" className="bg-[#F7FAFC] text-[#1E3A5F]/70 px-4 py-1.5 text-sm font-medium border border-[#6FAEE7]/10">
                      {sub}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[#1E3A5F]/50 text-sm italic">General practice only.</p>
                )}
              </div>
            </div>

            <hr className="border-[#6FAEE7]/10" />

            <div>
              <h3 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#6FAEE7]" /> HMO Accreditations
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.hmoAccreditations && doctor.hmoAccreditations.length > 0 ? (
                  doctor.hmoAccreditations.map((hmo: string) => (
                    <Badge key={hmo} variant="outline" className="border-[#6FAEE7]/30 text-[#1E3A5F] px-4 py-1.5 text-sm font-medium bg-white">
                      {hmo}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[#1E3A5F]/50 text-sm italic">Accepts self-pay consultations only.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Booking Form */}
        <div className="lg:col-span-1">
          <BookingForm doctor={doctor} />
        </div>

      </div>
    </div>
  );
}