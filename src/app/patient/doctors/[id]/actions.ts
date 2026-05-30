"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bookAppointment(formData: FormData) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Unauthorized");

    // 1. Extract and validate form data
    const doctorId = parseInt(formData.get("doctorId") as string);
    const datetimeStr = formData.get("datetime") as string;
    const notes = formData.get("notes") as string;

    if (!doctorId || !datetimeStr) throw new Error("Missing required appointment details.");

    // 2. Securely identify the booking patient
    const dbUser = await prisma.user.findUnique({
      where: { id: clerkUser.id },
      include: { patientProfile: true },
    });

    if (!dbUser?.patientProfile) throw new Error("Patient profile not found. Please complete onboarding.");

    const appointmentDate = new Date(datetimeStr);

    // Assemble the patient's name from the global User table
    const patientFullName = `${dbUser.firstName || "Unknown"} ${dbUser.lastName || ""}`.trim();

    // 3. ENTERPRISE FAILSAFE: Race Condition & Double-Booking Check
    // Checks if the doctor already has a scheduled appointment at this exact minute.
    const existingBooking = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        datetime: appointmentDate,
        status: "SCHEDULED", // If an old appointment was CANCELLED, the slot is free!
      },
    });

    if (existingBooking) {
      throw new Error("This time slot was just booked by someone else. Please select another time.");
    }

    // 4. Create the Appointment
    await prisma.appointment.create({
      data: {
        patientId: dbUser.patientProfile.id,
        doctorId: doctorId,
        datetime: appointmentDate, 
        status: "SCHEDULED",
        reason: notes || null, 
      }
    });

    // 5. Generate Real-Time Notification for the Doctor
    const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    if (doctor) {
      await prisma.notification.create({
        data: {
          userId: doctor.userId,
          // Use the assembled patientFullName variable instead of dbUser.patientProfile.name
          message: `New appointment scheduled with ${patientFullName} on ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`,
          isRead: false,
          title: "New Appointment Scheduled",
          type: "BOOKING"
        },
      });
    }

    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/care-timeline");
    revalidatePath(`/patient/doctors/${doctorId}`); // Refresh the doctor's availability

    return { success: true, message: "Appointment successfully confirmed!" };
  } catch (error) {
    console.error("[Booking Error]:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to book appointment." };
  }
}