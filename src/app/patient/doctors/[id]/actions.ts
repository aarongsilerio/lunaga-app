"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bookAppointment(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const doctorId = parseInt(formData.get("doctorId") as string);
    const datetimeStr = formData.get("datetime") as string;
    const notes = formData.get("notes") as string;
    
    // NEW: Check if the patient proposed a custom time
    const isProposed = formData.get("isProposed") === "true";

    if (!doctorId || !datetimeStr) {
      return { success: false, message: "Missing required fields." };
    }

    const datetime = new Date(datetimeStr);

    // Ensure the user has a patient profile
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { patientProfile: true }
    });

    if (!dbUser?.patientProfile) {
      return { success: false, message: "Patient profile not found. Please complete onboarding." };
    }

    // Determine initial status
    const initialStatus = isProposed ? "PROPOSED" : "SCHEDULED";

    // Create the appointment
    await prisma.appointment.create({
      data: {
        patientId: dbUser.patientProfile.id,
        doctorId: doctorId,
        datetime: datetime,
        reason: notes || null,
        status: initialStatus,
      }
    });

    revalidatePath("/patient/dashboard");
    revalidatePath(`/doctor/dashboard`);

    return { success: true, message: "Appointment submitted successfully." };
  } catch (error) {
    console.error("[Booking Error]:", error);
    return { success: false, message: "Failed to secure appointment. Please try again." };
  }
}