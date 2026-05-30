"use client";

import { useState } from "react";
import { updatePatientProfile } from "@/app/patient/profile/actions";
import { useUser } from "@clerk/nextjs"; // <-- 1. Import Clerk's user hook
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Loader2, Camera } from "lucide-react";

export function PatientProfileForm({ initialData }: { initialData: any }) {
  // 2. Extract the active Clerk user session
  const { user: clerkUser } = useUser(); 

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "emr">("personal");

  const profile = initialData?.patientProfile || {};
  const emr = profile?.medicalRecord || {};

  const [contactNumber, setContactNumber] = useState<string>(profile.contactNumber || "");
  
  // 3. Fallback to Clerk's image if the database doesn't have one yet
  // FIX: Access profilePicture from initialData (the User table), not the patientProfile table
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.profilePicture || clerkUser?.imageUrl || null
  );

  const formattedBirthday = profile?.birthday 
    ? new Date(profile.birthday).toISOString().split('T')[0] 
    : "";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: "File is too large. Max size is 2MB.", type: "error" });
        e.target.value = ''; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setMessage(null);
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^\d+]/g, '');
    if (val.startsWith("09")) val = "+63" + val.slice(1);
    setContactNumber(val);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const profilePictureFile = formData.get("profilePicture") as File | null;

    // 4. CLERK SYNC: If a new file is uploaded, push it to Clerk's CDN first
    if (profilePictureFile && profilePictureFile.size > 0 && clerkUser) {
      try {
        await clerkUser.setProfileImage({ file: profilePictureFile });
      } catch (clerkError) {
        console.error("[Clerk Sync Error] Failed to update avatar:", clerkError);
        // We log the error but do not block the Postgres save!
      }
    }

    // 5. DATABASE SYNC: Save all data (including Base64 image) to Neon Postgres
    const result = await updatePatientProfile(formData);

    setMessage({ text: result.message, type: result.success ? "success" : "error" });
    setIsPending(false);
  }

  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white">
      <CardHeader className="border-b border-[#6FAEE7]/10 rounded-t-2xl pb-6">
        <CardTitle className="text-2xl text-[#1E3A5F]">Manage Profile & Records</CardTitle>
        <CardDescription className="text-[#1E3A5F]/70">
          Ensure your information is up to date for accurate LunaMatch recommendations.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid w-full grid-cols-2 mb-8 bg-[#F7FAFC] p-1 rounded-xl">
            <button type="button" onClick={() => setActiveTab("personal")} className={`rounded-lg py-2 text-sm font-medium transition-all ${activeTab === "personal" ? "bg-white shadow-sm text-[#1E3A5F]" : "text-[#1E3A5F]/60 hover:text-[#1E3A5F]"}`}>
              Personal Details
            </button>
            <button type="button" onClick={() => setActiveTab("emr")} className={`rounded-lg py-2 text-sm font-medium transition-all ${activeTab === "emr" ? "bg-white shadow-sm text-[#1E3A5F]" : "text-[#1E3A5F]/60 hover:text-[#1E3A5F]"}`}>
              Medical Record (EMR)
            </button>
          </div>

          {/* TAB 1: PERSONAL DETAILS */}
          <div className={`space-y-6 animate-in fade-in ${activeTab === "personal" ? "block" : "hidden"}`}>
            
            {/* PROFILE PICTURE UPLOADER */}
            <div className="flex items-center gap-6 pb-6 border-b border-[#6FAEE7]/10">
              <Avatar className="w-24 h-24 border-2 border-[#6FAEE7]/20 shadow-sm">
                <AvatarImage src={imagePreview || ""} className="object-cover" />
                <AvatarFallback className="bg-[#F7FAFC] text-2xl text-[#1E3A5F]/50">
                  {/* FIX 1: Safely grab the first letter from initialData (User) or Clerk */}
                  {initialData?.firstName ? initialData.firstName.charAt(0) : (clerkUser?.firstName?.charAt(0) || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profilePicture" className="cursor-pointer bg-white border border-[#6FAEE7]/30 text-[#1E3A5F] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6FAEE7]/10 transition-colors inline-flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Change Picture
                </Label>
                <Input id="profilePicture" name="profilePicture" type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={handleImageChange} />
                <p className="text-xs text-[#1E3A5F]/50">JPG, PNG, or GIF. Max size 2MB.</p>
              </div>
            </div>

            {/* FIX 2: Split Full Name into First and Last Name Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" defaultValue={initialData?.firstName || clerkUser?.firstName || ""} required placeholder="Juan" className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" defaultValue={initialData?.lastName || clerkUser?.lastName || ""} required placeholder="Dela Cruz" className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthday">Date of Birth</Label>
                <Input id="birthday" name="birthday" type="date" defaultValue={formattedBirthday} required className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" />
              </div>
              
              <div className="space-y-3">
                <Label>Biological Sex</Label>
                <RadioGroup defaultValue={profile.sex || "Male"} name="sex" className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Male" id="sex-male" /><Label htmlFor="sex-male" className="font-normal">Male</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Female" id="sex-female" /><Label htmlFor="sex-female" className="font-normal">Female</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Intersex" id="sex-intersex" /><Label htmlFor="sex-intersex" className="font-normal">Intersex</Label></div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input id="contactNumber" name="contactNumber" value={contactNumber} onChange={handleContactChange} placeholder="+639000000000" className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" defaultValue={profile.address} placeholder="123 Rizal Ave, Manila" className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" name="occupation" defaultValue={profile.occupation} placeholder="e.g. Software Engineer" className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" />
              </div>
            </div>
          </div>

          {/* TAB 2: ELECTRONIC MEDICAL RECORD (EMR) */}
          <div className={`space-y-4 animate-in fade-in ${activeTab === "emr" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2"><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" name="weight" type="number" step="0.1" defaultValue={emr.weight} placeholder="70.5" className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" /></div>
              <div className="space-y-2"><Label htmlFor="height">Height (cm)</Label><Input id="height" name="height" type="number" step="0.1" defaultValue={emr.height} placeholder="170" className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" /></div>
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select name="bloodType" defaultValue={emr.bloodType || "Do not know"}>
                  <SelectTrigger className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50"><SelectValue placeholder="Select Blood Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="Do not know">Do not know</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-3"><Label htmlFor="allergies">Known Allergies</Label><Input id="allergies" name="allergies" defaultValue={emr.allergies} placeholder="Peanuts, Penicillin, etc. (Leave blank if none)" className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" /></div>
              <div className="space-y-2 md:col-span-3"><Label htmlFor="pastMedicalHistory">Past Medical History (Comma separated)</Label><Input id="pastMedicalHistory" name="pastMedicalHistory" defaultValue={emr.pastMedicalHistory?.join(", ")} placeholder="Asthma, Hypertension, etc." className="border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" /></div>
              <div className="space-y-2 md:col-span-3"><Label htmlFor="ongoingConcerns">Current / Ongoing Concerns</Label><Textarea id="ongoingConcerns" name="ongoingConcerns" defaultValue={emr.ongoingConcerns} placeholder="Describe any symptoms or concerns you currently have..." className="min-h-25 border-[#6FAEE7]/30 focus-visible:ring-[#6FAEE7]/50" /></div>
            </div>
          </div>

          {/* Feedback & Submission */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#6FAEE7]/10 gap-4">
            <div className="flex-1">{message && (<p className={`text-sm font-medium ${message.type === "success" ? "text-emerald-600" : "text-red-500"}`}>{message.text}</p>)}</div>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto rounded-full bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white shadow-md">
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...</> : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
            </Button>
          </div>
          
        </form>
      </CardContent>
    </Card>
  );
}