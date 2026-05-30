import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProviderSupportCard } from "@/components/doctor/SupportCard";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Star, 
  Activity, 
  Clock, 
  Video, 
  CheckCircle2,
  AlertCircle,
  ClipboardEdit,
  ArrowRight
} from "lucide-react";

export default async function DoctorDashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 1. Fetch Doctor Profile
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { doctorProfile: true }
  });

  if (!dbUser || !dbUser.doctorProfile) redirect("/onboarding/doctor");
  const profile = dbUser.doctorProfile;

  // 2. Define Time Boundaries
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  // 3. Fetch Data in Parallel for Performance
  const [upcomingAppointments, missingEmrAppointments, totalUniquePatients] = await Promise.all([
    // A. All future and today's appointments
    prisma.appointment.findMany({
      where: {
        doctorId: profile.id,
        status: { in: ["SCHEDULED", "PENDING", "RESCHEDULED"] },
        datetime: { gte: startOfToday } 
      },
      include: { patient: true },
      orderBy: { datetime: "asc" },
      take: 10 
    }),
    
    // B. Action Items: Completed sessions missing clinical notes
    prisma.appointment.findMany({
      where: {
        doctorId: profile.id,
        status: "COMPLETED",
        clinicalNotes: null // Identifying missing EMRs
      },
      include: { patient: true },
      orderBy: { datetime: "desc" },
      take: 3
    }),

    // C. Total unique patients under this doctor's care
    prisma.patientProfile.count({
      where: {
        appointments: { some: { doctorId: profile.id } }
      }
    })
  ]);

  // 4. Organize Schedule Data
  const todayAppointments = upcomingAppointments.filter(appt => new Date(appt.datetime) < endOfToday);
  const futureAppointments = upcomingAppointments.filter(appt => new Date(appt.datetime) >= endOfToday);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E3A5F]">
            Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'}, Dr. {profile.name.split(' ')[1] || profile.name}
          </h1>
          <p className="text-[#1E3A5F]/70 font-medium mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Account Verified & Active
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/doctor/schedule">
            <Button variant="outline" className="border-[#6FAEE7]/30 text-[#1E3A5F] font-bold rounded-xl bg-white hover:bg-[#F7FAFC]">
              Manage Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= STATS ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-[#6FAEE7]/20 shadow-sm rounded-3xl flex items-center gap-4">
          <div className="p-4 bg-[#6FAEE7]/10 rounded-2xl text-[#6FAEE7]">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1E3A5F]/50 uppercase tracking-wider">Today's Sessions</p>
            <p className="text-3xl font-extrabold text-[#1E3A5F] text-center ">{todayAppointments.length}</p>
          </div>
        </Card>
        
        <Card className="p-6 bg-white border border-[#6FAEE7]/20 shadow-sm rounded-3xl flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-2xl text-green-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1E3A5F]/50 uppercase tracking-wider">Total Patients</p>
            <p className="text-3xl font-extrabold text-[#1E3A5F] text-center">{totalUniquePatients}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-[#6FAEE7]/20 shadow-sm rounded-3xl flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-500">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1E3A5F]/50 uppercase tracking-wider">Patient Rating</p>
            <p className="text-3xl font-extrabold text-[#1E3A5F] text-center">{profile.rating === 0 ? "New" : profile.rating}</p>
          </div>
        </Card>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SCHEDULE */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Today */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1E3A5F] flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" /> Today's Consultations
            </h2>

            {todayAppointments.length === 0 ? (
              <Card className="p-10 border-dashed border-2 border-[#6FAEE7]/30 bg-white flex flex-col items-center justify-center text-center rounded-3xl">
                <Calendar className="w-10 h-10 text-[#1E3A5F]/20 mb-3" />
                <h3 className="text-lg font-bold text-[#1E3A5F]">Clear Schedule</h3>
                <p className="text-[#1E3A5F]/60 max-w-sm mt-1 text-sm">You have no more patients scheduled for today.</p>
              </Card>
            ) : (
              todayAppointments.map((appt) => (
                <Card key={appt.id} className="p-5 border-l-4 border-l-[#6FAEE7] border-y-[#6FAEE7]/20 border-r-[#6FAEE7]/20 shadow-sm rounded-2xl bg-white hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1E3A5F]/5 flex items-center justify-center text-[#1E3A5F] font-bold text-xl shrink-0">
                      {appt.patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1E3A5F]">{appt.patient.name}</h3>
                      <p className="text-sm text-[#1E3A5F]/70 line-clamp-1">{appt.reason || "General Consultation"}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-[#1E3A5F]">
                        <span className="flex items-center gap-1 bg-[#6FAEE7]/10 text-[#1E3A5F] px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5 text-[#6FAEE7]" /> 
                          {new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/doctor/consultation/${appt.id}`} className="shrink-0 w-full md:w-auto">
                    <Button className="w-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-bold rounded-xl h-11 px-6 flex items-center gap-2 shadow-md">
                      <Video className="w-4 h-4" /> Enter LunaRoom
                    </Button>
                  </Link>
                </Card>
              ))
            )}
          </div>

          {/* Section: Upcoming */}
          {futureAppointments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1E3A5F] flex items-center gap-2 opacity-80">
                <Calendar className="w-5 h-5 text-[#6FAEE7]" /> Upcoming This Week
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {futureAppointments.map((appt) => (
                  <Card key={appt.id} className="p-4 border border-[#6FAEE7]/20 shadow-sm rounded-2xl bg-white flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-[#F7FAFC] flex items-center justify-center text-[#1E3A5F] font-bold shrink-0">
                      {appt.patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-sm font-bold text-[#1E3A5F] truncate">{appt.patient.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-[#1E3A5F]/60">
                        <span>{new Date(appt.datetime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span>{new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTION ITEMS & ALERTS */}
        <div className="space-y-6">
          
          <h2 className="text-xl font-bold text-[#1E3A5F]">Action Items</h2>
          
          {missingEmrAppointments.length > 0 ? (
            <div className="space-y-3">
              {missingEmrAppointments.map(appt => (
                <Card key={appt.id} className="p-4 border-l-4 border-l-amber-400 bg-white shadow-sm rounded-2xl border-y-[#6FAEE7]/10 border-r-[#6FAEE7]/10">
                  <div className="flex gap-3">
                    <ClipboardEdit className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#1E3A5F]">Missing EMR Notes</h4>
                      <p className="text-xs text-[#1E3A5F]/70 mt-1 leading-relaxed">
                        Please finalize clinical notes for <span className="font-semibold text-[#1E3A5F]">{appt.patient.name}</span>.
                      </p>
                      <Link href={`/doctor/consultation/${appt.id}`} className="text-xs font-bold text-[#6FAEE7] hover:underline mt-2 inline-flex items-center gap-1">
                        Complete Record <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
             <Card className="p-5 border border-green-100 bg-green-50 shadow-sm rounded-2xl flex items-start gap-3">
               <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
               <div>
                 <h4 className="text-sm font-bold text-green-800">All Caught Up!</h4>
                 <p className="text-xs text-green-700/80 mt-1">You have finalized all electronic medical records for your past sessions.</p>
               </div>
             </Card>
          )}

          {/* Interactive Support Card Component */}
          <ProviderSupportCard doctorName={profile.name} />

        </div>

      </div>
    </div>
  );
}