import { NextRequest } from "next/server";
import { Pool } from "pg";

// Use the DATABASE_URL provided by Vercel/Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

// Upsert user by clerkUserId
async function upsertUser({
  clerkUserId,
  email,
  firstName,
  lastName,
}: {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const client = await pool.connect();
  try {
    await client.query(
      `
      INSERT INTO users (clerk_user_id, email, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (clerk_user_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = CURRENT_TIMESTAMP
      `,
      [clerkUserId, email, firstName, lastName]
    );
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.type;
    const data = body.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkUserId = data.id;
      const email =
        data.email_addresses?.[0]?.email_address || data.email || "";
      const firstName = data.first_name || "";
      const lastName = data.last_name || "";

      if (!clerkUserId || !email) {
        return new Response("Missing user id or email", { status: 400 });
      }

      await upsertUser({ clerkUserId, email, firstName, lastName });
      return new Response("User upserted", { status: 200 });
    }

    // Optionally handle other event types
    return new Response("Event ignored", { status: 200 });
  } catch (err) {
    return new Response(
      `Webhook error: ${err instanceof Error ? err.message : String(err)}`,
      { status: 500 }
    );
  }
}
