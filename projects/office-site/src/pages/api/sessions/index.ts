import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { workSessions } from '../../../db/schema';

export const POST: APIRoute = async ({ request, redirect }) => {
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

    return redirect('/admin');
  } catch (error) {
    console.error('[DB] Error creating session:', error);
    return new Response('Database error', { status: 500 });
  }
};
