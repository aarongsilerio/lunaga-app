import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";
import { LunaWidget } from "@/components/chat/luna-widget";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PatientInfoCard } from "@/components/dashboard/patient-info-card";

export default async function PatientDashboard() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 2. Update the query to include the medical record relation
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      patientProfile: {
        include: {
          medicalRecord: true, // <-- NEW: Fetch the sensitive EMR data
          appointments: {
            where: { status: "SCHEDULED" },
            orderBy: { datetime: "asc" },
            take: 1, 
            include: { doctor: { include: { user: true } } },
          },
        },
      },
    },
  });

  const patientProfile = dbUser?.patientProfile;
  const nextAppointment = patientProfile?.appointments[0];

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E3A5F]">
          Good day, {user.firstName || "there"}.
        </h1>
        <p className="text-[#1E3A5F]/70 mt-2">
          Welcome to your calm space for healthcare. How are you feeling today?
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <LunaWidget />
        {/* Up Next Card */}
        <Card className="col-span-1 lg:col-span-2 border-none bg-white shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E3A5F] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8ED8C3]" />
              Up Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#F7FAFC] rounded-xl border border-[#6FAEE7]/20">
                <div className="space-y-1">
                  <p className="font-semibold text-[#1E3A5F] text-lg">
                    Consultation with {nextAppointment.doctor.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#1E3A5F]/70">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(nextAppointment.datetime).toLocaleDateString("en-US", {
                        weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>
                <Link href={`/lunaroom/${nextAppointment.id}`}>
                  <Button className="mt-4 md:mt-0 w-full md:w-auto rounded-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white shadow-md">
                    <Video className="w-4 h-4 mr-2" />
                    Enter LunaRoom
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#F7FAFC] rounded-xl border border-[#6FAEE7]/10">
                <p className="text-[#1E3A5F]/60">You have no upcoming consultations.</p>
                <Link href="/patient/doctors">
                  <Button variant="outline" className="mt-4 rounded-full border-[#6FAEE7]/30 text-[#1E3A5F] hover:bg-[#6FAEE7]/10">
                    Find a Doctor
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="col-span-1 border-none bg-white shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E3A5F]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/patient/lunamatch" className="block w-full">
              <Button variant="ghost" className="w-full justify-start text-left h-12 rounded-xl hover:bg-[#6FAEE7]/10 text-[#1E3A5F]">
                Start LunaMatch
              </Button>
            </Link>
            <Link href="/patient/care-timeline" className="block w-full">
              <Button variant="ghost" className="w-full justify-start text-left h-12 rounded-xl hover:bg-[#6FAEE7]/10 text-[#1E3A5F]">
                View Care Timeline
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 3. NEW: Confidential Patient Info Profile injected below */}
        {patientProfile && (
          <div className="col-span-1 lg:col-span-3 mt-4">
            <PatientInfoCard profile={patientProfile} />
          </div>
        )}
      </div>
      
    </div>
  );
}