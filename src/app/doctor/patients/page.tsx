import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Activity, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function DoctorPatientsDirectory() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 1. Fetch Doctor Profile
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { doctorProfile: true }
  });

  if (!dbUser || !dbUser.doctorProfile) redirect("/onboarding/doctor");
  const doctorId = dbUser.doctorProfile.id;

  // 2. Fetch all unique patients associated with this doctor
  const patients = await prisma.patientProfile.findMany({
    where: {
      appointments: {
        some: { doctorId: doctorId } // Security: Must have at least one appointment with THIS doctor
      }
    },
    include: {
      medicalRecord: true,
      appointments: {
        where: { doctorId: doctorId },
        orderBy: { datetime: "desc" },
        take: 1, // Only fetch the most recent appointment for the directory summary
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & SEARCH BARR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E3A5F]">Patient Directory</h1>
          <p className="text-[#1E3A5F]/70 font-medium mt-1">Manage medical records and consultation histories.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1E3A5F]/40" />
          <input 
            type="text" 
            placeholder="Search patients..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#6FAEE7]/30 focus:outline-none focus:ring-2 focus:ring-[#6FAEE7]/50 bg-white"
          />
        </div>
      </div>

      {/* PATIENT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border border-[#6FAEE7]/20 rounded-3xl shadow-sm">
            <Users className="w-12 h-12 text-[#1E3A5F]/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1E3A5F]">No Patients Yet</h3>
            <p className="text-[#1E3A5F]/60 mt-2">Your directory will populate once patients book consultations.</p>
          </div>
        ) : (
          patients.map((patient) => {
            const lastAppt = patient.appointments[0];
            
            return (
              <Card key={patient.id} className="p-6 bg-white border border-[#6FAEE7]/20 rounded-3xl shadow-sm hover:shadow-md hover:border-[#6FAEE7]/50 transition-all flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1E3A5F] line-clamp-1">{patient.name}</h3>
                    <p className="text-xs text-[#1E3A5F]/60">ID: {patient.id.toString().padStart(6, '0')}</p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-2 text-sm">
                    <Activity className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[#1E3A5F]/80 line-clamp-2">
                      {patient.medicalRecord?.ongoingConcerns || "No major ongoing concerns documented."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#6FAEE7] shrink-0" />
                    <p className="text-[#1E3A5F]/80 font-medium">
                      Last Visit: {lastAppt ? new Date(lastAppt.datetime).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#6FAEE7]/10">
                  <Link href={`/doctor/patients/${patient.id}`}>
                    <Button variant="ghost" className="w-full text-[#6FAEE7] hover:bg-[#6FAEE7]/10 hover:text-[#1E3A5F] font-bold rounded-xl justify-between">
                      View Full Record <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}