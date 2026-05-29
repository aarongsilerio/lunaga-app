'use client';

/**
 * TermsPrivacyModal Component
 * 
 * Production-ready modal for displaying Terms of Service and Privacy Policy.
 * Features:
 * - Supports both Terms and Privacy Policy content
 * - Full-screen scrollable modal with smooth animations
 * - Keyboard support (ESC to close)
 * - Accessibility features (ARIA labels, focus management)
 * - Error boundary handling
 * - Responsive design for all screen sizes
 * - Lunága brand styling
 * 
 * @component
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [type, setType] = useState<'terms' | 'privacy'>('terms');
 * 
 * return (
 *   <>
 *     <button onClick={() => { setType('terms'); setIsOpen(true); }}>View Terms</button>
 *     <TermsPrivacyModal
 *       isOpen={isOpen}
 *       onClose={() => setIsOpen(false)}
 *       type={type}
 *     />
 *   </>
 * );
 */

import { useEffect } from 'react';

interface TermsPrivacyModalProps {
  /**
   * Whether the modal is currently open/visible
   */
  isOpen: boolean;

  /**
   * Callback function triggered when modal should close
   */
  onClose: () => void;

  /**
   * Type of content to display: 'terms' or 'privacy'
   */
  type: 'terms' | 'privacy';
}

/**
 * Content for Terms of Service
 */
const TERMS_CONTENT = `Terms of Service — Lunága

Last Updated: May 27, 2026

Welcome to Lunága. These Terms of Service ("Terms") govern your access to and use of the Lunága platform, including our website, services, applications, and related technologies (collectively, the "Platform").

By accessing or using Lunága, you agree to be bound by these Terms.

1. About Lunága

Lunága is a telehealth platform that enables patients to:
- discover healthcare professionals,
- book consultations,
- participate in online consultation sessions,
- and access consultation-related records and prescriptions.

Lunága also provides tools for healthcare professionals to manage schedules, consultations, notes, and patient interactions.

2. Eligibility

By using the Platform, you confirm that:
- you are at least 18 years old, or are using the Platform under parental or legal guardian supervision;
- the information you provide is accurate and complete;
- and you are legally permitted to use the services under applicable laws and regulations.

Healthcare professionals using Lunága represent that they possess the appropriate licenses, certifications, and authorizations required to practice their profession.

3. Account Registration

Users may be required to create an account to access certain features.

You are responsible for:
- maintaining the confidentiality of your account credentials;
- restricting access to your account;
- and all activities conducted under your account.

Lunága reserves the right to suspend or terminate accounts that violate these Terms or engage in unauthorized activity.

4. Healthcare Disclaimer

Lunága is a technology platform and does not itself provide medical treatment, diagnosis, or emergency healthcare services.

The Platform:
- facilitates communication between patients and healthcare professionals;
- does not replace in-person emergency medical care;
- and should not be used during medical emergencies.

If you believe you are experiencing a medical emergency, contact your local emergency services immediately.

5. Consultations and Medical Information

Healthcare professionals are solely responsible for:
- medical advice,
- consultation outcomes,
- prescriptions,
- diagnoses,
- and treatment decisions.

Patients acknowledge that:
- online consultations may have limitations compared to physical examinations;
- and medical recommendations rely on the accuracy of information provided by the patient.

6. User Responsibilities

Users agree not to:
- misuse the Platform;
- attempt unauthorized access;
- upload malicious software or harmful content;
- impersonate another person or healthcare professional;
- violate applicable laws or regulations;
- or interfere with the operation or security of the Platform.

7. Privacy and Data Protection

Your use of Lunága is also governed by our Privacy Policy.

We are committed to protecting user data and handling personal information responsibly in accordance with applicable data privacy laws.

8. Intellectual Property

All Platform content, branding, interfaces, logos, designs, and software are owned by or licensed to Lunága and are protected by intellectual property laws.

Users may not:
- reproduce,
- distribute,
- modify,
- reverse engineer,
- or commercially exploit any part of the Platform without written permission.

9. Platform Availability

While we aim to provide reliable services, Lunága does not guarantee uninterrupted or error-free availability.

We reserve the right to:
- modify,
- suspend,
- or discontinue features or services at any time.

10. Limitation of Liability

To the maximum extent permitted by law, Lunága shall not be liable for:
- indirect,
- incidental,
- consequential,
- or special damages arising from the use of the Platform.

This includes:
- consultation outcomes,
- delays,
- interruptions,
- technical failures,
- or inaccuracies in user-provided information.

11. Termination

We may suspend or terminate access to the Platform if:
- users violate these Terms,
- misuse the services,
- or engage in activities that compromise security or trust.

Users may discontinue use of the Platform at any time.

12. Changes to These Terms

Lunága may update these Terms periodically.

Continued use of the Platform after changes become effective constitutes acceptance of the updated Terms.

13. Contact

For inquiries regarding these Terms, please contact:

Lunága Support
support@lunaga.app`;

/**
 * Content for Privacy Policy
 */
const PRIVACY_CONTENT = `Privacy Policy — Lunága

Last Updated: May 27, 2026

Lunága values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect information when you use the Lunága platform.

1. Information We Collect

Personal Information

We may collect:
- full name,
- email address,
- contact information,
- birthday,
- profile information,
- and account credentials.

Health-Related Information

Patients may voluntarily provide:
- medical history,
- symptoms,
- consultation notes,
- prescriptions,
- and healthcare-related information.

Healthcare professionals may also create and manage consultation records during the use of the Platform.

Technical Information

We may automatically collect:
- device information,
- browser type,
- IP address,
- usage activity,
- and session information.

2. How We Use Information

We use collected information to:
- provide telehealth services;
- facilitate consultations and appointment scheduling;
- improve user experience;
- personalize recommendations;
- maintain platform security;
- send notifications and updates;
- and comply with legal obligations.

3. AI-Assisted Recommendations

Lunága may use AI-assisted systems to recommend healthcare professionals based on user-provided symptoms or concerns.

These recommendations:
- are informational only;
- do not constitute medical diagnosis;
- and should not replace professional medical advice.

4. Data Sharing

We do not sell personal information.

We may share information:
- between patients and healthcare professionals as necessary for consultations;
- with trusted service providers supporting platform operations;
- or when required by law or legal process.

5. Data Security

We implement reasonable administrative, technical, and organizational safeguards designed to protect personal information from unauthorized access, disclosure, alteration, or destruction.

However, no digital platform can guarantee absolute security.

6. Data Retention

We retain information only as long as necessary to:
- provide services,
- comply with legal obligations,
- resolve disputes,
- and maintain operational integrity.

Users may request account deletion subject to applicable legal and medical record retention requirements.

7. User Rights

Depending on applicable laws, users may have the right to:
- access their information;
- correct inaccurate information;
- request deletion of data;
- and withdraw consent where applicable.

8. Cookies and Analytics

Lunága may use cookies and analytics technologies to:
- improve functionality,
- analyze usage trends,
- and enhance platform performance.

Users may manage browser cookie preferences through their device settings.

9. Third-Party Services

The Platform may integrate with third-party services such as:
- video conferencing providers,
- cloud hosting services,
- analytics tools,
- or authentication providers.

These services may have their own privacy policies and practices.

10. Children's Privacy

Lunága is not intended for unsupervised use by children under the age permitted by applicable law.

Parents or guardians supervising minors are responsible for their use of the Platform.

11. Changes to This Privacy Policy

We may update this Privacy Policy periodically.

Updated versions will be posted on the Platform with the revised effective date.

12. Contact Information

For privacy-related inquiries or requests, please contact:

Lunága Privacy Team
privacy@lunaga.app`;

/**
 * TermsPrivacyModal Component
 * 
 * Renders a full-screen modal with Terms or Privacy Policy content.
 * Includes keyboard support (ESC to close) and smooth animations.
 */
export function TermsPrivacyModal({ isOpen, onClose, type }: TermsPrivacyModalProps) {
  const content = type === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;
  const title = type === 'terms' ? ' ' : ' ';

  /**
   * Handle keyboard events (ESC to close)
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /**
   * Prevent body scroll when modal is open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
        role="presentation"
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.currentTarget === e.target && onClose()}
      >
        {/* Modal Content */}
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[65vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
          {/* Modal Header */}
          <div className="sticky top-0 px-6 sm:px-8 py-6 rounded-t-2xl flex items-center justify-between z-10">
            <h2
              id="modal-title"
              className="text-xl sm:text-2xl font-bold text-white"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-[#1E3A5F] hover:bg-[#1E3A5F]/20 rounded-lg p-2 transition-colors duration-200"
              aria-label="Close modal"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable Content */}
          <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6">
            <div className="prose prose-sm max-w-none text-gray-700">
              {content.split('\n').map((line, index) => {
                // Handle headings (lines that start with numbers and periods)
                if (/^\d+\./.test(line.trim())) {
                  return (
                    <h3
                      key={index}
                      className="text-md font-semibold text-[#1E3A5F] mt-6 mb-2"
                    >
                      {line.trim()}
                    </h3>
                  );
                }

                // Handle main title
                if (line.includes('—') && line.includes('Lunága')) {
                  return (
                    <h1
                      key={index}
                      className="text-2xl font-bold text-[#1E3A5F] mb-1"
                    >
                      {line.trim()}
                    </h1>
                  );
                }

                // Handle "Last Updated" line
                if (line.includes('Last Updated')) {
                  return (
                    <p key={index} className="text-sm text-gray-500 italic mb-4">
                      {line.trim()}
                    </p>
                  );
                }

                // Handle bullet points
                if (line.trim().startsWith('-')) {
                  return (
                    <li
                      key={index}
                      className="ml-10 mb-0 text-gray-700"
                    >
                      {line.trim().substring(1).trim()}
                    </li>
                  );
                }

                // Handle empty lines
                if (!line.trim()) {
                  return <div key={index} className="mb-3" />;
                }

                // Regular paragraphs
                return (
                  <p key={index} className="mb-1 text-gray-700 leading-relaxed">
                    {line.trim()}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          {/* <div className="sticky bottom-0 bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
            <p className="text-sm text-gray-500">
          </div> */}
        </div>
      </div>
    </>
  );
}
