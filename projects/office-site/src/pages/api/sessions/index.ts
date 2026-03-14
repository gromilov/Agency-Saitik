import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { workSessions } from '../../../db/schema';
import { isAuthenticated } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });

  const formData = await request.formData();
  const description = formData.get('description') as string;
  const projectId = formData.get('projectId') as string;
  const minutes = parseInt(formData.get('minutes') as string) || 0;
  const date = formData.get('date') as string || new Date().toISOString().split('T')[0];

  if (!description || !projectId || !minutes) {
    return new Response('All fields are required', { status: 400 });
  }

  try {
    await db.insert(workSessions).values({
      description,
      projectId,
      minutes,
      date,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[DB] Error creating session:', error);
    return new Response(`Database error: ${error.message || error}`, { status: 500 });
  }
};
