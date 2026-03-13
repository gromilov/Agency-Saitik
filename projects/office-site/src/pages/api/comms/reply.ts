import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { channelComments } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { sendTelegramMessage } from '../../../lib/telegram';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { commentId, replyText } = await request.json();

    if (!commentId || !replyText) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    // 1. Находим комментарий в БД, чтобы получить Telegram ID
    const comment = await db.query.channelComments.findFirst({
      where: eq(channelComments.id, commentId)
    });

    if (!comment) {
      return new Response(JSON.stringify({ error: 'Comment not found' }), { status: 404 });
    }

    // 2. Отправляем ответ в Telegram
    const token = import.meta.env.TELEGRAM_BOT_TOKEN;
    const discussionId = import.meta.env.DISCUSSION_CHAT_ID || import.meta.env.ADMIN_TELEGRAM_ID;

    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: discussionId,
        text: replyText,
        reply_to_message_id: parseInt(comment.telegramCommentId!),
        parse_mode: 'Markdown'
      })
    });

    const result = await res.json();

    if (!result.ok) {
      throw new Error(result.description);
    }

    // 3. Обновляем статус в нашей БД
    await db.update(channelComments)
      .set({
        status: 'replied',
        replyText: replyText,
        repliedAt: new Date()
      })
      .where(eq(channelComments.id, commentId));

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  } catch (error) {
    console.error('[API_REPLY] Ошибка:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
