import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ScheduleClient } from "@/components/doctor/ScheduleClient";

export default async function DoctorSchedulePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 1. Authenticate & Fetch Profile
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { doctorProfile: true }
  });

  if (!dbUser || !dbUser.doctorProfile) redirect("/onboarding/doctor");

  // 2. Fetch all appointments, starting from today onwards
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: dbUser.doctorProfile.id,
      datetime: { gte: today } // <-- FIX 1: Restored this filter so we don't fetch ancient test data!
    },
    include: {
      patient: {
        include: {
          user: true // Magic line ensures we have access to the identity table
        }
      }
    },
    orderBy: { datetime: 'asc' }
  });

  // FIX 2: The "Double-Fallback" DTO
  // This absolutely guarantees a name will render, even for old test accounts
  const formattedAppointments = appointments.map((appt) => {
    // Extract the raw fields
    const pUser = appt.patient?.user;
    const first = pUser?.firstName || "";
    const last = pUser?.lastName || "";
    
    // Construct the full name, falling back if both are empty strings
    let fullName = `${first} ${last}`.trim();
    if (!fullName) fullName = "Unknown Patient";

    return {
      ...appt,
      patient: {
        ...appt.patient,
        name: fullName, // Satisfies older UI components
        user: {
          ...pUser,
          firstName: first || "Unknown", // Satisfies newer UI components
          lastName: last || "Patient"
        }
      }
    };
  });

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <ScheduleClient 
        userId={user.id} 
        appointments={formattedAppointments} 
        profile={{
          clinicDays: dbUser.doctorProfile.clinicDays,
          availability: dbUser.doctorProfile.availability
        }}
      />
    </div>
  );
}