"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, CalendarDays, Clock, MapPin, ChevronRight, Stethoscope, Sparkles } from "lucide-react";
import Link from "next/link";
import type { DoctorWithUser } from "@/app/patient/doctors/page";

const formatTime = (decimalTime: number) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export function DoctorDirectory({ initialDoctors }: { initialDoctors: DoctorWithUser[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");

  const uniqueSpecializations = useMemo(() => {
    const specs = new Set(initialDoctors.map((doc) => doc.specialization));
    return ["All", ...Array.from(specs)];
  }, [initialDoctors]);

  const filteredDoctors = useMemo(() => {
    return initialDoctors.filter((doc) => {
      const matchesSpecialization = specializationFilter === "All" || doc.specialization === specializationFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        doc.name.toLowerCase().includes(term) ||
        doc.specialization.toLowerCase().includes(term) ||
        (doc.bio && doc.bio.toLowerCase().includes(term)) ||
        (doc.subSpecializations && doc.subSpecializations.some((sub: string) => sub.toLowerCase().includes(term)));

      return matchesSpecialization && matchesSearch;
    });
  }, [initialDoctors, searchTerm, specializationFilter]);

  return (
    <div className="space-y-8">
      
      {/* ELEVATED SEARCH CONTROLS */}
      <Card className="pl-4 pr-4 border border-[#6FAEE7]/20 shadow-md bg-white/80 backdrop-blur-md rounded-2xl sticky top-4 z-20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/40" />
            <Input 
              placeholder="Describe symptoms (e.g., headache) or search names..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-[#F7FAFC] border-none h-14 rounded-xl text-base focus-visible:ring-2 focus-visible:ring-[#6FAEE7]/50 transition-all shadow-inner"
            />
          </div>
          <div className="w-full md:w-72 relative">
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="h-14 bg-[#F7FAFC] border-none rounded-xl text-base font-medium text-[#1E3A5F]">
                <SelectValue placeholder="Filter Specialization" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#6FAEE7]/20 shadow-xl">
                {uniqueSpecializations.map((spec) => (
                  <SelectItem key={spec} value={spec} className="rounded-lg cursor-pointer">{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* DOCTOR GRID */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-24 px-6 bg-white rounded-3xl border border-[#6FAEE7]/10 shadow-sm animate-in fade-in zoom-in-95">
          <Stethoscope className="w-16 h-16 text-[#6FAEE7]/30 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-[#1E3A5F]">No matches found</h3>
          <p className="text-[#1E3A5F]/60 mt-2 text-lg">Try adjusting your filters or typing different symptoms.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doc) => (
            <Card 
              key={doc.id} 
              className="pl-2 pr-2 border border-[#6FAEE7]/10 shadow-sm bg-white rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-[#6FAEE7]/30 transition-all duration-300 flex flex-col group"
            >
              <CardContent className="flex-1 flex flex-col">
                
                {/* Doctor Header */}
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="w-20 h-20 border-4 border-[#F7FAFC] shadow-sm">
                    <AvatarImage src="" className="object-cover" />
                    <AvatarFallback className="bg-[#6FAEE7]/10 text-[#1E3A5F] text-xl font-semibold">
                      {doc.name.charAt(4)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100/50">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-amber-700">{(doc.rating ?? 0) > 0 ? doc.rating : "New"}</span>
                  </div>
                </div>

                <h3 className="font-bold text-xl text-[#1E3A5F] tracking-tight leading-tight">{doc.name}</h3>
                <p className="text-sm font-semibold text-[#6FAEE7] mt-1 uppercase tracking-wider">{doc.specialization}</p>
                
                {/* Bio Snippet */}
                <p className="text-sm text-[#1E3A5F]/70 line-clamp-2 mt-4 mb-5 leading-relaxed flex-1">
                  {doc.bio || "No biography provided."}
                </p>

                {/* Sub-Specializations */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {doc.subSpecializations?.slice(0, 3).map((sub: string) => (
                    <Badge key={sub} variant="secondary" className="bg-[#F7FAFC] text-[#1E3A5F]/60 text-xs font-medium hover:bg-[#6FAEE7]/10 transition-colors">
                      {sub}
                    </Badge>
                  ))}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#6FAEE7]/10">
                  <div className="flex items-center gap-2 text-sm text-[#1E3A5F]/70">
                    <CalendarDays className="w-4 h-4 text-[#6FAEE7]" />
                    <span className="truncate">{doc.clinicDays?.[0] || "TBA"} - {doc.clinicDays?.[doc.clinicDays.length - 1] || "TBA"}</span>
                  </div>
                  {doc.availability && doc.availability.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[#1E3A5F]/70">
                      <Clock className="w-4 h-4 text-[#8ED8C3]" />
                      <span className="truncate">From {formatTime(doc.availability[0])}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#1E3A5F]/70 col-span-2">
                    <MapPin className="w-4 h-4 text-[#C6B7FF]" />
                    <span>{doc.hmoAccreditations?.length > 0 ? `${doc.hmoAccreditations.join(", ")}` : "Self-pay only"}</span>
                  </div>
                </div>

              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Link href={`/patient/doctors/${doc.id}`} className="w-full">
                  <Button className="w-full h-12 rounded-xl bg-[#1E3A5F]/5 text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-all duration-300 font-semibold text-base group-hover:shadow-md">
                    View Schedule 
                    <ChevronRight className="w-5 h-5 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}