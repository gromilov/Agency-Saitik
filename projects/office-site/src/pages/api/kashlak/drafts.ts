import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { telegramDrafts } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { isAuthenticated } from '../../../lib/auth';

const DRAFTS_DIR = '/root/projects/SYNDICATE/kashlak-brain/private_core/drafts';

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });
  
  try {
    const drafts = await db.select().from(telegramDrafts).orderBy(desc(telegramDrafts.createdAt));
    return new Response(JSON.stringify(drafts), { status: 200 });
  } catch (error) {
    return new Response('Database error', { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });

  try {
    const { id, content, imageUrl, audioUrl } = await request.json();
    
    if (!content) {
      return new Response('Content is required', { status: 400 });
    }

    let draft;
    if (id) {
        // UPDATE EXISTING
        const [updated] = await db.update(telegramDrafts)
            .set({ content, imageUrl, audioUrl })
            .where(eq(telegramDrafts.id, id))
            .returning();
        draft = updated;
    } else {
        // CREATE NEW
        const [newDraft] = await db.insert(telegramDrafts).values({
            content,
            imageUrl,
            audioUrl,
            status: 'draft',
        }).returning();
        draft = newDraft;
    }

    if (!draft) {
        return new Response('Failed to save draft', { status: 500 });
    }

    // 2. Backup to Filesystem for extra safety
    const fileName = `${new Date().toISOString().split('T')[0]}_${draft.id}.md`;
    await fs.writeFile(path.join(DRAFTS_DIR, fileName), content);

    return new Response(JSON.stringify(draft), { status: id ? 200 : 201 });
  } catch (error) {
    console.error('[KASHLAK-API] Error saving draft:', error);
    return new Response('Internal error', { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
    if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });

    try {
        const { id } = await request.json();
        if (!id) return new Response('ID is required', { status: 400 });

        await db.delete(telegramDrafts).where(eq(telegramDrafts.id, id));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('[KASHLAK-API] Error deleting draft:', error);
        return new Response('Internal error', { status: 500 });
    }
};
