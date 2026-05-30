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

  const rawAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: dbUser.doctorProfile.id,
      datetime: { gte: today }, // Ignore deeply past appointments for this view
    },
    // FIX 1: Fetch the global user data instead of the deleted patient name field
    include: {
      patient: {
        include: { user: true }
      }
    },
    orderBy: {
      datetime: "asc" // Closest appointments at the top
    },
  });

  // FIX 2: Intercept the data and map the first/last name back into a 'name' property
  // This ensures your ScheduleClient component doesn't break!
  const formattedAppointments = rawAppointments.map((appt) => ({
    ...appt,
    patient: {
      ...appt.patient,
      name: `${appt.patient.user?.firstName || "Unknown"} ${appt.patient.user?.lastName || ""}`.trim()
    }
  }));

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <ScheduleClient 
        userId={user.id} 
        /* FIX 3: Pass the newly mapped array to the client */
        appointments={formattedAppointments} 
        profile={{
          clinicDays: dbUser.doctorProfile.clinicDays,
          availability: dbUser.doctorProfile.availability
        }}
      />
    </div>
  );
}