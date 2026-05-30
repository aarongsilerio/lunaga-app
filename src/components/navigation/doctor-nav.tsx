"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Settings, 
  Menu, 
  X
} from "lucide-react";
import Image from "next/image";

const NAV_LINKS = [
  { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { name: "My Schedule", href: "/doctor/schedule", icon: CalendarDays }, 
  { name: "Patient List", href: "/doctor/patients", icon: Users },       
  { name: "Profile Settings", href: "/doctor/settings", icon: Settings },
];

export function DoctorNav() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* ========================================== */}
      {/* MOBILE TOP BAR (Visible only on small screens) */}
      {/* ========================================== */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#6FAEE7]/20 sticky top-0 z-40 shadow-sm">
        
        {/* Replaced Text with Custom Brand Logo for Mobile */}
        <Link href="/doctor/dashboard" className="flex items-center pl-1">
          <Image 
            src="/nav-logo.png" 
            alt="Lunága" 
            width={100} 
            height={29} 
            className="w-25 h-auto" 
            priority 
          />
        </Link>

        <div className="flex items-center gap-4">
          <ClerkLoading>
            <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 animate-pulse" />
          </ClerkLoading>
          <ClerkLoaded>
            <div className="flex items-center justify-center w-7 h-7">
              <UserButton />
            </div>
          </ClerkLoaded>
          
          <button onClick={() => setIsMobileOpen(true)} className="p-2 -mr-2 text-[#1E3A5F] hover:bg-[#6FAEE7]/10 rounded-lg transition-colors">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE FULLSCREEN MENU OVERLAY */}
      {/* ========================================== */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#1E3A5F]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl animate-in slide-in-from-right-full duration-300 flex flex-col">
            <div className="p-4 flex justify-end border-b border-[#6FAEE7]/10">
              <button onClick={() => setIsMobileOpen(false)} className="p-2 text-[#1E3A5F] hover:bg-[#6FAEE7]/10 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col flex-1 overflow-y-auto">
              <div className="px-6 py-4">
                <span className="text-xs font-bold text-[#1E3A5F]/40 uppercase tracking-wider block">
                  Doctor Portal
                </span>
              </div>
              
              <nav className="px-4 pb-4 space-y-2">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.name} href={link.href} onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${
                        isActive ? "bg-[#1E3A5F] text-white shadow-md" : "text-[#1E3A5F]/70 hover:bg-[#F7FAFC] hover:text-[#1E3A5F]"
                      }`}
                    >
                      <Icon className="w-5 h-5" /> {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DESKTOP SIDEBAR (Visible only on md+ screens) */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-72 fixed inset-y-0 left-0 bg-white border-r border-[#6FAEE7]/10 shadow-[4px_0_24px_rgba(111,174,231,0.05)] z-40 p-6">
        
        <div className="mb-5 pl-2">
          <Image 
            src="/nav-logo.png" 
            alt="Lunága" 
            width={130} 
            height={38} 
            // Fixed width interpolation: Using exact bracket syntax for safe compilation
            className="w-25 lg:w-32.5 h-auto transition-all" 
            priority 
          />
        </div>

        <div className="flex">
          <span className="text-xs font-bold text-[#1E3A5F]/40 uppercase tracking-wider pl-4 mb-2 block">
            Doctor Portal
          </span>
        </div>

        <nav className="flex-1 mt-5 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.name} href={link.href}
                className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all ${
                  isActive ? "bg-[#1E3A5F] text-white shadow-md shadow-[#1E3A5F]/20" : "text-[#1E3A5F]/60 hover:bg-[#F7FAFC] hover:text-[#1E3A5F]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#6FAEE7]" : ""}`} /> {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#6FAEE7]/10 flex items-center gap-3 px-4">
          <ClerkLoading>
            <div className="w-8 h-8 rounded-full bg-[#1E3A5F]/10 animate-pulse" />
          </ClerkLoading>
          
          {/* Re-applied hydration wrapper for the Desktop UserButton */}
          <ClerkLoaded>
            <div className="flex items-center justify-center w-8 h-8">
              <UserButton />
            </div>
          </ClerkLoaded>
          
          <span className="text-sm font-semibold text-[#1E3A5F]">My Account</span>
        </div>
      </aside>
    </>
  );
}