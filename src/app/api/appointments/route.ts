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
    // FIX 1: Include the User model for the patient so we can access firstName and lastName
    const appointment = await prisma.appointment.create({
      data: { doctorId, patientId, datetime: new Date(date), reason },
      include: { 
        patient: { include: { user: true } }, 
        doctor: { include: { user: true } } 
      }
    });

    // FIX 2: Safely construct the patient's full name from the User relation
    const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;

    // 2. Create a persistent notification for the Doctor
    // FIX 3: Use the properly constructed patientName variable
    const notification = await prisma.notification.create({
      data: {
        userId: appointment.doctor.userId,
        title: "New Appointment Request",
        message: `${patientName} booked a consultation on ${appointment.datetime.toLocaleDateString()} at ${timeSlot}.`,
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