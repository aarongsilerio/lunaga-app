import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// 1. Initialize the Postgres pool using the Neon connection string
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Attach it to the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Create a singleton instance to prevent connection exhaustion in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;