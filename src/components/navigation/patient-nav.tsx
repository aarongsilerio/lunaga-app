"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { LayoutDashboard, Stethoscope, HeartPulse, Settings, Search, Menu, X } from "lucide-react";
import Image from "next/image";

const patientNav = [
  { name: "Dashboard", href: "/patient/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: "Find a Doctor", href: "/patient/doctors", icon: <Search className="w-5 h-5" /> },
  { name: "LunaMatch AI", href: "/patient/lunamatch", icon: <Stethoscope className="w-5 h-5" /> },
  { name: "Care Timeline", href: "/patient/care-timeline", icon: <HeartPulse className="w-5 h-5" /> },
  { name: "Settings", href: "/patient/profile", icon: <Settings className="w-5 h-5" /> },
];

export function PatientNav() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Automatically close the mobile menu when the user clicks a link and the route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileOpen]);

  const NavLinks = () => (
    <div className="flex flex-col space-y-2 mt-6">
      {patientNav.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
              isActive
                ? "bg-[#1E3A5F] text-white shadow-md"
                : "text-[#1E3A5F]/70 hover:bg-[#6FAEE7]/10 hover:text-[#1E3A5F]"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ========================================== */}
      {/* MOBILE TOP BAR (Visible only on small screens) */}
      {/* ========================================== */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-[#6FAEE7]/20 z-40 flex items-center justify-between px-6 shadow-sm">
        <Image src="/nav-logo.png" alt="Lunága" width={110} height={32} className="w-27.5 h-auto" priority />
        <div className="flex items-center gap-4">
          <ClerkLoading>
            <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 animate-pulse" />
          </ClerkLoading>
          {/* FIX 1: Removed the outdated prop for Clerk v5+ compatibility */}
          <ClerkLoaded>
            <UserButton />
          </ClerkLoaded>
          
          {/* FIX 2: Added aria-label and title for full accessibility compliance */}
          <button 
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open mobile menu"
            title="Open mobile menu"
            className="p-2 -mr-2 text-[#1E3A5F] hover:bg-[#6FAEE7]/10 rounded-lg transition-colors"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE SLIDE-OUT DRAWER */}
      {/* ========================================== */}
      {/* Overlay backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-[#1E3A5F]/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />
      
      {/* Drawer panel */}
      <div 
        className={`md:hidden fixed inset-y-0 right-0 w-3/4 max-w-sm bg-white shadow-2xl z-50 p-6 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          
          <span className="text-sm font-bold text-[#6FAEE7] uppercase tracking-wider">Menu</span>
          
          {/* FIX 3: Added aria-label and title for accessibility */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close mobile menu"
            title="Close mobile menu"
            className="p-2 -mr-2 text-[#1E3A5F]/50 hover:text-[#1E3A5F] hover:bg-[#6FAEE7]/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <NavLinks />
      </div>

      {/* ========================================== */}
      {/* DESKTOP SIDEBAR (Visible only on medium+ screens) */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-72 fixed inset-y-0 left-0 bg-white border-r border-[#6FAEE7]/10 shadow-[4px_0_24px_rgba(111,174,231,0.05)] z-40 p-6">
        <div className="mb-5 pl-2">
          <Image 
            src="/nav-logo.png" 
            alt="Lunága" 
            width={130} 
            height={38} 
            // Mobile: 130px wide | Desktop (md+): Shrinks to 100px wide
            className="w-32.5 md:w-25 lg:w-22.5 h-auto transition-all" 
            priority 
          />
        </div>
        
        <div className="flex-1">
          <span className="text-xs font-bold text-[#1E3A5F]/40 uppercase tracking-wider pl-4 mb-2 block">
            Patient Portal
          </span>
          <NavLinks />
        </div>

        <div className="mt-auto pt-6 border-t border-[#6FAEE7]/10 flex items-center gap-3 px-4">
          
          {/* FIX: Explicit loading states prevent hydration mismatch */}
          <ClerkLoading>
            <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 animate-pulse" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton />
          </ClerkLoaded>
          
          <span className="text-sm font-semibold text-[#1E3A5F]">My Account</span>
        </div>
      </aside>
    </>
  );
}