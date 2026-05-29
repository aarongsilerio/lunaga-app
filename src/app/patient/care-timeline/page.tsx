import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, FileText, Search } from "lucide-react";
import Link from "next/link";

export default async function CareTimeline() {
  // 1. Authenticate the current user
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // 2. Fetch all COMPLETED appointments for this specific patient
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      patientProfile: {
        include: {
          appointments: {
            where: { status: "COMPLETED" },
            orderBy: { datetime: "desc" }, // Most recent appointments at the top
            include: {
              doctor: true, // Include DoctorProfile to get name and specialization
            },
          },
        },
      },
    },
  });

  // Gracefully handle undefined profiles if the user hasn't finished onboarding
  const appointments = dbUser?.patientProfile?.appointments || [];

  return (
    <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Care Timeline</h1>
        <p className="text-[#1E3A5F]/70 mt-2">
          Your health journey, documented clearly and securely.
        </p>
      </div>

      {/* 3. Empty State Handling */}
      {appointments.length === 0 ? (
        <Card className="border-none bg-white shadow-sm rounded-2xl text-center py-16 px-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-[#F7FAFC] rounded-full flex items-center justify-center border border-[#6FAEE7]/20">
              <FileText className="w-8 h-8 text-[#6FAEE7]" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-[#1E3A5F] mb-2">No past consultations yet</h2>
          <p className="text-[#1E3A5F]/70 mb-8 max-w-md mx-auto">
            Your care timeline will automatically populate here after you complete your first telehealth visit.
          </p>
          <Link href="/patient/doctors">
            <Button className="rounded-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white shadow-md">
              <Search className="w-4 h-4 mr-2" />
              Find a Doctor
            </Button>
          </Link>
        </Card>
      ) : (
        /* 4. Timeline Rendering */
        <div className="relative border-l-2 border-[#6FAEE7]/30 ml-4 space-y-8 pb-8">
          {appointments.map((record) => {
            
            // Dynamically generate tags based on the record's data
            const tags = ["Consultation"];
            if (record.prescription) tags.push("Prescription");
            if (record.notes?.toLowerCase().includes("follow-up")) tags.push("Follow-up");

            // Format date consistently
            const formattedDate = new Date(record.datetime).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric"
            });

            return (
              <div key={record.id} className="relative pl-8">
                {/* Timeline Node Indicator (Gentle Lavender) */}
                <div className="absolute -left-3.5 top-2 h-7 w-7 rounded-full bg-[#C6B7FF]/20 border-4 border-white flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#C6B7FF]"></div>
                </div>

                <Card className="border-none shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    
                    {/* Record Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-[#1E3A5F]">
                          Consultation with {record.doctor.name}
                        </h3>
                        <p className="text-sm text-[#1E3A5F]/60 flex items-center gap-1 mt-1">
                          <Stethoscope className="w-3 h-3" /> {record.doctor.specialization}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[#6FAEE7] bg-[#6FAEE7]/10 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                        {formattedDate}
                      </span>
                    </div>
                    
                    {/* Doctor's Notes */}
                    <div className="space-y-4">
                      {record.notes ? (
                        <p className="text-[#1E3A5F]/80 leading-relaxed text-sm bg-[#F7FAFC] p-3 rounded-lg border border-[#6FAEE7]/10">
                          <span className="font-medium text-[#1E3A5F] block mb-1">Clinical Notes:</span>
                          "{record.notes}"
                        </p>
                      ) : (
                        <p className="text-[#1E3A5F]/50 italic text-sm">No notes provided for this session.</p>
                      )}

                      {/* Prescription Alert (If applicable) */}
                      {record.prescription && (
                        <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          <span className="font-medium block mb-1">Prescription Issued:</span>
                          {record.prescription}
                        </p>
                      )}
                    </div>

                    {/* Dynamic Tags */}
                    <div className="flex gap-2 mt-4">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-100 text-[#1E3A5F]/70 font-normal hover:bg-gray-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}