import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PatientProfileForm } from "@/components/profile/patient-profile-form";

export default async function PatientProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Fetch existing data (if any) to pre-fill the form
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }, // Using the id mapping we established earlier
    include: {
      patientProfile: {
        include: {
          medicalRecord: true,
        },
      },
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Your Settings</h1>
        <p className="text-[#1E3A5F]/70 mt-2">
          Keep your medical records updated for the best care experience.
        </p>
      </div>

      <PatientProfileForm initialData={dbUser} />
    </div>
  );
}