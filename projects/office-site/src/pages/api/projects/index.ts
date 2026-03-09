import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { projects } from '../../../db/schema';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const clientId = formData.get('clientId') as string;
  const hourlyRate = parseInt(formData.get('hourlyRate') as string) || 0;
  const currency = formData.get('currency') as string || 'RUB';

  if (!name || !clientId) {
    return new Response('Name and Client are required', { status: 400 });
  }

  try {
    await db.insert(projects).values({
      name,
      clientId,
      hourlyRate,
      currency,
    });

    return redirect('/admin');
  } catch (error) {
    console.error('[DB] Error creating project:', error);
    return new Response('Database error', { status: 500 });
  }
};
