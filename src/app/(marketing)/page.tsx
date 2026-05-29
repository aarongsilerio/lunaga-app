import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignUpButton } from "@clerk/nextjs";
import { HeartPulse, MessageCircle, Stethoscope } from "lucide-react";

/**
 * Feature Data Configuration
 */
const platformFeatures = [
  {
    title: "LunaMatch",
    description: "Our symptom-based recommendation engine intelligently connects you with the right specialist, removing the guesswork from healthcare.",
    icon: <Stethoscope className="h-6 w-6 text-[#6FAEE7]" />,
  },
  {
    title: "LunaRoom",
    description: "A calm, secure virtual consultation space designed to make talking to your doctor feel natural, private, and deeply human.",
    icon: <MessageCircle className="h-6 w-6 text-[#8ED8C3]" />, // Soft Mint accent
  },
  {
    title: "Care Timeline",
    description: "Forget scattered medical records. View your entire health journey in a clear, chronologically reassuring timeline.",
    icon: <HeartPulse className="h-6 w-6 text-[#C6B7FF]" />, // Gentle Lavender accent
  },
];

/**
 * Marketing Landing Page
 */
export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      
      {/* 
        HERO SECTION
      */}
      <section className="container mx-auto flex min-h-[75vh] flex-col items-center justify-center px-6 text-center md:px-12">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-in-out">
          
          <div className="inline-flex items-center rounded-full bg-[#6FAEE7]/10 px-4 py-1.5 text-sm font-medium text-[#1E3A5F]">
            <span className="flex h-2 w-2 rounded-full bg-[#8ED8C3] mr-2"></span>
            AI-Assisted Telehealth Platform
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-[#1E3A5F] sm:text-6xl md:text-7xl lg:leading-[1.1]">
            Healthcare That <br />
            <span className="text-[#6FAEE7]">Feels Closer.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-[#1E3A5F]/80 md:text-xl leading-relaxed">
            Book consultations, connect with doctors, and receive personalized care from anywhere through Lunága’s calm, intelligent telehealth experience.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
            <SignUpButton mode="modal">
              <Button size="lg" className="h-14 rounded-full bg-[#1E3A5F] px-8 text-base font-medium text-white shadow-md hover:bg-[#1E3A5F]/90 transition-transform hover:scale-105">
                Find Your Doctor
              </Button>
            </SignUpButton>
            <Button size="lg" variant="outline" className="h-14 rounded-full border-[#6FAEE7]/30 bg-transparent px-8 text-base font-medium text-[#1E3A5F] hover:bg-[#6FAEE7]/10">
              Learn How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* 
        FEATURES SECTION 
      */}
      <section className="w-full bg-white py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-[#1E3A5F] md:text-4xl">
              Care, Wherever You Are.
            </h2>
            <p className="mt-4 text-[#1E3A5F]/70 text-lg">
              Most telehealth apps focus only on transactions. Lunága focuses on emotional comfort and intelligent care guidance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {platformFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="group border-[#6FAEE7]/10 bg-[#F7FAFC] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ease-out border-none"
              >
                <CardContent className="p-8 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F]">
                    {feature.title}
                  </h3>
                  <p className="text-[#1E3A5F]/70 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}