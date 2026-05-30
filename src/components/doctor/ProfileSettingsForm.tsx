"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckSquare, Camera, UserCircle } from "lucide-react";
import { updateDoctorProfile } from "@/app/doctor/settings/actions";
import Image from "next/image";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ProfileSettingsFormProps {
  profile: any; // Passed from the Server Page
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(profile.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateDoctorProfile(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated successfully!");
    }
    
    setIsLoading(false);
  }

  return (
    <Card className="max-w-4xl p-8 rounded-3xl shadow-sm border border-[#6FAEE7]/20 bg-white">
      <form onSubmit={onSubmit} className="space-y-8">
        
        {/* ================= AVATAR UPLOAD ================= */}
        <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-[#6FAEE7]/10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#F7FAFC] shadow-lg bg-[#6FAEE7]/10 flex items-center justify-center relative z-10">
              {imagePreview ? (
                <Image src={imagePreview} alt="Profile Preview" fill className="object-cover" />
              ) : (
                <UserCircle className="w-16 h-16 text-[#1E3A5F]/40" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* Hidden File Input */}
            <input type="file" name="profileImage" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-[#1E3A5F]">Profile Picture</h2>
            <p className="text-sm text-[#1E3A5F]/60 max-w-sm mt-1">
              Upload a professional photo. This will replace your Clerk account avatar and be visible to all patients. (Max 5MB)
            </p>
          </div>
        </div>

        {/* ================= CORE DETAILS ================= */}
        <div className="space-y-6">
          {/* FIX 1: Split Name into First and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">First Name</label>
              <Input name="firstName" defaultValue={profile.firstName || ""} required className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Last Name</label>
              <Input name="lastName" defaultValue={profile.lastName || ""} required className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>
          </div>

          {/* FIX 2: Group Title, Extension, and Gender cleanly */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Title</label>
              <Input name="title" defaultValue={profile.title || ""} placeholder="Dr." className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Extension</label>
              <Input name="extension" defaultValue={profile.extension || ""} placeholder="MD" className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Gender</label>
              <select name="gender" defaultValue={profile.gender || ""} className="flex h-12 w-full rounded-xl border border-input bg-[#F7FAFC] px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6FAEE7]/50">
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Primary Specialization</label>
              <Input name="specialization" defaultValue={profile.specialization} required className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Sub-Specializations (Comma Separated)</label>
              <Input name="subSpecializations" defaultValue={profile.subSpecializations?.join(", ")} placeholder="e.g., Pediatric Cardiology, Echo" className="h-12 rounded-xl bg-[#F7FAFC]" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Professional Biography</label>
          <Textarea name="bio" defaultValue={profile.bio || ""} placeholder="Describe your experience..." className="min-h-30 rounded-xl bg-[#F7FAFC]" />
        </div>

        {/* ================= LOGISTICS & HMO ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#6FAEE7]/10">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">HMO Accreditations (Comma Separated)</label>
            <Input name="hmoAccreditations" defaultValue={profile.hmoAccreditations?.join(", ")} placeholder="e.g., Maxicare, Intellicare, PhilHealth" className="h-12 rounded-xl bg-[#F7FAFC]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Contact Number</label>
            <Input name="phoneNumber" defaultValue={profile.phoneNumber || ""} placeholder="+63 912 345 6789" className="h-12 rounded-xl bg-[#F7FAFC]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Clinic Room No.</label>
            <Input name="roomNumber" defaultValue={profile.roomNumber || ""} placeholder="e.g., Room 402, St. Luke's" className="h-12 rounded-xl bg-[#F7FAFC]" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Standard Clinic Hours</label>
            <Input name="clinicHours" defaultValue={profile.clinicHours || ""} placeholder="e.g., 9:00 AM - 4:00 PM" className="h-12 rounded-xl bg-[#F7FAFC]" />
          </div>
        </div>

        {/* ================= CLINIC DAYS ================= */}
        <div className="space-y-3 pt-6 border-t border-[#6FAEE7]/10">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F]/70">Available Clinic Days</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isCheckedByDefault = profile.clinicDays?.includes(day);
              return (
                <label key={day} className="flex items-center gap-2 p-3 rounded-xl border border-[#6FAEE7]/20 bg-white hover:bg-[#F7FAFC] cursor-pointer transition-colors has-checked:bg-[#1E3A5F] has-checked:text-white has-checked:border-[#1E3A5F]">
                  <input type="checkbox" name="clinicDays" value={day} defaultChecked={isCheckedByDefault} className="hidden" />
                  <CheckSquare className="w-4 h-4 opacity-70" />
                  <span className="text-sm font-semibold">{day}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-8 border-t border-[#6FAEE7]/10">
          <Button type="submit" disabled={isLoading} className="h-14 px-10 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-bold text-lg shadow-md w-full md:w-auto transition-transform hover:scale-105">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Profile Updates"}
          </Button>
        </div>
      </form>
    </Card>
  );
}