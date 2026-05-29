import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/**
 * Marketing Layout
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7FAFC] font-sans text-[#1E3A5F]">
      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 w-full border-b border-[#6FAEE7]/20 bg-[#F7FAFC]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-12">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Image 
              src="/nav-logo.png" 
              alt="Lunága Logo" 
              width={109} 
              height={32}
              priority
            />
          </Link>

          {/* Authentication & User Controls */}
          <div className="flex items-center gap-4">
            
            {/* Displayed only when the user is NOT logged in */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-[#1E3A5F] hover:bg-[#6FAEE7]/10 hover:text-[#1E3A5F]">
                  Log in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="rounded-full bg-[#1E3A5F] px-6 text-white hover:bg-[#1E3A5F]/90 shadow-sm transition-all">
                  Sign up
                </Button>
              </SignUpButton>
            </Show>

            {/* Displayed only when the user IS logged in */}
            <Show when="signed-in">
              <Link href="/patient/dashboard">
                <Button variant="outline" className="mr-2 rounded-full border-[#6FAEE7]/30 text-[#1E3A5F] hover:bg-[#6FAEE7]/10">
                  Go to Dashboard
                </Button>
              </Link>
              <UserButton />
            </Show>
            
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-[#6FAEE7]/20 bg-white py-8">
        <div className="container mx-auto px-6 text-center text-sm text-[#1E3A5F]/60 md:px-12">
          <p>© {new Date().getFullYear()} Lunága. <span className="italic">Care, Wherever You Are.</span></p>
        </div>
      </footer>
    </div>
  );
}