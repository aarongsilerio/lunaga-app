import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;

    // DEBUG LOG 1: If you don't see this in your terminal, your folder structure is wrong!
    console.warn(`\n[LunaMatch API] -> PATCH request hit for Appointment ID: ${id}`);

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { status, newDatetime } = body; 

    // Validate existence and ownership
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true }
    });

    if (!existingAppointment) {
      // DEBUG LOG 2: If you see this, the file path is correct but the DB is empty
      console.error(`[LunaMatch API] -> Error: Appointment ${id} not found in database.`);
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Prepare update payload
    const updateData: any = { status };
    if (newDatetime) {
      updateData.datetime = new Date(newDatetime);
    }

    // Include the `user` relation for the patient to access firstName/lastName
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: { 
        patient: { include: { user: true } }, 
        doctor: { include: { user: true } } 
      }
    });

    const title = status === "CANCELLED" ? "Consultation Cancelled" : "Consultation Rescheduled";
    
    // Safely extract the patient's name from the included User table
    const patientName = `${updatedAppointment.patient.user.firstName} ${updatedAppointment.patient.user.lastName}`;

    const message = status === "CANCELLED"
      ? `${patientName} cancelled the appointment scheduled for ${new Date(updatedAppointment.datetime).toLocaleDateString()}.`
      : `${patientName} rescheduled the appointment to ${new Date(updatedAppointment.datetime).toLocaleString()}.`;

    const notification = await prisma.notification.create({
      data: {
        userId: updatedAppointment.doctor.userId,
        title,
        message,
        type: status,
      }
    });

    await pusherServer.trigger(`user-${updatedAppointment.doctor.userId}`, "new-notification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
    });

    console.warn(`[LunaMatch API] -> Success! Appointment ${id} updated to ${status}.`);
    return NextResponse.json({ success: true, appointment: updatedAppointment });

  } catch (error) {
    console.error("[APPOINTMENT_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}