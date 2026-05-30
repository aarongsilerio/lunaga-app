import 'dotenv/config';
import { PrismaClient, Role, AppointmentStatus } from '@prisma/client';
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
  console.log('[PRISMA] Starting database seeding clean up...');
  
  // 1. Clean up existing data in reverse order of dependencies to avoid foreign key violations
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('[PRISMA] Database cleared. Inserting seed data...');

  // ==========================================
  // 2. SEED USERS (Clerk-style string IDs)
  // ==========================================
  
  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      id: 'user_clerkAdmin999',
      email: 'admin@lunaga.ph',
      role: Role.ADMIN,
      isApproved: true,
    },
  });

  // Doctor Users
  const docUser1 = await prisma.user.create({
    data: { id: 'user_clerkDoc001', email: 'dr.santos@lunaga.ph', role: Role.DOCTOR, isApproved: true },
  });
  const docUser2 = await prisma.user.create({
    data: { id: 'user_clerkDoc002', email: 'dr.reyes@lunaga.ph', role: Role.DOCTOR, isApproved: true },
  });
  const docUser3 = await prisma.user.create({
    data: { id: 'user_clerkDoc003', email: 'dr.cruz@lunaga.ph', role: Role.DOCTOR, isApproved: false }, // Pending approval
  });

  // Patient Users
  const patientUser1 = await prisma.user.create({
    data: { id: 'user_clerkPat001', email: 'juan.delacruz@gmail.com', role: Role.PATIENT, isApproved: true },
  });
  const patientUser2 = await prisma.user.create({
    data: { id: 'user_clerkPat002', email: 'maria.clara@gmail.com', role: Role.PATIENT, isApproved: true },
  });
  const patientUser3 = await prisma.user.create({
    data: { id: 'user_clerkPat003', email: 'elias.salvador@gmail.com', role: Role.PATIENT, isApproved: true },
  });

  // ==========================================
  // 3. SEED DOCTOR PROFILES
  // ==========================================
  const docProfile1 = await prisma.doctorProfile.create({
    data: {
      userId: docUser1.id,
      name: 'Dr. Alejandro Santos, MD',
      gender: 'Male',
      specialization: 'Cardiology',
      profilePicture: 'null', 
      subSpecializations: ['Interventional Cardiology', 'Echocardiography'],
      bio: 'Board-certified cardiologist dedicated to preventative cardiovascular wellness and advanced clinical interventions.',
      hmoAccreditations: ['Maxicare', 'MediCard', 'Intellicare'],
      phoneNumber: '+639171234567',
      roomNumber: 'Bldg A, Room 402',
      clinicDays: ['Monday', 'Wednesday', 'Friday'],
      clinicHours: 'AM',
      availability: [9.0, 10.0, 11.0],
      rating: 4.9,
      totalConsultations: 142,
    },
  });

  const docProfile2 = await prisma.doctorProfile.create({
    data: {
      userId: docUser2.id,
      name: 'Dr. Beatrice Reyes, MD',
      gender: 'Female',
      specialization: 'Pediatrics',
      profilePicture: 'null',
      subSpecializations: ['Pediatric Allergy', 'Neonatology'],
      bio: 'Compassionate pediatrician focusing on comprehensive developmental tracking and childhood immunological profiles.',
      hmoAccreditations: ['Maxicare', 'PhilHealth', 'Caritas Health Shield'],
      phoneNumber: '+639187654321',
      roomNumber: 'Bldg B, Room 215',
      clinicDays: ['Tuesday', 'Thursday'],
      clinicHours: 'PM',
      availability: [14.0, 15.3, 16.5],
      rating: 4.8,
      totalConsultations: 98,
    },
  });

  const docProfile3 = await prisma.doctorProfile.create({
    data: {
      userId: docUser3.id,
      name: 'Dr. Christian Cruz, MD',
      gender: 'Male',
      specialization: 'General Medicine',
      profilePicture: 'null',
      subSpecializations: [],
      bio: 'General practitioner prioritizing holistic family health, accessible primary diagnostics, and community triage care.',
      hmoAccreditations: ['MediCard'],
      phoneNumber: '+639192223333',
      roomNumber: 'Bldg A, Room 101',
      clinicDays: ['Saturday'],
      clinicHours: 'AM',
      availability: [8.0, 9.5],
      rating: 0.0,
      totalConsultations: 0,
    },
  });

  // ==========================================
  // 4. SEED PATIENT PROFILES
  // ==========================================
  const patProfile1 = await prisma.patientProfile.create({
    data: {
      userId: patientUser1.id,
      name: 'Juan Dela Cruz',
      birthday: new Date('1992-06-15T00:00:00Z'),
      sex: 'Male',
      contactNumber: '+639051112222',
      address: '123 Rizal Avenue, Taytay, Rizal',
      occupation: 'Software Engineer',
      profilePicture: 'null',
    },
  });

  const patProfile2 = await prisma.patientProfile.create({
    data: {
      userId: patientUser2.id,
      name: 'Maria Clara',
      birthday: new Date('1998-10-24T00:00:00Z'),
      sex: 'Female',
      contactNumber: '+639063334444',
      address: '456 Mabini St, Pasig City, Metro Manila',
      occupation: 'Graphic Designer',
      profilePicture: 'null',
    },
  });

  const patProfile3 = await prisma.patientProfile.create({
    data: {
      userId: patientUser3.id,
      name: 'Elias Salvador',
      birthday: new Date('1985-03-03T00:00:00Z'),
      sex: 'Male',
      contactNumber: '+639075556666',
      address: '789 Luna Compound, Antipolo, Rizal',
      occupation: 'Agricultural Coordinator',
      profilePicture: 'null',
    },
  });

  // ==========================================
  // 5. SEED MEDICAL RECORDS (EMR Blocks)
  // ==========================================
  await prisma.medicalRecord.create({
    data: {
      patientProfileId: patProfile1.id,
      medicalRecordNo: 'MRN-2026-0001',
      dateOfAdmission: new Date('2026-01-10T08:00:00Z'),
      weight: 74.5,
      height: 175.2,
      bloodType: 'O-Positive',
      ongoingConcerns: 'Occasional mild palpitations under elevated workloads.',
      allergies: 'Penicillin, Seafood',
      medicationHistory: 'Paracetamol 500mg as needed for occasional tension headaches.',
      pastMedicalHistory: ['Mild Asthma (Childhood)', 'Acute Gastritis (2024)'],
      pastSurgicalHistory: 'Appendectomy completed successfully in August 2019.',
      familyHistory: 'Paternal lineage presents history of Type 2 Diabetes and Hypertension.',
      personalHistory: 'Non-smoker, drinks socially, averages 3 cups of coffee daily.',
    },
  });

  await prisma.medicalRecord.create({
    data: {
      patientProfileId: patProfile2.id,
      medicalRecordNo: 'MRN-2026-0002',
      dateOfAdmission: null,
      weight: 52.0,
      height: 162.5,
      bloodType: 'A-Negative',
      ongoingConcerns: 'Seasonal allergic rhinitis triggered by high pollen counts.',
      allergies: 'Dust Mites, Pollen',
      medicationHistory: 'Cetirizine 10mg once daily during symptomatic flareups.',
      pastMedicalHistory: [],
      pastSurgicalHistory: 'No major surgical history recorded.',
      familyHistory: 'Maternal history of early-onset Breast Cancer.',
      personalHistory: 'Sedentary workspace profile, manages hydration carefully.',
    },
  });

  await prisma.medicalRecord.create({
    data: {
      patientProfileId: patProfile3.id,
      medicalRecordNo: 'MRN-2026-0003',
      dateOfAdmission: new Date('2026-04-20T14:30:00Z'),
      weight: 81.2,
      height: 180.0,
      bloodType: 'B-Positive',
      ongoingConcerns: 'Lower back stiffness following field operations.',
      allergies: 'None reported.',
      medicationHistory: 'Ibuprofen 400mg taken rarely for systemic joint inflammation.',
      pastMedicalHistory: ['Essential Hypertension (Diagnosed 2025)'],
      pastSurgicalHistory: 'Left knee arthroscopy completed in 2022.',
      familyHistory: 'Both maternal and paternal grandparents present severe hypertensive conditions.',
      personalHistory: 'Highly active outdoor lifestyle profile, avoids added processed dietary sugars.',
    },
  });

  // ==========================================
  // 6. SEED APPOINTMENTS
  // ==========================================
  await prisma.appointment.createMany({
    data: [
      {
        patientId: patProfile1.id,
        doctorId: docProfile1.id,
        datetime: new Date('2026-06-02T10:00:00Z'),
        status: 'SCHEDULED',
        meetingLink: 'room-lunaroom-abc123xyz',
        reason: 'Routine cardiovascular evaluation regarding stress-induced palpitations.',
      },
      {
        patientId: patProfile2.id,
        doctorId: docProfile2.id,
        datetime: new Date('2026-06-04T14:30:00Z'),
        status: 'PENDING',
        meetingLink: null,
        reason: 'Consultation booking request regarding seasonal immunology panel adjustments.',
      },
      {
        patientId: patProfile3.id,
        doctorId: docProfile1.id,
        datetime: new Date('2025-12-15T09:00:00Z'),
        status: 'COMPLETED',
        meetingLink: 'room-lunaroom-oldsession',
        reason: 'Initial blood pressure baseline analysis.',
        prescription: 'Amlodipine 5mg once daily every morning. Re-evaluate metrics in six months.',
      },
    ],
  });

  // ==========================================
  // 7. SEED NOTIFICATIONS
  // ==========================================
  await prisma.notification.createMany({
    data: [
      {
        userId: docUser1.id,
        message: 'New appointment scheduled by Juan Dela Cruz for June 2, 2026 at 10:00 AM.',
        isRead: false,
      },
      {
        userId: patientUser1.id,
        message: 'Your telehealth appointment slot with Dr. Alejandro Santos has been confirmed.',
        isRead: true,
      },
      {
        userId: docUser3.id,
        message: 'Your medical profile verification is currently under review by system administrators.',
        isRead: false,
      },
    ],
  });

  console.log('[PRISMA] Seeding transaction successfully finished!');
}

main()
  .catch((e) => {
    console.error('[PRISMA] Error occurred during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });