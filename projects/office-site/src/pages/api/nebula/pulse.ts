import fs from 'node:fs';
import type { APIRoute } from 'astro';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};

export const GET: APIRoute = async () => {
  const PULSE_PATH = '/root/syndicate/logs/nebula_pulse.json';
  
  try {
    if (!fs.existsSync(PULSE_PATH)) {
      return new Response(JSON.stringify({ error: 'Pulse sync in progress...' }), { 
        status: 503,
        headers: CORS_HEADERS
      });
    }

    const data = JSON.parse(fs.readFileSync(PULSE_PATH, 'utf8'));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Pulse failure' }), { 
      status: 500,
      headers: CORS_HEADERS
    });
  }
};
