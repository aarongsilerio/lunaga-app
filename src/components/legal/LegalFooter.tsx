"use client";

import { useState } from "react";
import { TermsPrivacyModal } from "./TermsPrivacyModal";

interface LegalFooterProps {
  className?: string;
}

export function LegalFooter({ className = "" }: LegalFooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'terms' | 'privacy'>('terms');

  const openModal = (modalType: 'terms' | 'privacy') => {
    setType(modalType);
    setIsOpen(true);
  };

  return (
    <>
      <footer className={`w-full py-8 text-center flex flex-col md:flex-row items-center justify-center gap-4 text-sm font-semibold text-[#1E3A5F]/50 ${className}`}>
        <p>© {new Date().getFullYear()} Lunága. <span className="italic">All rights reserved.</span></p>
        <div className="hidden md:block text-[#1E3A5F]/30">•</div>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => openModal('terms')} 
            className="hover:text-[#6FAEE7] transition-colors"
          >
            Terms of Service
          </button>
          <span className="text-[#1E3A5F]/30">•</span>
          <button 
            type="button"
            onClick={() => openModal('privacy')} 
            className="hover:text-[#6FAEE7] transition-colors"
          >
            Privacy Policy
          </button>
        </div>
      </footer>

      <TermsPrivacyModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        type={type} 
      />
    </>
  );
}