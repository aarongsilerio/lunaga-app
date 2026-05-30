"use server";

import { currentUser } from "@clerk/nextjs/server"; 
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePatientProfile(formData: FormData) {
  try {
    // 1. Authenticate and get the full user object
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Unauthorized");

    const userId = clerkUser.id;
    const email = clerkUser.emailAddresses[0]?.emailAddress || "unknown@lunaga.ph";

    // 2. ENTERPRISE FAILSAFE 2.0: Self-Heal Orphaned Accounts
    let dbUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!dbUser) {
      // Check if the email already exists under an old/deleted Clerk ID
      const existingEmailUser = await prisma.user.findUnique({ where: { email } });
      
      if (existingEmailUser) {
        // Self-Heal: Update the old database row to use the new Clerk ID
        dbUser = await prisma.user.update({
          where: { email },
          data: { id: userId }
        });
        console.log(`[Failsafe] Re-linked orphaned email ${email} to new Clerk ID: ${userId}`);
      } else {
        // Standard missing user creation
        dbUser = await prisma.user.create({
          data: {
            id: userId,
            email: email,
            role: "PATIENT",
          },
        });
        console.log(`[Failsafe] Created missing database User for Clerk ID: ${userId}`);
      }
    }

    const profilePictureFile = formData.get("profilePicture") as File | null;
    let profilePictureStr: string | undefined = undefined;

    if (profilePictureFile && profilePictureFile.size > 0) {
      // Security/Performance constraint: Max 2MB file limit
      if (profilePictureFile.size > 2 * 1024 * 1024) {
        return { success: false, message: "Profile picture must be less than 2MB." };
      }
      
      const arrayBuffer = await profilePictureFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Convert to standard Data URL for immediate browser rendering
      profilePictureStr = `data:${profilePictureFile.type};base64,${buffer.toString("base64")}`;
    }

    // Extract firstName and lastName instead of the unified 'name'
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    // 3. Extract standard profile data
    const birthdayStr = formData.get("birthday") as string;
    const sex = formData.get("sex") as string;
    const contactNumber = formData.get("contactNumber") as string;
    const address = formData.get("address") as string;
    const occupation = formData.get("occupation") as string;

    const weight = parseFloat(formData.get("weight") as string) || null;
    const height = parseFloat(formData.get("height") as string) || null;
    const bloodType = formData.get("bloodType") as string;
    const allergies = formData.get("allergies") as string;
    const ongoingConcerns = formData.get("ongoingConcerns") as string;
    
    const pastMedicalHistoryStr = formData.get("pastMedicalHistory") as string;
    const pastMedicalHistory = pastMedicalHistoryStr 
      ? pastMedicalHistoryStr.split(",").map((s) => s.trim()) 
      : [];

    // Update the global User identity first
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        ...(profilePictureStr && { profilePicture: profilePictureStr }),
      }
    });

    // UPSERT Patient Profile without the deleted identity fields
    const patientProfile = await prisma.patientProfile.upsert({
      where: { userId: userId },
      update: {
        birthday: birthdayStr ? new Date(birthdayStr) : new Date(),
        sex,
        contactNumber,
        address,
        occupation,
      },
      create: {
        user: { connect: { id: userId } }, // <-- PRISMA FIX: Explicitly connect the user relation
        birthday: birthdayStr ? new Date(birthdayStr) : new Date(),
        sex,
        contactNumber,
        address,
        occupation,
      },
    });

    // 6. UPSERT Medical Record (EMR)
    await prisma.medicalRecord.upsert({
      where: { patientProfileId: patientProfile.id },
      update: {
        weight,
        height,
        bloodType,
        allergies,
        ongoingConcerns,
        pastMedicalHistory,
      },
      create: {
        patientProfile: { connect: { id: patientProfile.id } }, 
        weight,
        height,
        bloodType,
        allergies,
        ongoingConcerns,
        pastMedicalHistory,
      },
    });

    // 7. Purge Next.js cache so the dashboard reflects changes instantly
    revalidatePath("/patient/dashboard");
    revalidatePath("/patient/profile");

    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile. Please try again." };
  }
}