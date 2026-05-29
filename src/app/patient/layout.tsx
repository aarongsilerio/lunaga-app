import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Stethoscope, HeartPulse, Settings, Search } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server"; 
import { redirect } from "next/navigation";     
import { prisma } from "@/lib/prisma";         

/**
 * Patient Navigation Configuration
 * Easy to update and map through for clean code.
 */
const patientNav = [
  { name: "Dashboard", href: "/patient/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: "Find a Doctor", href: "/patient/doctors", icon: <Search className="w-5 h-5" /> },
  { name: "LunaMatch", href: "/patient/lunamatch", icon: <Stethoscope className="w-5 h-5" /> },
  { name: "Care Timeline", href: "/patient/care-timeline", icon: <HeartPulse className="w-5 h-5" /> },
  { name: "Settings", href: "/patient/profile", icon: <Settings className="w-5 h-5" /> },
];

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  /**
   * Security Interceptor
   */
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { patientProfile: true },
  });

  // If they don't have a profile OR haven't provided the required name, redirect to onboarding
  if (!dbUser?.patientProfile?.name) {
    redirect("/onboarding");
  }
  return (
    <div className="flex min-h-screen w-full bg-[#F7FAFC] font-sans text-[#1E3A5F]">
      
      {/* SIDEBAR NAVIGATION 
      */}
      <aside className="hidden w-64 flex-col border-r border-[#6FAEE7]/20 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-[#6FAEE7]/10 px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Image 
              src="/nav-logo.png" 
              alt="Lunága Logo" 
              width={109} 
              height={32} 
              priority 
            />
          </Link>
        </div>
        
        <nav className="flex-1 space-y-2 px-4 py-6">
          {patientNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#1E3A5F]/70 transition-all hover:bg-[#6FAEE7]/10 hover:text-[#1E3A5F]"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="flex h-16 items-center justify-between border-b border-[#6FAEE7]/10 bg-white/50 px-6 backdrop-blur-sm md:justify-end">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="md:hidden">
            <Image 
              src="/nav-logo.png" 
              alt="Lunága Logo" 
              width={109} 
              height={32} 
              priority 
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-[#1E3A5F]/80 sm:block">
              Patient Portal
            </span>
            <div className="h-8 w-px bg-[#6FAEE7]/20 hidden sm:block"></div>
            <UserButton />
          </div>
        </header>

        {/* PAGE CONTENT INJECTION */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}