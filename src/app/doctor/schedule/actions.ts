"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAvailability(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Extract Clinic Days (e.g., ["Monday", "Wednesday"])
    const clinicDays = formData.getAll("clinicDays") as string[];
    
    // 2. Extract Clinic Hours (Floats, e.g., ["9", "9.5", "10"])
    // Convert the string array from FormData back into an array of Floats
    const availabilityStrings = formData.getAll("availability") as string[];
    const availabilityFloats = availabilityStrings
      .map(val => parseFloat(val))
      .filter(val => !isNaN(val))
      .sort((a, b) => a - b);

    if (clinicDays.length === 0) {
      return { error: "You must select at least one available clinic day." };
    }

    if (availabilityFloats.length === 0) {
      return { error: "You must select at least one available time slot." };
    }

    // 3. Update the Doctor Profile
    await prisma.doctorProfile.update({
      where: { userId: user.id },
      data: {
        clinicDays,
        availability: availabilityFloats,
      }
    });

    // 4. Purge the cache so the Schedule page and Patient Booking pages update instantly
    revalidatePath("/doctor/schedule");
    revalidatePath("/patient/doctors");

    return { success: true };

  } catch (error) {
    console.error("[UPDATE_AVAILABILITY_ERROR]:", error);
    return { error: "An unexpected error occurred while saving your availability." };
  }
}