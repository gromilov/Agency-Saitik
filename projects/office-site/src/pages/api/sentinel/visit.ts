import type { APIRoute } from 'astro';
import { sendTelegramMessage } from '../../../lib/telegram';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { site, path, referrer, userAgent } = data;

    if (!site || !path) {
      return new Response(JSON.stringify({ error: 'Missing site or path' }), { status: 400 });
    }

    const emoji = site.includes('syndicate') ? '⚓' : 
                  site.includes('cortex') ? '🧠' :
                  site.includes('nebula') ? '🛡️' :
                  site.includes('kashlak') ? '🐈‍⬛' : '🌐';

    const message = `${emoji} *[SENTINEL]* Посетитель на *${site}*\n` +
                    `📍 Путь: \`${path}\`\n` +
                    (referrer ? `🔗 Реферер: \`${referrer}\`\n` : '') +
                    `📱 Устройство: \`${userAgent || 'Unknown'}\``;

    const result = await sendTelegramMessage(message);

    return new Response(JSON.stringify({ success: true, tg: result.success }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      }
    });
  } catch (error) {
    console.error('[SENTINEL] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
