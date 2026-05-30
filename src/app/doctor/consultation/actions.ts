"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveEMRNotes(appointmentId: string, patientProfileId: number, formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const clinicalNotes = formData.get("clinicalNotes") as string;
    const prescription = formData.get("prescription") as string;
    const ongoingConcerns = formData.get("ongoingConcerns") as string;
    const markCompleted = formData.get("markCompleted") === "on";

    // 1. Update the specific Appointment Record
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        clinicalNotes,
        prescription,
        ...(markCompleted && { status: "COMPLETED" }),
      }
    });

    // 2. Upsert the Patient's Global Medical Record
    await prisma.medicalRecord.upsert({
      where: { patientProfileId: patientProfileId },
      update: { ongoingConcerns },
      create: {
        patientProfileId: patientProfileId,
        ongoingConcerns,
      }
    });

    revalidatePath(`/doctor/consultation/${appointmentId}`);
    revalidatePath("/patient/care-timeline"); // Syncs instantly to patient
    
    return { success: true, completed: markCompleted };

  } catch (error) {
    console.error("[EMR_SAVE_ERROR]:", error);
    return { error: "Failed to save clinical notes." };
  }
}