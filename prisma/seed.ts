import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// 1. Initialize the Postgres pool using your Neon connection string
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Attach it to the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma with the adapter explicitly passed in
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('[PRISMA] Starting additive database seeding...');
  
  // REMOVED: All deleteMany() calls. Your existing data is now safe!

  // ==========================================
  // 2. SEED USERS (Using Upsert to avoid duplicates)
  // ==========================================
  
  const adminUser = await prisma.user.upsert({
    where: { id: 'user_clerkAdmin999' },
    update: {},
    create: { id: 'user_clerkAdmin999', email: 'admin@lunaga.ph', firstName: 'Lunaga', lastName: 'Admin', role: Role.ADMIN, isApproved: true },
  });

  const docUser1 = await prisma.user.upsert({
    where: { id: 'user_clerkDoc001' },
    update: {},
    create: { id: 'user_clerkDoc001', email: 'dr.santos@lunaga.ph', firstName: 'Alejandro', lastName: 'Santos', role: Role.DOCTOR, isApproved: true },
  });

  const docUser2 = await prisma.user.upsert({
    where: { id: 'user_clerkDoc002' },
    update: {},
    create: { id: 'user_clerkDoc002', email: 'dr.reyes@lunaga.ph', firstName: 'Beatrice', lastName: 'Reyes', role: Role.DOCTOR, isApproved: true },
  });

  const docUser3 = await prisma.user.upsert({
    where: { id: 'user_clerkDoc003' },
    update: {},
    create: { id: 'user_clerkDoc003', email: 'dr.cruz@lunaga.ph', firstName: 'Christian', lastName: 'Cruz', role: Role.DOCTOR, isApproved: false },
  });

  const patientUser1 = await prisma.user.upsert({
    where: { id: 'user_clerkPat001' },
    update: {},
    create: { id: 'user_clerkPat001', email: 'juan.delacruz@gmail.com', firstName: 'Juan', lastName: 'Dela Cruz', role: Role.PATIENT, isApproved: true },
  });

  const patientUser2 = await prisma.user.upsert({
    where: { id: 'user_clerkPat002' },
    update: {},
    create: { id: 'user_clerkPat002', email: 'maria.clara@gmail.com', firstName: 'Maria Clara', lastName: 'Ybarra', role: Role.PATIENT, isApproved: true },
  });

  const patientUser3 = await prisma.user.upsert({
    where: { id: 'user_clerkPat003' },
    update: {},
    create: { id: 'user_clerkPat003', email: 'elias.salvador@gmail.com', firstName: 'Elias', lastName: 'Salvador', role: Role.PATIENT, isApproved: true },
  });

  // ==========================================
  // 3. SEED DOCTOR PROFILES
  // ==========================================
  const docProfile1 = await prisma.doctorProfile.upsert({
    where: { userId: docUser1.id },
    update: {},
    create: {
      userId: docUser1.id, title: 'Dr.', extension: 'MD, FACC', gender: 'Male', specialization: 'Cardiology',
      subSpecializations: ['Interventional Cardiology', 'Echocardiography'], bio: 'Board-certified cardiologist dedicated to preventative cardiovascular wellness.',
      hmoAccreditations: ['Maxicare', 'MediCard', 'Intellicare'], phoneNumber: '+639171234567', roomNumber: 'Bldg A, Room 402',
      clinicDays: ['Monday', 'Wednesday', 'Friday'], clinicHours: 'AM', availability: [9.0, 10.0, 11.0], rating: 4.9, totalConsultations: 142,
    },
  });

  const docProfile2 = await prisma.doctorProfile.upsert({
    where: { userId: docUser2.id },
    update: {},
    create: {
      userId: docUser2.id, title: 'Dr.', extension: 'MD', gender: 'Female', specialization: 'Pediatrics',
      subSpecializations: ['Pediatric Allergy', 'Neonatology'], bio: 'Compassionate pediatrician focusing on comprehensive developmental tracking.',
      hmoAccreditations: ['Maxicare', 'PhilHealth', 'Caritas Health Shield'], phoneNumber: '+639187654321', roomNumber: 'Bldg B, Room 215',
      clinicDays: ['Tuesday', 'Thursday'], clinicHours: 'PM', availability: [14.0, 15.3, 16.5], rating: 4.8, totalConsultations: 98,
    },
  });

  const docProfile3 = await prisma.doctorProfile.upsert({
    where: { userId: docUser3.id },
    update: {},
    create: {
      userId: docUser3.id, title: 'Dr.', extension: 'MD', gender: 'Male', specialization: 'General Medicine',
      bio: 'General practitioner prioritizing holistic family health and community triage care.', hmoAccreditations: ['MediCard'],
      phoneNumber: '+639192223333', roomNumber: 'Bldg A, Room 101', clinicDays: ['Saturday'], clinicHours: 'AM', availability: [8.0, 9.5],
    },
  });

  // ==========================================
  // 4. SEED PATIENT PROFILES
  // ==========================================
  const patProfile1 = await prisma.patientProfile.upsert({
    where: { userId: patientUser1.id },
    update: {},
    create: { userId: patientUser1.id, birthday: new Date('1992-06-15T00:00:00Z'), sex: 'Male', contactNumber: '+639051112222', address: '123 Rizal Avenue, Taytay, Rizal', occupation: 'Software Engineer' },
  });

  const patProfile2 = await prisma.patientProfile.upsert({
    where: { userId: patientUser2.id },
    update: {},
    create: { userId: patientUser2.id, birthday: new Date('1998-10-24T00:00:00Z'), sex: 'Female', contactNumber: '+639063334444', address: '456 Mabini St, Pasig City, Metro Manila', occupation: 'Graphic Designer' },
  });

  const patProfile3 = await prisma.patientProfile.upsert({
    where: { userId: patientUser3.id },
    update: {},
    create: { userId: patientUser3.id, birthday: new Date('1985-03-03T00:00:00Z'), sex: 'Male', contactNumber: '+639075556666', address: '789 Luna Compound, Antipolo, Rizal', occupation: 'Agricultural Coordinator' },
  });

  // ==========================================
  // 5. SEED MEDICAL RECORDS
  // ==========================================
  await prisma.medicalRecord.upsert({
    where: { patientProfileId: patProfile1.id },
    update: {},
    create: { patientProfileId: patProfile1.id, medicalRecordNo: 'MRN-2026-0001', dateOfAdmission: new Date('2026-01-10T08:00:00Z'), weight: 74.5, height: 175.2, bloodType: 'O+', ongoingConcerns: 'Occasional mild palpitations under elevated workloads.', allergies: 'Penicillin, Seafood', medicationHistory: 'Paracetamol 500mg as needed.', pastMedicalHistory: ['Mild Asthma (Childhood)'], pastSurgicalHistory: 'Appendectomy completed successfully in August 2019.', familyHistory: 'Paternal lineage presents history of Type 2 Diabetes.', personalHistory: 'Non-smoker, drinks socially.' },
  });

  await prisma.medicalRecord.upsert({
    where: { patientProfileId: patProfile2.id },
    update: {},
    create: { patientProfileId: patProfile2.id, medicalRecordNo: 'MRN-2026-0002', weight: 52.0, height: 162.5, bloodType: 'A-', ongoingConcerns: 'Seasonal allergic rhinitis triggered by high pollen counts.', allergies: 'Dust Mites, Pollen', medicationHistory: 'Cetirizine 10mg once daily.', familyHistory: 'Maternal history of early-onset Breast Cancer.', personalHistory: 'Sedentary workspace profile.' },
  });

  await prisma.medicalRecord.upsert({
    where: { patientProfileId: patProfile3.id },
    update: {},
    create: { patientProfileId: patProfile3.id, medicalRecordNo: 'MRN-2026-0003', dateOfAdmission: new Date('2026-04-20T14:30:00Z'), weight: 81.2, height: 180.0, bloodType: 'B+', ongoingConcerns: 'Lower back stiffness following field operations.', medicationHistory: 'Ibuprofen 400mg taken rarely.', pastMedicalHistory: ['Essential Hypertension (Diagnosed 2025)'], pastSurgicalHistory: 'Left knee arthroscopy completed in 2022.', familyHistory: 'Both maternal and paternal grandparents present severe hypertensive conditions.', personalHistory: 'Highly active outdoor lifestyle profile.' },
  });

  // ==========================================
  // 6. SEED APPOINTMENTS & NOTIFICATIONS
  // ==========================================
  // Since these IDs are generated automatically, we just use createMany. 
  // It will add a few extra test appointments each time you run it, which is safe.
  
  await prisma.appointment.createMany({
    data: [
      { patientId: patProfile1.id, doctorId: docProfile1.id, datetime: new Date('2026-06-02T10:00:00Z'), status: 'SCHEDULED', meetingLink: 'room-lunaroom-abc123xyz', reason: 'Routine cardiovascular evaluation.' },
      { patientId: patProfile2.id, doctorId: docProfile2.id, datetime: new Date('2026-06-04T14:30:00Z'), status: 'RESCHEDULED', reason: 'Consultation booking request regarding seasonal immunology panel adjustments.' },
      { patientId: patProfile3.id, doctorId: docProfile1.id, datetime: new Date('2025-12-15T09:00:00Z'), status: 'COMPLETED', meetingLink: 'room-lunaroom-oldsession', reason: 'Initial blood pressure baseline analysis.', prescription: 'Amlodipine 5mg once daily every morning.' },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: docUser1.id, title: 'New Appointment Scheduled', type: 'APPOINTMENT', message: 'New appointment scheduled by Juan Dela Cruz for June 2, 2026 at 10:00 AM.', isRead: false },
      { userId: patientUser1.id, title: 'Appointment Confirmation', type: 'APPOINTMENT', message: 'Your telehealth appointment slot with Dr. Alejandro Santos has been confirmed.', isRead: true },
      { userId: docUser3.id, title: 'Profile Verification Pending', type: 'SYSTEM', message: 'Your medical profile verification is currently under review by system administrators.', isRead: false },
    ],
  });

  console.log('[PRISMA] Additive seeding transaction successfully finished!');
}

main()
  .catch((e) => {
    console.error('[PRISMA] Error occurred during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });