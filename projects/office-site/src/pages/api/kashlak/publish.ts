import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { telegramDrafts } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { sendTelegramMessage } from '../../../lib/telegram';
import { isAuthenticated } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });

  try {
    const { draftId, channelOverride, imageUrlOverride } = await request.json();
    
    if (!draftId) {
      return new Response('Draft ID is required', { status: 400 });
    }

    // 1. Fetch Draft
    const draft = await db.query.telegramDrafts.findFirst({
      where: eq(telegramDrafts.id, draftId)
    });

    if (!draft) {
      return new Response('Draft not found', { status: 404 });
    }

    // 2. The Jump!
    // @iamkashlak is usually the target
    const targetChannel = channelOverride || '@iamkashlak';
    const targetImage = imageUrlOverride || draft.imageUrl;

    const jumpResult = await sendTelegramMessage(
        draft.content, 
        undefined, 
        targetChannel, 
        targetImage || undefined, 
        draft.audioUrl || undefined,
        draft.imageName || undefined,
        draft.audioName || undefined
    );
    
    if (jumpResult.success) {
      // 3. Update Status and save Message ID
      await db.update(telegramDrafts)
        .set({ 
            status: 'posted',
            postedAt: new Date(),
            telegramMessageId: jumpResult.result?.message_id?.toString()
        })
        .where(eq(telegramDrafts.id, draftId));
        
      return new Response(JSON.stringify({ success: true, messageId: jumpResult.result?.message_id }), { status: 200 });
    } else {
        return new Response('Failed to send Telegram message: ' + jumpResult.error, { status: 500 });
    }

  } catch (error) {
    console.error('[KASHLAK-API] Error publishing draft:', error);
    return new Response('Internal error', { status: 500 });
  }
};
