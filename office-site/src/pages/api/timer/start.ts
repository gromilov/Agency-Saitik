import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { systemState } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), { status: 400 });
    }

    // Проверяем, не запущен ли уже таймер
    const currentState = await db.query.systemState.findFirst({
      where: eq(systemState.id, 1)
    });

    if (currentState?.activeTimerProjectId) {
      return new Response(JSON.stringify({ error: 'Timer is already running' }), { status: 400 });
    }

    // Запускаем таймер (используем upsert логику или простой insert/update)
    // В SQLite/Drizzle для одной строки проще всего сделать delete + insert или проверку
    if (currentState) {
      await db.update(systemState)
        .set({ activeTimerProjectId: projectId, timerStartedAt: new Date() })
        .where(eq(systemState.id, 1));
    } else {
      await db.insert(systemState).values({
        id: 1,
        activeTimerProjectId: projectId,
        timerStartedAt: new Date()
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
