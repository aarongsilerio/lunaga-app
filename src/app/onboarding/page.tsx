import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PatientOnboardingForm } from "@/components/onboarding/patient-onboarding-form";
import Image from "next/image";
import { LegalFooter } from "@/components/legal/LegalFooter";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 1. Check if they already have a profile. If yes, send them straight to the dashboard!
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { patientProfile: true },
  });

  // If the profile exists and has a name, they've already onboarded.
  if (dbUser?.patientProfile?.name) {
    redirect("/patient/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Image src="/nav-logo.png" alt="Lunága" width={140} height={40} priority className="mb-4 w-auto h-auto" />
        <h1 className="text-3xl font-bold text-[#1E3A5F] text-center">Welcome to Lunága</h1>
        <p className="text-[#1E3A5F]/70 text-center max-w-md mt-2">
          Let’s set up your secure health profile so LunaMatch can connect you with the right care.
        </p>
      </div>

      {/* The Wizard Component */}
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-700 delay-150">
        <PatientOnboardingForm />
      </div>
      <div className="absolute bottom-0 w-full pb-4">
        <LegalFooter />
      </div>
    </div>
  );
}