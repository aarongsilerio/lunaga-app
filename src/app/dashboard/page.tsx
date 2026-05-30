import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardRouter() {
  // 1. Check if the user is authenticated with Clerk
  const { userId } = await auth();

  // If not logged in, send them to the sign-in page
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Fetch their role from PostgreSQL
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // 3. If they don't exist in Prisma yet, send them to the default Patient Onboarding
  if (!dbUser) {
    redirect("/onboarding/patient");
  }

  // 4. Traffic Control Logic
  if (dbUser.role === "DOCTOR") {
    redirect("/doctor/dashboard");
  }

  // Default fallback for PATIENT
  redirect("/patient/dashboard");
}