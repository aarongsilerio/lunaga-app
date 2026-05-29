"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, ShieldAlert, Activity, User, MapPin, Phone } from "lucide-react";

// 1. Define strict types based on your Prisma Schema
type MedicalRecord = {
  bloodType: string | null;
  weight: number | null;
  height: number | null;
  allergies: string | null;
  ongoingConcerns: string | null;
};

type PatientProfile = {
  name: string;
  birthday: Date;
  sex: string | null;
  contactNumber: string | null;
  address: string | null;
  occupation: string | null;
  medicalRecord: MedicalRecord | null;
};

export function PatientInfoCard({ profile }: { profile: PatientProfile }) {
  // 2. State to manage confidentiality mode (Masked by default for privacy)
  const [isMasked, setIsMasked] = useState(true);

  // Helper function to calculate age safely
  const calculateAge = (birthday: Date) => {
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Helper to render masked or unmasked text
  const renderSecureText = (text: string | number | null | undefined, maskType: "text" | "number" = "text") => {
    if (!text) return "Not provided";
    if (!isMasked) return text;
    return maskType === "number" ? "•••" : "••••••••••••••••";
  };

  return (
    <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
      {/* Header with Security Toggle */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#6FAEE7]/10">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 ${isMasked ? "text-[#6FAEE7]" : "text-amber-500"}`} />
          <CardTitle className="text-lg text-[#1E3A5F]">Patient Health Profile</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsMasked(!isMasked)}
          className={`h-8 rounded-full ${isMasked ? "text-[#1E3A5F]/70" : "text-amber-600 bg-amber-50 hover:bg-amber-100"}`}
        >
          {isMasked ? (
            <><Eye className="w-4 h-4 mr-2" /> Show Details</>
          ) : (
            <><EyeOff className="w-4 h-4 mr-2" /> Hide Details</>
          )}
        </Button>
      </CardHeader>

      <CardContent className="p-6 grid gap-6 md:grid-cols-2">
        
        {/* Basic Information (PII) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#1E3A5F]/60 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Details
          </h3>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="text-[#1E3A5F]/60">Age / Sex</div>
            <div className="font-medium text-[#1E3A5F]">
              {calculateAge(profile.birthday)} yrs • {profile.sex || "N/A"}
            </div>
            
            <div className="text-[#1E3A5F]/60 flex items-center gap-1"><Phone className="w-3 h-3"/> Contact</div>
            <div className="font-medium text-[#1E3A5F]">{renderSecureText(profile.contactNumber)}</div>
            
            <div className="text-[#1E3A5F]/60 flex items-center gap-1"><MapPin className="w-3 h-3"/> Address</div>
            <div className="font-medium text-[#1E3A5F]">{renderSecureText(profile.address)}</div>
            
            <div className="text-[#1E3A5F]/60">Occupation</div>
            <div className="font-medium text-[#1E3A5F]">{profile.occupation || "N/A"}</div>
          </div>
        </div>

        {/* Medical Record (PHI) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#1E3A5F]/60 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" /> Clinical Vitals
          </h3>
          
          {profile.medicalRecord ? (
            <div className="grid grid-cols-2 gap-y-3 text-sm border-l-2 border-[#6FAEE7]/20 pl-4">
              <div className="text-[#1E3A5F]/60">Blood Type</div>
              <div className="font-medium text-red-500">
                {isMasked ? "•••" : (profile.medicalRecord.bloodType || "Unknown")}
              </div>

              <div className="text-[#1E3A5F]/60">Weight / Height</div>
              <div className="font-medium text-[#1E3A5F]">
                {renderSecureText(profile.medicalRecord.weight, "number")} kg / {renderSecureText(profile.medicalRecord.height, "number")} cm
              </div>

              <div className="text-[#1E3A5F]/60">Allergies</div>
              <div className="font-medium text-[#1E3A5F]">
                {isMasked ? (
                  <Badge variant="secondary" className="text-xs blur-[2px] opacity-70">Hidden</Badge>
                ) : (
                  profile.medicalRecord.allergies ? (
                    <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                      {profile.medicalRecord.allergies}
                    </Badge>
                  ) : "None recorded"
                )}
              </div>

              <div className="text-[#1E3A5F]/60 col-span-2 mt-2">Ongoing Concerns</div>
              <div className="font-medium text-[#1E3A5F] col-span-2 bg-[#F7FAFC] p-3 rounded-lg text-xs leading-relaxed">
                {isMasked ? (
                   <span className="italic text-[#1E3A5F]/50">Content hidden for patient privacy.</span>
                ) : (
                   profile.medicalRecord.ongoingConcerns || "No ongoing concerns reported."
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm italic text-[#1E3A5F]/50 bg-[#F7FAFC] p-4 rounded-lg">
              No electronic medical record (EMR) linked to this profile yet.
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}