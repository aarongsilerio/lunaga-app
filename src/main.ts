import { prisma } from './db'

async function main() {
  // 1. CREATE: Create a User and their PatientProfile simultaneously
  const newUser = await prisma.user.create({
    data: {
      email: `alice-${Date.now()}@example.com`,
      password: 'hashed_secure_password_123', // Required by your schema
      role: 'PATIENT',
      patientProfile: {
        create: {
          name: 'Alice',
          birthday: new Date('1995-05-15T00:00:00Z'), // Required by your schema
          weight: 60.5,
          height: 165.0,
        },
      },
    },
    // Include the profile in the return object so we can see it
    include: {
      patientProfile: true, 
    },
  })
  console.log('Created user with profile:', newUser)

  // 2. READ: Fetch the user and include their related profile data
  const foundUser = await prisma.user.findUnique({ 
    where: { id: newUser.id },
    include: {
      patientProfile: true,
    }
  })
  console.log('\nFound user:', foundUser)

  // 3. UPDATE: Update the nested PatientProfile name
  const updatedUser = await prisma.user.update({
    where: { id: newUser.id },
    data: { 
      patientProfile: {
        update: {
          name: 'Alice Smith',
        }
      }
    },
    include: {
      patientProfile: true,
    }
  })
  console.log('\nUpdated user profile name:', updatedUser)

  // 4. DELETE: Deleting the User will cascade and delete the PatientProfile automatically
  // (Because of `onDelete: Cascade` in your schema)
  await prisma.user.delete({ 
    where: { id: newUser.id } 
  })
  console.log('\nDeleted user and associated profiles.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })