import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { channelComments } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const comments = await db.query.channelComments.findMany({
      orderBy: [desc(channelComments.createdAt)],
      limit: 50
    });

    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API_COMMENTS] Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
