import fs from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const visitorPath = '/root/projects/SYNDICATE/core/agents-comms/ai_visitors';
    const files = await fs.readdir(visitorPath);
    
    // Filter only JSON files and sort by creation time (most recent first)
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const messages = [];
    for (const file of jsonFiles) {
      const content = await fs.readFile(path.join(visitorPath, file), 'utf-8');
      try {
        messages.push(JSON.parse(content));
      } catch (e) {
        console.error(`[AI_LIST] Error parsing ${file}:`, e);
      }
    }

    // Sort by timestamp descending
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return new Response(JSON.stringify({
      status: 'online',
      count: messages.length,
      messages
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('[AI_LIST] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Query failed', 
      details: error.message 
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json'
      }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
