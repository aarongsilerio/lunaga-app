import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PatientNav } from "@/components/navigation/patient-nav";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- SECURITY INTERCEPTOR ---
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { patientProfile: true },
  });

  if (!dbUser?.patientProfile?.name) {
    redirect("/onboarding");
  }
  // --------------------------------

  return (
    <div className="flex min-h-screen w-full bg-[#F7FAFC] font-sans text-[#1E3A5F]">
      
      {/* The Responsive Navigation Client Component */}
      <PatientNav />

      {/* MAIN CONTENT WRAPPER 
        - md:ml-72 prevents content from hiding behind the desktop sidebar
        - pt-28 adds padding on mobile so content isn't hidden behind the new mobile top-bar
      */}
      <main className="flex-1 w-full md:ml-72 pt-28 md:pt-10 px-4 md:px-8 pb-12 overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}