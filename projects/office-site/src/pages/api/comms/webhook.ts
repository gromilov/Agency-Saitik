import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { channelComments } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    console.log('[WEBHOOK] Получено обновление:', JSON.stringify(payload, null, 2));

    const message = payload.message || payload.edited_message;
    const channelPost = payload.channel_post;

    if (!message && !channelPost) {
      console.log('[WEBHOOK] Неизвестный тип обновления (ни message, ни channel_post)');
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (channelPost) {
       console.log('[WEBHOOK] Сигнал из канала (channel_post):', {
         postId: channelPost.message_id,
         chatTitle: channelPost.chat?.title,
         text: channelPost.text?.substring(0, 20) + '...'
       });
       return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    console.log('[WEBHOOK] Анализ сообщения в группе:', {
      chatId: message.chat?.id,
      chatType: message.chat?.type,
      from: message.from?.username,
      hasReply: !!message.reply_to_message,
      replyToId: message.reply_to_message?.message_id
    });

    if (!message.text) {
      console.log('[WEBHOOK] Текст сообщения отсутствует');
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // Проверяем, является ли сообщение комментарием
    // В Telegram комментарии в канале приходят в привязанный чат как ответы
    // на пересланные сообщения из канала.
    // Упрощаем для теста: любой ответ в супергруппе/группе — потенциальный комментарий
    const isComment = message.reply_to_message && 
                     (message.chat?.type === 'supergroup' || message.chat?.type === 'group');

    if (isComment) {
      console.log('[WEBHOOK] Идентифицирован как комментарий');
      const postId = message.reply_to_message.forward_from_message_id || message.reply_to_message.message_id;
      const commentId = message.message_id.toString();
      const userName = message.from?.first_name || message.from?.username || 'Anonymous';
      const text = message.text;

      // Сохраняем в БД
      await db.insert(channelComments).values({
        telegramPostId: postId.toString(),
        telegramCommentId: commentId,
        fromUser: userName,
        text: text,
        status: 'pending',
      }).onConflictDoUpdate({
        target: channelComments.telegramCommentId,
        set: { text: text }
      });

      console.log(`[WEBHOOK] Сохранен комментарий от ${userName} к посту ${postId}`);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK] Ошибка обработки:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
