import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { systemState } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../../../lib/auth';

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });

  try {
    const state = await db.query.systemState.findFirst({
      where: eq(systemState.id, 1)
    });

    if (!state || !state.activeTimerProjectId || !state.timerStartedAt) {
      return new Response(JSON.stringify({ active: false, projectId: null, elapsedSeconds: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const elapsedSeconds = Math.floor((new Date().getTime() - state.timerStartedAt.getTime()) / 1000);

    return new Response(JSON.stringify({ 
      active: true, 
      projectId: state.activeTimerProjectId, 
      elapsedSeconds 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
