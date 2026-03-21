import fs from 'node:fs';
import type { APIRoute } from 'astro';

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
    
    if (!data.description || !data.contact) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const INBOX_PATH = '/root/syndicate/logs/nebula_inbox.json';
    let inbox = [];

    if (fs.existsSync(INBOX_PATH)) {
      try {
        inbox = JSON.parse(fs.readFileSync(INBOX_PATH, 'utf8'));
      } catch (e) {
        inbox = [];
      }
    }

    const newRequest = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...data,
      status: 'pending'
    };

    inbox.push(newRequest);
    fs.writeFileSync(INBOX_PATH, JSON.stringify(inbox, null, 2));

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: CORS_HEADERS
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { 
      status: 500,
      headers: CORS_HEADERS
    });
  }
};
