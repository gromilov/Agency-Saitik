import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { systemState, workSessions } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { description } = await request.json();

    if (!description) {
      return new Response(JSON.stringify({ error: 'Description is required' }), { status: 400 });
    }

    const state = await db.query.systemState.findFirst({
      where: eq(systemState.id, 1)
    });

    if (!state || !state.activeTimerProjectId || !state.timerStartedAt) {
      return new Response(JSON.stringify({ error: 'No active timer found' }), { status: 404 });
    }

    const now = new Date();
    const start = state.timerStartedAt;
    const diffMs = now.getTime() - start.getTime();
    const rawMinutes = Math.round(diffMs / 60000);
    
    // Округление по правилу Кашлака (шаг 5 минут, минимум 5)
    const roundedMinutes = Math.max(5, Math.round(rawMinutes / 5) * 5);

    // Сохраняем сессию
    await db.insert(workSessions).values({
      projectId: state.activeTimerProjectId,
      description,
      minutes: roundedMinutes,
      date: now.toISOString().split('T')[0]
    });

    // Очищаем состояние таймера
    await db.update(systemState)
      .set({ activeTimerProjectId: null, timerStartedAt: null })
      .where(eq(systemState.id, 1));

    return new Response(JSON.stringify({ 
        success: true, 
        minutes: roundedMinutes,
        rawMinutes 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
