import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; 
import { DoctorDirectory } from "@/components/discovery/doctor-directory";

// Extend the Prisma payload type to officially support our merged Identity fields
// This ensures your DoctorDirectory client component doesn't throw TypeScript errors!
export type DoctorWithUser = Prisma.DoctorProfileGetPayload<{
  include: { user: true };
}> & {
  name: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
};

export default async function DoctorDiscoveryPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let formattedDoctors: DoctorWithUser[] = [];
  
  try {
    const rawDoctors = await prisma.doctorProfile.findMany({
      where: {
        user: {
          isApproved: true,
          role: "DOCTOR", 
        },
      },
      include: {
        user: true, 
      },
      orderBy: {
        rating: "desc", 
      },
    });

    // Intercept the raw database data and dynamically generate the 'name' field
    formattedDoctors = rawDoctors.map((doc) => ({
      ...doc,
      name: `${doc.title || ""} ${doc.user?.firstName || ""} ${doc.user?.lastName || ""}${doc.extension ? `, ${doc.extension}` : ""}`.trim(),
      firstName: doc.user?.firstName || null,
      lastName: doc.user?.lastName || null,
      profilePicture: doc.user?.profilePicture || null,
    }));

  } catch (error) {
    console.error("[Doctor Fetch Error]:", error);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1E3A5F] via-[#2A528A] to-[#1E3A5F] p-8 md:p-12 shadow-lg">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4">
          <div className="h-64 w-64 rounded-full bg-[#6FAEE7] opacity-20 blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
          <div className="h-48 w-48 rounded-full bg-[#8ED8C3] opacity-10 blur-2xl"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Find the right care, <br className="hidden md:block"/> right now.
          </h1>
          <p className="text-lg text-[#F7FAFC]/90 font-medium leading-relaxed max-w-lg">
            Search by name, specialization, or describe your symptoms. Our directory connects you with highly-rated professionals tailored to your needs.
          </p>
        </div>
      </div>

      {/* Directory Component */}
      <DoctorDirectory initialDoctors={formattedDoctors} />
    </div>
  );
}