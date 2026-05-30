import { prisma } from './db'

async function main() {
  // 1. CREATE: Create a User, PatientProfile, and MedicalRecord simultaneously
  const newUser = await prisma.user.create({
    data: {
      id: `mock_clerk_id_${Date.now()}`, // We mock a string ID since Clerk handles real auth
      email: `alice-${Date.now()}@example.com`,
      role: 'PATIENT',
      firstName: 'Alice',  // <-- Identity fields live on the User table now
      lastName: 'Smith',
      patientProfile: {
        create: {
          birthday: new Date('1995-05-15T00:00:00Z'),
          sex: 'Female', 
          medicalRecord: { // <-- Clinical fields live in the nested MedicalRecord table
            create: {
              weight: 60.5,
              height: 165.0,
            },
          },
        },
      },
    },
    // Include the nested relations so we can see them in the console log
    include: {
      patientProfile: {
        include: { medicalRecord: true }
      }, 
    },
  })
  console.log('Created user with profile:', newUser)

  // 2. READ: Fetch the user and include their nested profile and medical data
  const foundUser = await prisma.user.findUnique({ 
    where: { id: newUser.id },
    include: {
      patientProfile: {
        include: { medicalRecord: true }
      },
    }
  })
  console.log('\nFound user:', foundUser)

  // 3. UPDATE: Update the Identity and Nested Records
  const updatedUser = await prisma.user.update({
    where: { id: newUser.id },
    data: { 
      lastName: 'Johnson', // <-- Name updates happen on the User table directly!
      patientProfile: {
        update: {
          medicalRecord: {
            update: {
              weight: 61.0 // <-- Vitals update on the MedicalRecord table
            }
          }
        }
      }
    },
    include: {
      patientProfile: {
        include: { medicalRecord: true }
      },
    }
  })
  console.log('\nUpdated user profile:', updatedUser)

  // 4. DELETE: Deleting the User will cascade and delete the PatientProfile and MedicalRecord automatically
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