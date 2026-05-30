import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShieldAlert } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { DoctorNav } from "@/components/navigation/doctor-nav";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Require Authentication
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 2. Fetch User and Doctor Profile
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { doctorProfile: true },
  });

  // 3. Routing Rules
  if (!dbUser || !dbUser.doctorProfile) {
    redirect("/onboarding/doctor");
  }

  if (dbUser.role === "PATIENT") {
    redirect("/patient/dashboard"); 
  }

  // 4. THE APPROVAL GATE
  if (!dbUser.isApproved) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-4">
        <div className="absolute top-6 right-6"><UserButton /></div>
        <div className="max-w-md text-center space-y-4 p-8 bg-white rounded-3xl shadow-lg border border-[#6FAEE7]/20">
          <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Account Under Review</h1>
          <p className="text-[#1E3A5F]/70 leading-relaxed pb-4">
            Thank you for registering with Lunága. Your credentials and medical license are currently being verified by our administrative team.
          </p>
          <p className="text-sm font-semibold text-[#6FAEE7] bg-[#F7FAFC] p-3 rounded-xl border border-[#6FAEE7]/10">
            You will receive an email once your account is activated.
          </p>
        </div>
      </div>
    );
  }

  // 5. Render standard Doctor Portal (Once Approved)
  return (
    <div className="flex min-h-screen w-full bg-[#F7FAFC] font-sans text-[#1E3A5F]">
      
      {/* Client Component handling Desktop Sidebar & Mobile Drawer */}
      <DoctorNav />

      {/* Main Content Area - Shifted on desktop to accommodate the fixed sidebar */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 animate-in fade-in duration-500">
        {children}
      </main>
      
    </div>
  );
}