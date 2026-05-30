import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LunaRoom } from "@/components/consultation/LunaRoom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

// FIX 1: Change params type to a Promise
export default async function PatientConsultationPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // FIX 2: Await the params to extract the ID securely
  const { id } = await params;

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 1. Fetch the Appointment using the awaited 'id'
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (!appointment || appointment.patient.userId !== user.id) {
    redirect("/patient/dashboard?error=UnauthorizedAccess");
  }

  // 2. Prevent joining cancelled appointments
  if (appointment.status === "CANCELLED") {
    redirect("/patient/dashboard?error=AppointmentCancelled");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-[#6FAEE7]/10">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Virtual Consultation</h1>
          <p className="text-[#1E3A5F]/70 text-sm mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Secure End-to-End Encrypted Session with Dr. {appointment.doctor.name}
          </p>
        </div>
        <Link href="/patient/dashboard" className="flex items-center gap-2 text-sm font-semibold text-[#1E3A5F] hover:text-[#6FAEE7] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Leave Room
        </Link>
      </div>

      {/* The Dynamic Video Room */}
      <LunaRoom 
        roomName={appointment.id} 
        userName={appointment.patient.name} 
        userEmail={user.emailAddresses[0].emailAddress} 
        isDoctor={false}
        returnUrl="/patient/dashboard"
      />
      
    </div>
  );
}