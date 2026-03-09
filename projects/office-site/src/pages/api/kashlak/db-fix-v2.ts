import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    await db.run(sql`ALTER TABLE telegram_drafts ADD COLUMN image_url text;`);
    return new Response('Database updated with image_url column.', { status: 200 });
  } catch (error) {
    return new Response('Error (probably already exists): ' + (error as Error).message, { status: 200 });
  }
};
