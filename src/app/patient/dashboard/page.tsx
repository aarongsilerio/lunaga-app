import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Video, 
  Sparkles, 
  HeartPulse, 
  Stethoscope, 
  ArrowRight 
} from "lucide-react";
import { LunaWidget } from "@/components/chat/luna-widget";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PatientInfoCard } from "@/components/dashboard/patient-info-card";

export default async function PatientDashboard() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Fetch the patient profile, records, and upcoming appointment
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      patientProfile: {
        include: {
          medicalRecord: true,
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

  // Safely assemble the doctor's formatted name
  const doctorName = nextAppointment 
    ? `${nextAppointment.doctor.title || ""} ${nextAppointment.doctor.user?.firstName || ""} ${nextAppointment.doctor.user?.lastName || ""}${nextAppointment.doctor.extension ? `, ${nextAppointment.doctor.extension}` : ""}`.trim()
    : "";

  /** Merge the global User identity into the patient profile 
   * so the PatientInfoCard component has access to the names and avatar! */
  const mergedPatientProfile = patientProfile ? {
    ...patientProfile,
    name: `${dbUser?.firstName || ""} ${dbUser?.lastName || ""}`.trim(), 
    firstName: dbUser?.firstName,
    lastName: dbUser?.lastName,
    profilePicture: dbUser?.profilePicture,
  } : null;

  // Dynamic Time-based Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* ========================================== */}
      {/* WELCOME HEADER */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] tracking-tight">
            {greeting}, {user.firstName || "there"}.
          </h1>
          <p className="text-[#1E3A5F]/70 mt-2 text-lg font-medium">
            Welcome to your calm space for healthcare. How are you feeling today?
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* MAIN BENTO GRID LAYOUT */}
      {/* ========================================== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* 1. UP NEXT HERO CARD (Spans 2 columns) */}
        <Card className="col-span-1 lg:col-span-2 border-none bg-linear-to-br from-[#1E3A5F] via-[#2A528A] to-[#1E3A5F] shadow-lg rounded-3xl relative overflow-hidden text-white flex flex-col justify-between">
          {/* Decorative ambient blurs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#6FAEE7]/20 rounded-full blur-3xl pointer-events-none translate-y-1/4 -translate-x-1/4" />
          
          <CardHeader className="relative z-10 pb-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8ED8C3]" /> Up Next
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10 pt-6 flex-1 flex flex-col justify-center">
            {nextAppointment ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <h3 className="font-extrabold text-3xl md:text-4xl leading-tight">
                    Consultation with <br/> 
                    {/* Inject the assembled doctorName variable */}
                    <span className="text-[#6FAEE7]">{doctorName}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Calendar className="w-4 h-4 text-[#8ED8C3]" />
                      {new Date(nextAppointment.datetime).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Clock className="w-4 h-4 text-[#8ED8C3]" />
                      {new Date(nextAppointment.datetime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <Link href={`/patient/consultation/${nextAppointment.id}`} className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <Button className="w-full h-14 px-8 rounded-2xl bg-[#F7FAFC] hover:bg-[#b8e3ff] text-[#1E3A5F] font-bold shadow-[0_0_20px_rgba(142,216,195,0.3)] transition-transform hover:scale-105">
                    <Video className="w-5 h-5 mr-2" /> Enter LunaRoom
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-start justify-center h-full space-y-4">
                <div>
                  <h3 className="font-extrabold text-3xl md:text-4xl leading-tight">Your schedule is clear.</h3>
                  <p className="text-white/70 mt-2 text-lg">Take a deep breath and enjoy your day. We're here when you need us.</p>
                </div>
                <Link href="/patient/doctors">
                  <Button className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold backdrop-blur-sm transition-all">
                    <Stethoscope className="w-4 h-4 mr-2" /> Find a Doctor
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. QUICK ACTION TILES (Spans 1 column, stacked) */}
        <div className="col-span-1 flex flex-col gap-4">
          <Link href="/patient/lunamatch" className="flex-1 group">
            <Card className="h-full border-none bg-[#8ED8C3]/10 hover:bg-[#8ED8C3]/20 transition-all duration-300 shadow-sm rounded-3xl p-6 flex items-center gap-4 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-7 h-7 text-[#5ab89d]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E3A5F] text-lg flex items-center gap-2">
                  LunaMatch AI <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-[#1E3A5F]/60 mt-0.5">Symptom-based matching</p>
              </div>
            </Card>
          </Link>

          <Link href="/patient/care-timeline" className="flex-1 group">
            <Card className="h-full border-none bg-[#C6B7FF]/10 hover:bg-[#C6B7FF]/20 transition-all duration-300 shadow-sm rounded-3xl p-6 flex items-center gap-4 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <HeartPulse className="w-7 h-7 text-[#9d86eb]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E3A5F] text-lg flex items-center gap-2">
                  Care Timeline <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-[#1E3A5F]/60 mt-0.5">View medical records</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* 3. LUNA WIDGET (Chat Assistant) */}
        <div className="col-span-1 lg:col-span-1">
          <div className="h-full rounded-3xl overflow-hidden shadow-sm border border-[#6FAEE7]/20">
            <LunaWidget />
          </div>
        </div>

        {/* 4. PATIENT INFO / EMR SUMMARY */}
        {mergedPatientProfile && (
          <div className="col-span-1 lg:col-span-2">
            <div className="h-full rounded-3xl overflow-hidden shadow-sm">
              {/* Pass the merged object down so the component receives the names/avatar */}
              <PatientInfoCard profile={mergedPatientProfile as any} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}