"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateDoctorProfile(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // FIX 1: Extract the new Identity and Honorific fields instead of the single "name"
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const title = formData.get("title") as string;
    const extension = formData.get("extension") as string;
    
    // Extract Standard Fields
    const gender = formData.get("gender") as string;
    const specialization = formData.get("specialization") as string;
    const bio = formData.get("bio") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const roomNumber = formData.get("roomNumber") as string;
    const clinicHours = formData.get("clinicHours") as string;
    const clinicDays = formData.getAll("clinicDays") as string[];

    // 2. Parse Comma-Separated Arrays
    const parseArray = (key: string) => {
      const val = formData.get(key) as string;
      return val ? val.split(",").map(s => s.trim()).filter(Boolean) : [];
    };
    const subSpecializations = parseArray("subSpecializations");
    const hmoAccreditations = parseArray("hmoAccreditations");

    // FIX 2: Update validation to check for first and last name
    if (!firstName || !lastName || !specialization) {
      return { error: "First Name, Last Name, and Primary Specialization are required." };
    }
    if (clinicDays.length === 0) {
      return { error: "You must select at least one available clinic day." };
    }

    // 3. Handle Profile Picture Upload (Syncing with Clerk)
    const file = formData.get("profileImage") as File | null;
    let profilePictureUrl: string | undefined = undefined;

    if (file && file.size > 0) {
      // 5MB limit check
      if (file.size > 5 * 1024 * 1024) {
        return { error: "Profile image must be less than 5MB." };
      }
      
      try {
        const client = await clerkClient();
        // Upload the file to Clerk. This instantly updates the <UserButton />
        const updatedClerkUser = await client.users.updateUserProfileImage(user.id, {
          file: file,
        });
        profilePictureUrl = updatedClerkUser.imageUrl;
      } catch (uploadError) {
        console.error("[CLERK_IMAGE_UPLOAD_ERROR]:", uploadError);
        return { error: "Failed to upload image to authentication server." };
      }
    }

    // FIX 3: Dual Database Update Strategy (Single Source of Truth)
    
    // Update A: The Global User Identity
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
      }
    });

    // Update B: The Professional Profile
    await prisma.doctorProfile.update({
      where: { userId: user.id },
      data: {
        title,
        extension,
        gender,
        specialization,
        subSpecializations,
        bio,
        hmoAccreditations,
        phoneNumber,
        roomNumber,
        clinicDays,
        clinicHours,
      }
    });

    revalidatePath("/doctor/settings");
    revalidatePath("/doctor/dashboard");
    // Also revalidate the patient's viewing directory so they see the new image instantly
    revalidatePath("/patient/doctors"); 
    
    return { success: true };

  } catch (error: any) {
    console.error("[DOCTOR_PROFILE_UPDATE_ERROR]:", error);
    return { error: "An unexpected error occurred while saving your profile." };
  }
}