import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileSettingsForm } from "@/components/doctor/ProfileSettingsForm";

export default async function DoctorSettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Fetch the existing Doctor Profile from PostgreSQL
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { doctorProfile: true }
  });

  if (!dbUser || !dbUser.doctorProfile) {
    redirect("/onboarding/doctor");
  }

  const mergedProfileData = {
    ...dbUser.doctorProfile,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    profilePicture: dbUser.profilePicture,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E3A5F]">Profile Settings</h1>
        <p className="text-[#1E3A5F]/70 font-medium mt-1">
          Manage your credentials, biography, and platform availability.
        </p>
      </div>

      {/* Profile Form Component */}
      <ProfileSettingsForm profile={mergedProfileData as any} />

    </div>
  );
}