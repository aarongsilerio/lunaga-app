# Lunaga: Modern Telehealth MVP
*Bridging the gap between patients and specialized care in the Philippines.*

**Live Application:** [https://lunaga-app-mpuu.vercel.app/](https://lunaga-app-mpuu.vercel.app/)

---

## Overview
Lunaga is a comprehensive telehealth platform built to streamline the healthcare journey. It enables patients to discover specialists via AI-assisted discovery, book real-time consultations, and maintain a centralized Electronic Medical Record (EMR). For doctors, it provides an efficient dashboard for managing daily schedules, patient consultations, and clinical documentation.

## How to Access the Platform

### 1. Registering as a Patient
1. Visit the live URL and click **"Sign Up"**.
2. After **Sign Up**, click **"Go to Dashboard"**.
3. Complete the registration.
4. You will be redirected to the Patient Dashboard where you can search for specialists and book appointments.

### 2. Registering as a Doctor
To test the Doctor flow, ensure you register a **brand-new account** to trigger the correct onboarding path:
1. Sign up as a new user.
2. On landing page, access [https://lunaga-app-mpuu.vercel.app/onboarding/doctor/](https://lunaga-app-mpuu.vercel.app/onboarding/doctor/). Make sure you are logged in.
3. **Critical:** You must complete the **Doctor Profile Settings** form in its entirety (including Specialization, Clinic Days, and Availability). 
4. Doctor accounts are subject for confirmation via Admin. (Disabled for now for testing)
5. After confirmation, you will be redirected to the **Doctor Dashboard**, where you can manage your proposed appointments and view your schedule.

---

## Tech Stack
* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Database & ORM:** PostgreSQL (Neon) & Prisma
* **Authentication:** Clerk
* **Styling:** Tailwind CSS & Shadcn/UI
* **Real-time:** Pusher (for appointment notifications)

---

## Key Features
* **Role-Based Onboarding:** Dynamic routing based on User Role (Patient vs. Doctor).
* **AI-Assisted Doctor Discovery:** Patients can search by specialty and sub-specialization.
* **Clinic Availability Matrix:** Doctors can set specific time slots and clinic days to prevent booking conflicts.
* **Appointment State Machine:** Handles `PROPOSED`, `SCHEDULED`, `RESCHEDULED`, and `COMPLETED` states using Prisma.
* **EMR & Prescription Ledger:** Integrated medical records accessible by doctors post-consultation.

---

## Technical Challenges & Future Roadmap
**Challenge:** During development, I performed a major database refactor to move `firstName` and `lastName` from profile tables to the root `User` table to centralize identity. This initially caused "Unknown" name display issues. I resolved this by implementing a **Defensive DTO (Data Transfer Object) mapping layer** on the Server Pages, ensuring names are always synthesized correctly before reaching the UI components.

**Future Roadmap:**
* **Video Integration:** Replace simulation links with a native WebRTC video interface.
* **Automated HMO Billing:** Auto-generate invoices based on consultation codes.
* **Advanced AI Triage:** Develop a symptom-checker chatbot to assist patients before they see a doctor.

---

## Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up environment variables (`DATABASE_URL`, `CLERK_SECRET_KEY`, etc.).
4. Run the development server: `npm run dev`