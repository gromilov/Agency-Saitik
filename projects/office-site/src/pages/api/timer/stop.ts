import fs from 'node:fs';
import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { systemState, workSessions, projects } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });

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

    // Получаем данные проекта для расчета стоимости
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, state.activeTimerProjectId)
    });

    const hourlyRate = project?.hourlyRate || 0;
    const earned = Math.round((roundedMinutes / 60) * hourlyRate);

    // Сохраняем сессию
    await db.insert(workSessions).values({
      projectId: state.activeTimerProjectId,
      description,
      minutes: roundedMinutes,
      date: now.toISOString().split('T')[0]
    });

    // Логируем Генерацию Ценности в Монолог Синдиката
    const logPath = '/root/projects/SYNDICATE/core/memory/monologue.log';
    const logEntry = `[${now.toISOString()}] [VALUE_GEN] Проект: ${project?.name}. Сессия: "${description}". Длительность: ${roundedMinutes} мин. Заработано: ${earned} RUB. 💰🏗️\n`;
    try {
        fs.appendFileSync(logPath, logEntry);
    } catch (e) {
        console.error('Failed to write to Syndicate log');
    }

    // Очищаем состояние таймера
    await db.update(systemState)
      .set({ activeTimerProjectId: null, timerStartedAt: null })
      .where(eq(systemState.id, 1));

    return new Response(JSON.stringify({ 
        success: true, 
        minutes: roundedMinutes,
        earned,
        currency: project?.currency || 'RUB',
        rawMinutes 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
