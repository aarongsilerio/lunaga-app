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
      datetime: { gte: today }, // Ignore deeply past appointments for this view
    },
    include: {
      patient: {
        select: { name: true }
      }
    },
    orderBy: {
      datetime: "asc" // Closest appointments at the top
    },
  });

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <ScheduleClient 
        userId={user.id} 
        appointments={appointments} 
        profile={{
          clinicDays: dbUser.doctorProfile.clinicDays,
          availability: dbUser.doctorProfile.availability
        }}
      />
    </div>
  );
}