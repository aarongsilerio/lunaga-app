"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createDoctorProfile(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Extract data from form
    const name = formData.get("name") as string;
    const specialization = formData.get("specialization") as string;
    const bio = formData.get("bio") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const roomNumber = formData.get("roomNumber") as string;
    
    // Extract clinic days (array of checked boxes)
    const clinicDays = formData.getAll("clinicDays") as string[];

    if (!name || !specialization || clinicDays.length === 0) {
      return { error: "Name, Specialization, and at least one Clinic Day are required." };
    }

    // 1. Upsert the base User record and set role to DOCTOR
    // (Upsert ensures it creates the user if a Clerk webhook hasn't fired yet)
    await prisma.user.upsert({
      where: { id: user.id },
      update: { role: "DOCTOR" },
      create: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        role: "DOCTOR",
        isApproved: false, // Security: Must be approved by Admin later
      }
    });

    // 2. Create the Doctor Profile
    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        name,
        specialization,
        bio,
        phoneNumber,
        roomNumber,
        clinicDays,
        // Set default availability hours (e.g., 9AM, 10AM, 1PM, 2PM) 
        // In a real app, you'd add a UI for this, but we'll default it for now.
        availability: [9.0, 10.0, 13.0, 14.0],
      }
    });

    return { success: true };

  } catch (error: any) {
    console.error("[DOCTOR_ONBOARDING_ERROR]:", error);
    
    // Check if it's a Prisma Unique Constraint Error
    if (error.code === 'P2002') {
      // Check exactly which field caused the conflict
      const target = error.meta?.target as string[];
      
      if (target?.includes('email')) {
        return { error: "This email is already registered to another account. Please contact support." };
      }
      
      return { error: "A profile already exists for this account." };
    }
    
    return { error: "Failed to create profile. Please try again." };
  }
}