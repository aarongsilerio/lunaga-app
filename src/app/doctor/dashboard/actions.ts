"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function reviewProposedAppointment(
  appointmentId: string, 
  action: "ACCEPT" | "REJECT" | "RESCHEDULE", 
  newDatetime?: string
) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // Find the appointment to ensure it exists and belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: { include: { user: true } } }
    });

    if (!appointment || appointment.doctor.user.id !== user.id) {
      return { success: false, message: "Appointment not found or unauthorized." };
    }

    let updatedStatus: any = "SCHEDULED";
    let updatedDatetime = appointment.datetime;

    // Process the Doctor's decision
    if (action === "ACCEPT") {
      updatedStatus = "SCHEDULED";
    } else if (action === "REJECT") {
      updatedStatus = "REJECTED";
    } else if (action === "RESCHEDULE") {
      if (!newDatetime) return { success: false, message: "New date and time required." };
      updatedStatus = "RESCHEDULED";
      updatedDatetime = new Date(newDatetime);
    }

    // Update the database
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: updatedStatus,
        datetime: updatedDatetime,
      }
    });

    // Refresh the dashboards for both users
    revalidatePath("/doctor/dashboard");
    revalidatePath("/patient/dashboard");

    return { 
      success: true, 
      message: `Appointment ${action.toLowerCase()} successfully.` 
    };
  } catch (error) {
    console.error("[Review Proposal Error]:", error);
    return { success: false, message: "Failed to update appointment. Please try again." };
  }
}