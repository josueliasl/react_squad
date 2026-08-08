import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type !== 'user.created') {
      return new Response('Event ignored', { status: 200 });
    }

    const { id: clerkId, first_name, last_name, email_addresses } = evt.data;

    const email = email_addresses[0]?.email_address;
    if (!email) {
      console.error('Clerk user has no email address:', clerkId);
      return new Response('User email is required', { status: 400 });
    }

    const nameParts = [first_name, last_name].filter(Boolean);
    const name = nameParts.join(' ').trim() || email.split('@')[0];

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE clerk_id = $1 OR email = $2
      LIMIT 1;
      `,
      [clerkId, email]
    );

    if (existingUser.rows.length > 0) {
      await pool.query(
        `
        UPDATE users
        SET clerk_id = $1,
            name = $2,
            email = $3,
            role = 'customer'
        WHERE id = $4;
        `,
        [clerkId, name, email, existingUser.rows[0].id]
      );
    } else {
      await pool.query(
        `
        INSERT INTO users (
          clerk_id,
          name,
          email,
          role
        )
        VALUES ($1, $2, $3, 'customer');
        `,
        [clerkId, name, email]
      );
    }

    console.log(`Clerk user synchronized successfully: ${clerkId}`);

    return new Response('User synchronized', { status: 200 });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return new Response('Webhook verification failed', { status: 400 });
  }
}