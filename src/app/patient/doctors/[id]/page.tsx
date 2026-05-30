import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/booking/booking-form";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MapPin, 
  Award, 
  BookOpen, 
  Stethoscope, 
  ArrowLeft, 
  Building,
  Clock,
  Phone
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Await the params object (Next.js 15+ standard)
  const { id } = await params;
  const doctorId = parseInt(id);

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
          
          {/* ================= PROFILE HEADER ================= */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-[#6FAEE7]/10 shadow-sm">
            
            {/* Custom Optimized Next.js Avatar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#F7FAFC] shadow-md shrink-0 bg-[#1E3A5F] flex items-center justify-center text-white text-4xl font-bold">
              {doctor.profilePicture ? (
                <Image 
                  src={doctor.profilePicture} 
                  alt={`Dr. ${doctor.name}`} 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 128px"
                  priority
                />
              ) : (
                // Safe fallback to first letter of name if no photo exists
                doctor.name.charAt(0)
              )}
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-[#1E3A5F] tracking-tight">{doctor.name}</h1>
              <p className="text-lg font-semibold text-[#6FAEE7] mt-1 flex items-center gap-2">
                {doctor.specialization} 
                {doctor.gender && <span className="text-sm font-normal text-[#1E3A5F]/50 bg-[#F7FAFC] px-2 py-0.5 rounded-md border border-[#6FAEE7]/10">{doctor.gender}</span>}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-amber-700">{(doctor.rating ?? 0) > 0 ? `${doctor.rating} Rating` : "New Doctor"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#1E3A5F]/70 bg-[#F7FAFC] px-3 py-1 rounded-full border border-[#6FAEE7]/10">
                  <BookOpen className="w-4 h-4 text-[#6FAEE7]" />
                  {doctor.totalConsultations} Consults Completed
                </div>
              </div>
            </div>
          </div>

          {/* ================= ABOUT & DETAILS SECTION ================= */}
          <div className="bg-white p-8 rounded-3xl border border-[#6FAEE7]/10 shadow-sm space-y-6">
            
            {/* Bio */}
            <div>
              <h3 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-[#6FAEE7]" /> Professional Background
              </h3>
              <p className="text-[#1E3A5F]/80 leading-relaxed text-base">
                {doctor.bio || "This doctor has not provided a professional biography yet."}
              </p>
            </div>

            <hr className="border-[#6FAEE7]/10" />

            {/* Sub-Specializations */}
            <div>
              <h3 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-[#6FAEE7]" /> Sub-Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.subSpecializations && doctor.subSpecializations.length > 0 ? (
                  doctor.subSpecializations.map((sub: string) => (
                    <Badge key={sub} variant="secondary" className="bg-[#F7FAFC] text-[#1E3A5F]/80 px-4 py-1.5 text-sm font-medium border border-[#6FAEE7]/20">
                      {sub}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[#1E3A5F]/50 text-sm italic">General practice only.</p>
                )}
              </div>
            </div>

            <hr className="border-[#6FAEE7]/10" />

            {/* HMOs */}
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

            <hr className="border-[#6FAEE7]/10" />

            {/* Logistics & Contact */}
            <div>
              <h3 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-[#6FAEE7]" /> Clinic Details & Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#1E3A5F]/80">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7FAFC] border border-[#6FAEE7]/10">
                  <Building className="w-5 h-5 text-[#6FAEE7] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1E3A5F]">Room Number</span>
                    <span>{doctor.roomNumber || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7FAFC] border border-[#6FAEE7]/10">
                  <Clock className="w-5 h-5 text-[#6FAEE7] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1E3A5F]">Standard Hours</span>
                    <span>{doctor.clinicHours || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F7FAFC] border border-[#6FAEE7]/10 md:col-span-2">
                  <Phone className="w-5 h-5 text-[#6FAEE7] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1E3A5F]">Contact Desk</span>
                    <span>{doctor.phoneNumber || "Not specified"}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Booking Form */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <BookingForm doctor={doctor} />
        </div>

      </div>
    </div>
  );
}