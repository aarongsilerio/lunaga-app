import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 1. Get the Webhook Secret from the environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('[API > Webhooks > Clerk ] Missing CLERK_WEBHOOK_SECRET in .env');
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  // 2. Extract the Svix headers required for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing svix headers', { status: 400 });
  }

  // 3. Parse the incoming raw body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 4. Verify the cryptographic signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('[API > Webhooks > Clerk ] Error verifying webhook signature:', err);
    return new NextResponse('Error: Invalid signature', { status: 400 });
  }

  // 5. Handle the specific events (e.g., user signs up)
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    const firstName = first_name || 'Patient';
    const lastName = last_name || '';

    try {
      // Inside your user.created event block:
      await prisma.user.create({
        data: {
          id: id, // Changed from clerkId: id
          email: email,
          firstName: firstName,
          lastName: lastName,
          profileImage: image_url,
          role: 'PATIENT', 
        },
      });

      console.log(`[API > Webhooks > Clerk ] Successfully created user in database: ${email}`);
    } catch (error) {
      console.error('[API > Webhooks > Clerk ] Error saving user to database:', error);
      return new NextResponse('Error saving user data', { status: 500 });
    }
  }

  // Acknowledge receipt to Clerk so it doesn't retry the ping
  return new NextResponse('Webhook processed successfully', { status: 200 });
}