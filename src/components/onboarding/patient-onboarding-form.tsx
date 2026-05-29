"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { updatePatientProfile } from "@/app/patient/profile/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export function PatientOnboardingForm() {
  const { user: clerkUser } = useUser();
  const router = useRouter();

  // Wizard State
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [contactNumber, setContactNumber] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(clerkUser?.imageUrl || null);

  // Auto-format PH Contact Number
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d+]/g, '');
    if (val.startsWith("09")) val = "+63" + val.slice(1);
    setContactNumber(val);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Profile picture must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Move to step 2 (HTML5 Validation will automatically block if required fields in Step 1 are empty)
  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const profilePictureFile = formData.get("profilePicture") as File | null;

    try {
      // 1. Sync avatar to Clerk if uploaded
      if (profilePictureFile && profilePictureFile.size > 0 && clerkUser) {
        await clerkUser.setProfileImage({ file: profilePictureFile });
      }

      // 2. Save everything to Neon Database
      const result = await updatePatientProfile(formData);

      if (result.success) {
        // 3. Reroute to Dashboard!
        router.push("/patient/dashboard");
      } else {
        setError(result.message);
        setIsPending(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <Card className="border-none shadow-xl shadow-[#6FAEE7]/10 rounded-3xl bg-white overflow-hidden">
      
      {/* Progress Bar */}
      <div className="flex h-2 w-full bg-[#F7FAFC]">
        <div className={`h-full bg-[#1E3A5F] transition-all duration-500 ease-out ${step === 1 ? "w-1/2" : "w-full"}`}></div>
      </div>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: Personal Identity */}
          <div className={`space-y-6 animate-in slide-in-from-right-4 duration-500 ${step === 1 ? "block" : "hidden"}`}>
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A5F]">Personal Details</h2>
              <p className="text-sm text-[#1E3A5F]/70">Let's start with the basics.</p>
            </div>

            <div className="flex items-center gap-6 pb-4">
              <Avatar className="w-20 h-20 border-2 border-[#6FAEE7]/30 shadow-sm">
                <AvatarImage src={imagePreview || ""} className="object-cover" />
                <AvatarFallback className="bg-[#F7FAFC] text-[#1E3A5F]/50">U</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profilePicture" className="cursor-pointer bg-[#F7FAFC] border border-[#6FAEE7]/20 text-[#1E3A5F] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6FAEE7]/10 transition-colors inline-flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Upload Photo <span className="text-red-500">*</span>
                </Label>
                <Input id="profilePicture" name="profilePicture" type="file" accept="image/*" required={!imagePreview} className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" required defaultValue={`${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim()} className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday <span className="text-red-500">*</span></Label>
                <Input id="birthday" name="birthday" type="date" required className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number <span className="text-red-500">*</span></Label>
                <Input id="contactNumber" name="contactNumber" value={contactNumber} onChange={handleContactChange} required placeholder="+639..." className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]" />
              </div>
            </div>

            <Button type="button" onClick={nextStep} className="w-full h-12 mt-4 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-medium text-lg">
              Next Step <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* STEP 2: Medical Baseline */}
          <div className={`space-y-6 animate-in slide-in-from-right-4 duration-500 ${step === 2 ? "block" : "hidden"}`}>
             <div>
              <h2 className="text-2xl font-bold text-[#1E3A5F]">Medical Baseline</h2>
              <p className="text-sm text-[#1E3A5F]/70">This helps doctors provide accurate care.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) <span className="text-red-500">*</span></Label>
                <Input id="weight" name="weight" type="number" step="0.1" required placeholder="e.g. 65" className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) <span className="text-red-500">*</span></Label>
                <Input id="height" name="height" type="number" step="0.1" required placeholder="e.g. 170" className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type <span className="text-red-500">*</span></Label>
              <Select name="bloodType" required>
                <SelectTrigger className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]">
                  <SelectValue placeholder="Select Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="Do not know">I do not know</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Known Allergies <span className="text-red-500">*</span></Label>
              <Input id="allergies" name="allergies" required placeholder="E.g. Peanuts, Penicillin (Type 'None' if NA)" className="h-12 border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pastMedicalHistory">Basic Medical History <span className="text-red-500">*</span></Label>
              <Textarea id="pastMedicalHistory" name="pastMedicalHistory" required placeholder="Briefly describe any chronic conditions or major past illnesses (Type 'None' if NA)" className="min-h-[100px] border-[#6FAEE7]/30 rounded-xl bg-[#F7FAFC]" />
            </div>

            {error && <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

            <div className="flex gap-4 pt-2">
              <Button type="button" variant="outline" onClick={prevStep} className="h-12 w-16 rounded-xl border-[#6FAEE7]/30 text-[#1E3A5F]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button type="submit" disabled={isPending} className="h-12 flex-1 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-medium text-lg">
                {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                {isPending ? "Setting up Profile..." : "Complete Setup"}
              </Button>
            </div>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}