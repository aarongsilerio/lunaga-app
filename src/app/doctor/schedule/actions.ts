"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher"; 

// ============================================================================
// 1. UPDATE AVAILABILITY MATRIX
// ============================================================================
export async function updateAvailability(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { doctorProfile: true }
    });

    if (!dbUser?.doctorProfile) {
      return { error: "Doctor profile not found." };
    }

    const clinicDays = formData.getAll("clinicDays") as string[];
    const availabilityStr = formData.getAll("availability") as string[];
    const availability = availabilityStr.map(Number); 

    await prisma.doctorProfile.update({
      where: { id: dbUser.doctorProfile.id },
      data: {
        clinicDays,
        availability,
      }
    });

    revalidatePath("/doctor/schedule");
    revalidatePath("/patient/doctors"); 
    
    return { success: true };
  } catch (error) {
    console.error("[Update Availability Error]:", error);
    return { error: "Failed to save availability matrix." };
  }
}

// ============================================================================
// 2. MANAGE INDIVIDUAL APPOINTMENTS
// ============================================================================
export async function manageAppointment(
  appointmentId: string,
  action: "CANCELLED" | "RESCHEDULED" | "ACCEPTED" | "REJECTED",
  newDatetime?: string
) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } }
      }
    });

    if (!appointment || appointment.doctor.user.id !== user.id) {
      return { success: false, message: "Appointment not found or unauthorized." };
    }

    let updatedDatetime = appointment.datetime;
    
    // Map ACCEPTED to the database's SCHEDULED state
    let dbStatus: any = action;
    if (action === "ACCEPTED") dbStatus = "SCHEDULED";

    if (action === "RESCHEDULED") {
      if (!newDatetime) return { success: false, message: "New date and time required." };
      const parsedDate = new Date(newDatetime);
      if (parsedDate < new Date()) {
        return { success: false, message: "Cannot reschedule to a past date." };
      }
      updatedDatetime = parsedDate;
    }

    // Update the Database
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: dbStatus,
        datetime: updatedDatetime,
      }
    });

    // REAL-TIME NOTIFICATION: Alert the Patient
    if (appointment.patient.user.id) {
      const doctorLastName = appointment.doctor.user.lastName || "your doctor";
      
      let notificationTitle = "";
      let notificationMessage = "";

      if (action === "CANCELLED") {
        notificationTitle = "Appointment Cancelled";
        notificationMessage = `Dr. ${doctorLastName} has cancelled your upcoming appointment.`;
      } else if (action === "RESCHEDULED") {
        notificationTitle = "Appointment Rescheduled";
        notificationMessage = `Dr. ${doctorLastName} proposed a new time: ${updatedDatetime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.`;
      } else if (action === "ACCEPTED") {
        notificationTitle = "Proposal Accepted";
        notificationMessage = `Dr. ${doctorLastName} has accepted your proposed appointment time!`;
      } else if (action === "REJECTED") {
        notificationTitle = "Proposal Declined";
        notificationMessage = `Dr. ${doctorLastName} was unable to accommodate your proposed time.`;
      }

      await pusherServer.trigger(
        `user-${appointment.patient.user.id}`,
        "new-notification",
        {
          id: Date.now().toString(),
          title: notificationTitle,
          message: notificationMessage,
        }
      ).catch(err => console.error("[Pusher Error]:", err)); 
    }

    revalidatePath("/doctor/dashboard");
    revalidatePath("/doctor/schedule");
    revalidatePath("/patient/dashboard");

    return { 
      success: true, 
      message: `Appointment ${action.toLowerCase()} successfully.` 
    };
  } catch (error) {
    console.error("[Manage Appointment Error]:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}