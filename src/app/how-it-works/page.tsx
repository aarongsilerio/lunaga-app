import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { LegalFooter } from "@/components/legal/LegalFooter";
import Link from "next/link";
import { 
  ArrowRight, 
  Stethoscope, 
  CalendarCheck, 
  Video, 
  HeartPulse, 
  ShieldCheck,
  Sparkles
} from "lucide-react";

const steps = [
  {
    badge: "Step 1: LunaMatch",
    title: "Symptom-Guided Matching",
    description: "Don't know which specialist to see? Simply describe how you're feeling. Our intelligent LunaMatch engine analyzes your symptoms and instantly connects you with the right, fully-vetted medical professionals.",
    icon: <Stethoscope className="w-8 h-8 text-[#6FAEE7]" />,
    bgClass: "bg-[#6FAEE7]/10",
    imagePlaceholder: "bg-gradient-to-br from-[#6FAEE7]/20 to-[#F7FAFC]",
  },
  {
    badge: "Step 2: Scheduling",
    title: "Book on Your Terms",
    description: "Browse verified doctor profiles, read their clinical backgrounds, and view their real-time availability. Book a consultation slot that fits your schedule with just a few clicks—no phone calls required.",
    icon: <CalendarCheck className="w-8 h-8 text-[#8ED8C3]" />,
    bgClass: "bg-[#8ED8C3]/10",
    imagePlaceholder: "bg-gradient-to-bl from-[#8ED8C3]/20 to-[#F7FAFC]",
  },
  {
    badge: "Step 3: LunaRoom",
    title: "The Virtual Care Space",
    description: "When it's time for your appointment, enter the LunaRoom. It's a secure, high-definition virtual environment designed to feel calm and private. While you talk, your doctor updates your records in real-time.",
    icon: <Video className="w-8 h-8 text-[#C6B7FF]" />,
    bgClass: "bg-[#C6B7FF]/10",
    imagePlaceholder: "bg-gradient-to-tr from-[#C6B7FF]/20 to-[#F7FAFC]",
  },
  {
    badge: "Step 4: Care Timeline",
    title: "Your Health, Organized",
    description: "Forget scattered paperwork. After your visit, your clinical notes, e-prescriptions, and next steps immediately appear in your chronologically organized Care Timeline. Continuous care, always in your pocket.",
    icon: <HeartPulse className="w-8 h-8 text-rose-400" />,
    bgClass: "bg-rose-400/10",
    imagePlaceholder: "bg-gradient-to-tl from-rose-400/20 to-[#F7FAFC]",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden relative">
      
      {/* ========================================== */}
      {/* AMBIENT BACKGROUND GLOWS */}
      {/* ========================================== */}
      <div className="absolute top-0 -z-10 h-full w-full bg-[#F7FAFC]">
        <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[#6FAEE7]/20 opacity-50 blur-[120px]"></div>
        <div className="absolute top-[40%] right-0 h-[500px] w-[500px] translate-x-1/4 rounded-full bg-[#8ED8C3]/20 opacity-40 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/4 rounded-full bg-[#C6B7FF]/20 opacity-40 blur-[100px]"></div>
      </div>

      {/* ========================================== */}
      {/* HEADER SECTION */}
      {/* ========================================== */}
      <section className="container mx-auto px-6 pt-24 pb-16 md:px-12 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#6FAEE7]/20 mb-2 text-[#1E3A5F]">
            <Sparkles className="h-6 w-6 text-[#6FAEE7]" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1E3A5F] sm:text-5xl md:text-6xl">
            How Lunága Works
          </h1>
          <p className="text-lg md:text-xl text-[#1E3A5F]/70 leading-relaxed font-medium">
            We've completely reimagined the telehealth journey. From your first symptom to your final prescription, every step is designed for clarity, comfort, and clinical excellence.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* ZIG-ZAG JOURNEY SECTION */}
      {/* ========================================== */}
      <section className="container mx-auto px-6 py-12 md:px-12 relative z-10">
        <div className="space-y-24 md:space-y-32">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={index} 
                className={`flex flex-col gap-12 lg:gap-20 items-center ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                
                {/* Text Content */}
                <div className="flex-1 space-y-6 max-w-xl">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-white text-sm font-bold text-[#1E3A5F] shadow-sm border border-[#6FAEE7]/10 tracking-wide uppercase">
                    {step.badge}
                  </span>
                  
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3A5F]">
                    {step.title}
                  </h2>
                  
                  <p className="text-lg text-[#1E3A5F]/70 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Icon Accent */}
                  <div className={`mt-6 inline-flex p-4 rounded-2xl shadow-sm ${step.bgClass}`}>
                    {step.icon}
                  </div>
                </div>

                {/* Abstract Visual / Image Placeholder */}
                {/* In a real production app, you would replace this div with actual app screenshots */}
                <div className="flex-1 w-full max-w-xl">
                  <div className={`aspect-[4/3] rounded-3xl shadow-xl border border-white/50 relative overflow-hidden ${step.imagePlaceholder} flex items-center justify-center group`}>
                    
                    {/* Glassmorphism Mockup Element */}
                    <div className="absolute inset-x-8 bottom-0 h-3/4 bg-white/40 backdrop-blur-md border-t border-x border-white/60 rounded-t-2xl shadow-2xl transition-transform duration-700 group-hover:translate-y-2 flex flex-col p-6">
                      <div className="w-1/3 h-4 bg-white/60 rounded-full mb-4"></div>
                      <div className="w-full h-24 bg-white/50 rounded-xl mb-4"></div>
                      <div className="w-2/3 h-4 bg-white/60 rounded-full"></div>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================== */}
      {/* TRUST & SECURITY BANNER */}
      {/* ========================================== */}
      <section className="w-full bg-[#1E3A5F] text-white py-16 mt-20 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6 max-w-2xl">
            <div className="p-4 bg-white/10 rounded-2xl shrink-0">
              <ShieldCheck className="w-10 h-10 text-[#8ED8C3]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Bank-Grade Security & Privacy</h3>
              <p className="text-white/70 leading-relaxed">
                Your medical data is encrypted at rest and in transit. Lunága is built to meet stringent global healthcare compliance standards, ensuring your Care Timeline is for your eyes (and your doctor's eyes) only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* BOTTOM CTA SECTION */}
      {/* ========================================== */}
      <section className="container mx-auto px-6 py-32 md:px-12 text-center relative z-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl font-extrabold text-[#1E3A5F]">
            Ready to experience better care?
          </h2>
          <p className="text-xl text-[#1E3A5F]/70">
            Join thousands of patients who have already transformed how they manage their health.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
            <SignUpButton mode="modal">
              <Button size="lg" className="group h-14 rounded-full bg-[#1E3A5F] px-8 text-base font-bold text-white shadow-lg hover:bg-[#1E3A5F]/90 transition-all hover:scale-105">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </SignUpButton>
          </div>
        </div>
      </section>
      <LegalFooter className="bg-white border-t border-[#6FAEE7]/10" />
    </div>
  );
}