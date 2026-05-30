import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LunaRoom } from "@/components/consultation/LunaRoom";
import { EMRForm } from "@/components/consultation/EMRForm";
import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";

export default async function DoctorConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Fetch Appointment + Medical Record
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        include: { medicalRecord: true }
      },
      doctor: true,
    },
  });

  if (!appointment || appointment.doctor.userId !== user.id) {
    redirect("/doctor/dashboard?error=UnauthorizedAccess");
  }

  return (
    <div className="max-w-350 mx-auto space-y-6 animate-in fade-in duration-700 h-[calc(100vh-6rem)] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-[#6FAEE7]/10 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F]">Patient Session: {appointment.patient.name}</h1>
          <p className="text-[#1E3A5F]/70 text-sm mt-0.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" /> Reason for visit: {appointment.reason || "General Checkup"}
          </p>
        </div>
        <Link href="/doctor/dashboard" className="flex items-center gap-2 text-sm font-semibold text-[#1E3A5F] hover:text-[#6FAEE7] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Leave Room
        </Link>
      </div>

      {/* SPLIT SCREEN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left: Video Feed (Spans 2 columns) */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <LunaRoom 
            roomName={appointment.id} 
            userName={appointment.doctor.name} 
            userEmail={user.emailAddresses[0].emailAddress} 
            isDoctor={true}
            returnUrl="/doctor/dashboard"
          />
        </div>

        {/* Right: EMR Form (Spans 1 column) */}
        <div className="lg:col-span-1 h-full">
          <EMRForm 
            appointment={appointment} 
            medicalRecord={appointment.patient.medicalRecord} 
          />
        </div>

      </div>
    </div>
  );
}