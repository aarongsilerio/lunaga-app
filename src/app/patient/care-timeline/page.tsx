import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CareTimelineClient } from "@/components/timeline/CareTimelineClient";
import { HeartPulse } from "lucide-react";

export default async function CareTimelinePage() {
  // 1. Enforce Authentication Guardrail
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 2. Fetch User along with profiles and EMR Medical Records
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      patientProfile: {
        include: {
          medicalRecord: true,
        },
      },
    },
  });

  if (!dbUser || !dbUser.patientProfile) {
    redirect("/onboarding");
  }

  // 3. Aggregate all appointments linked to the patient ID
  const rawAppointments = await prisma.appointment.findMany({
    where: {
      patientId: dbUser.patientProfile.id,
    },
    // Update the select block to pull the separated identity fields
    include: {
      doctor: {
        select: {
          id: true,
          title: true,
          extension: true,
          specialization: true,
          clinicDays: true,
          availability: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        },
      },
    },
    orderBy: {
      datetime: "desc",
    },
  });

  // Data Transformer - Stitch the doctor's name back together so the client component doesn't break
  const appointments = rawAppointments.map((appt) => ({
    ...appt,
    doctor: {
      ...appt.doctor,
      name: `${appt.doctor.title || ""} ${appt.doctor.user?.firstName || ""} ${appt.doctor.user?.lastName || ""}${appt.doctor.extension ? `, ${appt.doctor.extension}` : ""}`.trim()
    }
  }));

  // 4. Clean sorting arrays based on systemic lifecycle states
  const upcomingAppointments = appointments.filter((appt) =>
    appt.status === "SCHEDULED" || 
    appt.status === "PENDING" || 
    appt.status === "RESCHEDULED"
  );

  const pastAppointments = appointments.filter((appt) =>
    appt.status === "COMPLETED" || 
    appt.status === "CANCELLED"
  );

  // 5. Safely pull ongoing concerns from EMR block to fulfill condition criteria
  const ongoingConcerns = dbUser.patientProfile.medicalRecord?.ongoingConcerns || null;

  return (
    <div className="max-w-full mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Section Page Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#1E3A5F] rounded-xl text-white shadow-sm">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Care Timeline</h1>
          <p className="text-sm text-[#1E3A5F]/60">Track upcoming digital triage sessions, cancel bookings, and review professional notes.</p>
        </div>
      </div>

      {/* Hydrate Interactive Components Layer */}
      <CareTimelineClient
        upcomingAppointments={upcomingAppointments}
        pastAppointments={pastAppointments}
        ongoingConcerns={ongoingConcerns}
      />

    </div>
  );
}