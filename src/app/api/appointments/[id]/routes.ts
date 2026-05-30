import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { status, newDate, newTimeSlot } = await req.json(); // status: CANCELLED or RESCHEDULED

    // 1. Update Appointment
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { 
        status, 
        ...(newDate && { date: new Date(newDate) }),
        ...(newTimeSlot && { timeSlot: newTimeSlot })
      },
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } }
    });

    // 2. Determine who triggered this to notify the OTHER person
    const isDoctor = user.id === appointment.doctor.userId;
    const notifyUserId = isDoctor ? appointment.patient.userId : appointment.doctor.userId;
    const triggererName = isDoctor ? `Dr. ${appointment.doctor.name}` : appointment.patient.name;

    const title = status === "CANCELLED" ? "Appointment Cancelled" : "Appointment Rescheduled";
    const message = status === "CANCELLED" 
      ? `${triggererName} cancelled the appointment on ${appointment.datetime.toLocaleDateString()}.`
      : `${triggererName} rescheduled the appointment to ${newDate} at ${newTimeSlot}.`;

    // 3. Save Notification & Trigger Real-Time Push
    const notification = await prisma.notification.create({
      data: { userId: notifyUserId, title, message, type: status }
    });

    await pusherServer.trigger(`user-${notifyUserId}`, "new-notification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
    });

    return NextResponse.json({ success: true, appointment });

  } catch (error) {
    console.error("[APPOINTMENT_UPDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}