import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignUpButton } from "@clerk/nextjs";
import { HeartPulse, MessageCircle, Stethoscope, ArrowRight, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { LegalFooter } from "@/components/legal/LegalFooter";

/**
 * Feature Data Configuration
 */
const platformFeatures = [
  {
    title: "LunaMatch",
    description: "Our symptom-based recommendation engine intelligently connects you with the right specialist, removing the guesswork from healthcare.",
    icon: <Stethoscope className="h-6 w-6 text-[#6FAEE7]" />,
    bgClass: "bg-[#6FAEE7]/10",
  },
  {
    title: "LunaRoom",
    description: "A calm, secure virtual consultation space designed to make talking to your doctor feel natural, private, and deeply human.",
    icon: <MessageCircle className="h-6 w-6 text-[#8ED8C3]" />,
    bgClass: "bg-[#8ED8C3]/10",
  },
  {
    title: "Care Timeline",
    description: "Forget scattered medical records. View your entire health journey in a clear, chronologically reassuring timeline.",
    icon: <HeartPulse className="h-6 w-6 text-[#C6B7FF]" />,
    bgClass: "bg-[#C6B7FF]/10",
  },
];

/**
 * Marketing Landing Page
 */
export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden relative">
      
      {/* ========================================== */}
      {/* AMBIENT BACKGROUND GLOWS */}
      {/* ========================================== */}
      <div className="absolute top-0 -z-10 h-screen w-full bg-[#F7FAFC]">
        <div className="absolute top-0 right-0 h-150 w-150 translate-y-[-10%] translate-x-[20%] rounded-full bg-[#6FAEE7]/20 opacity-60 blur-[100px]"></div>
        <div className="absolute top-[20%] left-0 h-125 w-125 translate-x-[-30%] rounded-full bg-[#8ED8C3]/20 opacity-50 blur-[100px]"></div>
      </div>

      {/* ========================================== */}
      {/* HERO SECTION */}
      {/* ========================================== */}
      <section className="container mx-auto flex min-h-[85vh] flex-col items-center justify-center px-6 text-center md:px-12 relative z-10">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out mt-12">
          
          {/* Top Badge */}
          <div className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-bold text-[#1E3A5F] shadow-sm border border-[#6FAEE7]/20 transition-transform hover:scale-105 cursor-default">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#8ED8C3] mr-2.5 animate-pulse"></span>
            AI-Assisted Telehealth Platform
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl font-extrabold tracking-tight text-[#1E3A5F] sm:text-6xl md:text-7xl lg:leading-[1.15]">
            Healthcare That <br />
            <span className="bg-linear-to-r from-[#6FAEE7] to-[#8ED8C3] bg-clip-text text-transparent drop-shadow-sm">
              Feels Closer.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-lg text-[#1E3A5F]/70 md:text-xl leading-relaxed font-medium">
            Book consultations, connect with doctors, and receive personalized care from anywhere through Lunága’s calm, intelligent telehealth experience.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-6">
            <SignUpButton mode="modal">
              <Button size="lg" className="group h-14 rounded-full bg-[#1E3A5F] px-8 text-base font-bold text-white shadow-lg shadow-[#1E3A5F]/20 hover:bg-[#1E3A5F]/90 transition-all hover:scale-105">
                Find Your Doctor
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </SignUpButton>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="h-14 rounded-full border-[#6FAEE7]/30 bg-white/50 backdrop-blur-sm px-8 text-base font-bold text-[#1E3A5F] shadow-sm hover:bg-white transition-all">
                Learn How It Works
              </Button>
            </Link>
            
          </div>

          {/* Social Proof / Trust Indicators */}
          <div className="pt-12 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-1000 delay-300">
            <div className="flex -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=1')] bg-cover"></div>
              <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=2')] bg-cover"></div>
              <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=3')] bg-cover"></div>
              <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=4')] bg-cover"></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#F7FAFC] text-xs font-bold text-[#1E3A5F]">
                5k+
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-1 text-amber-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="text-sm font-medium text-[#1E3A5F]/60 mt-1">Trusted by patients nationwide</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* FEATURES SECTION */}
      {/* ========================================== */}
      <section className="w-full bg-white py-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="mb-20 text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-[#6FAEE7]/10 rounded-2xl mb-2 text-[#6FAEE7]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1E3A5F] md:text-4xl">
              Care, Wherever You Are.
            </h2>
            <p className="text-[#1E3A5F]/70 text-lg leading-relaxed">
              Most telehealth apps focus only on transactions. Lunága focuses on emotional comfort and intelligent care guidance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {platformFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-[#6FAEE7]/10 bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                {/* Top Gradient Border on Hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#6FAEE7] to-[#8ED8C3] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardContent className="p-8 space-y-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-[#1E3A5F]/70 leading-relaxed font-medium text-sm md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>
      <LegalFooter className="bg-white border-t border-[#6FAEE7]/10" />
      
    </div>
  );
}