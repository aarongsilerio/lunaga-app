"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function createDoctorProfile(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const title = formData.get("title") as string;
    const extension = formData.get("extension") as string;
    const gender = formData.get("gender") as string;

    // Extract standard data from form
    const specialization = formData.get("specialization") as string;
    const bio = formData.get("bio") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const roomNumber = formData.get("roomNumber") as string;
    
    // Extract clinic days (array of checked boxes)
    const clinicDays = formData.getAll("clinicDays") as string[];

    if (!firstName || !lastName || !specialization || clinicDays.length === 0) {
      return { error: "First Name, Last Name, Specialization, and at least one Clinic Day are required." };
    }

    // (Upsert ensures it creates the user if a Clerk webhook hasn't fired yet)
    await prisma.user.upsert({
      where: { id: user.id },
      update: { 
        role: "DOCTOR",
        firstName,
        lastName
      },
      create: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        role: "DOCTOR",
        firstName,
        lastName,
        isApproved: false, // Security: Must be approved by Admin later
      }
    });

    // FIX 4: Create the Doctor Profile with the professional formatting (no 'name' field)
    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        title,
        extension,
        gender,
        specialization,
        bio,
        phoneNumber,
        roomNumber,
        clinicDays,
        // Set default availability hours (e.g., 9AM, 10AM, 1PM, 2PM) 
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