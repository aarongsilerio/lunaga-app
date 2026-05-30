import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { doctorId, patientId, date, timeSlot, reason } = body;

    // 1. Create the Appointment
    const appointment = await prisma.appointment.create({
      data: { doctorId, patientId, datetime: new Date(date), reason },
      include: { patient: true, doctor: { include: { user: true } } }
    });

    // 2. Create a persistent notification for the Doctor
    const notification = await prisma.notification.create({
      data: {
        userId: appointment.doctor.userId,
        title: "New Appointment Request",
        message: `${appointment.patient.name} booked a consultation on ${appointment.datetime.toLocaleDateString()} at ${timeSlot}.`,
        type: "BOOKING"
      }
    });

    // 3. Trigger Real-Time Push Notification
    // We broadcast to a channel named after the Doctor's User ID
    await pusherServer.trigger(
      `user-${appointment.doctor.userId}`,
      "new-notification",
      {
        id: notification.id,
        title: notification.title,
        message: notification.message,
      }
    );

    return NextResponse.json({ success: true, appointment });

  } catch (error) {
    console.error("[APPOINTMENT_CREATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}