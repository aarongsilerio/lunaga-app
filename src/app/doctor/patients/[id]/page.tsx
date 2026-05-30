import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCircle, Activity, Calendar, Clock, FileText, Pill, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function PatientEMRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patientId = parseInt(id);

  if (isNaN(patientId)) return notFound();

  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 1. Authenticate Doctor
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { doctorProfile: true }
  });

  if (!dbUser || !dbUser.doctorProfile) redirect("/onboarding/doctor");
  const doctorId = dbUser.doctorProfile.id;

  // 2. Fetch Patient Data + Appointment History (ONLY for this doctor)
  const patient = await prisma.patientProfile.findUnique({
    where: { id: patientId },
    include: {
      user: true, // FIX 1: Explicitly include the base User table to get the names
      medicalRecord: true,
      appointments: {
        where: { doctorId: doctorId, status: "COMPLETED" }, // Only show finalized records
        orderBy: { datetime: "desc" }
      }
    }
  });

  // SECURITY CHECK: If patient doesn't exist, OR the doctor has zero appointments with them, deny access.
  if (!patient) return notFound();
  
  // To strictly enforce data silos, we check if they have any relationship.
  const relationshipCheck = await prisma.appointment.findFirst({
    where: { doctorId, patientId }
  });
  if (!relationshipCheck) redirect("/doctor/patients?error=Unauthorized");

  // FIX 2: Construct the full name safely
  const patientFullName = `${patient.user?.firstName || "Unknown"} ${patient.user?.lastName || ""}`.trim();
  const patientInitial = patient.user?.firstName?.charAt(0) || "P";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Back Button */}
      <Link href="/doctor/patients">
        <Button variant="ghost" className="text-[#1E3A5F]/70 hover:text-[#1E3A5F] hover:bg-[#6FAEE7]/10 -ml-4 mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
      </Link>

      {/* ================= PATIENT HEADER ================= */}
      <Card className="p-8 bg-[#1E3A5F] text-white rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-12.5 right-12.5 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-white text-[#1E3A5F] flex items-center justify-center font-bold text-4xl shrink-0 shadow-inner">
            {/* FIX 3: Inject the safe initial */}
            {patientInitial}
          </div>
          <div className="flex-1">
            {/* FIX 4: Inject the full constructed name */}
            <h1 className="text-3xl font-extrabold">{patientFullName}</h1>
            <p className="text-white/70 font-medium mt-1 text-sm tracking-widest uppercase">
              Patient ID: {patient.id.toString().padStart(6, '0')}
            </p>
          </div>
        </div>

        <div className="mt-8 p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm relative z-10">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-2 text-red-200">
            <Activity className="w-4 h-4" /> Global Ongoing Concerns
          </h3>
          <p className="text-white/90 leading-relaxed text-sm">
            {patient.medicalRecord?.ongoingConcerns || "No chronic conditions or ongoing concerns currently documented."}
          </p>
        </div>
      </Card>

      {/* ================= CONSULTATION HISTORY ================= */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-[#1E3A5F] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#6FAEE7]" /> Consultation History
        </h2>

        {patient.appointments.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-[#6FAEE7]/30 rounded-3xl shadow-sm">
            <Calendar className="w-12 h-12 text-[#1E3A5F]/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1E3A5F]">No Completed Consultations</h3>
            <p className="text-[#1E3A5F]/60 mt-2">Historical records will appear here once you complete a session with this patient.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {patient.appointments.map((appt) => (
              <Card key={appt.id} className="p-0 bg-white border border-[#6FAEE7]/20 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Side: Date & Time Metadata */}
                <div className="bg-[#F7FAFC] p-6 border-b md:border-b-0 md:border-r border-[#6FAEE7]/20 md:w-64 shrink-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[#1E3A5F] font-bold text-lg mb-2">
                    <Calendar className="w-5 h-5 text-[#6FAEE7]" /> 
                    {new Date(appt.datetime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-[#1E3A5F]/60 text-sm font-semibold mb-4">
                    <Clock className="w-4 h-4" /> 
                    {new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </div>
                </div>

                {/* Right Side: Clinical Notes & Prescriptions */}
                <div className="p-6 flex-1 space-y-6">
                  
                  {/* Notes */}
                  <div>
                    <h4 className="text-xs font-bold text-[#1E3A5F]/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Clinical Findings
                    </h4>
                    <p className="text-[#1E3A5F]/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {appt.clinicalNotes || "No detailed clinical notes were written for this session."}
                    </p>
                  </div>

                  {/* Prescription Block */}
                  {appt.prescription && (
                    <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl">
                      <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Pill className="w-4 h-4" /> E-Prescription Issued
                      </h4>
                      <p className="text-green-900 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {appt.prescription}
                      </p>
                    </div>
                  )}

                  {/* Original Reason */}
                  {appt.reason && (
                    <div className="text-xs text-[#1E3A5F]/40 pt-4 border-t border-[#6FAEE7]/10 flex items-start gap-1">
                      <span className="font-bold shrink-0">Original Booking Reason:</span>
                      <span className="italic">{appt.reason}</span>
                    </div>
                  )}
                </div>

              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}