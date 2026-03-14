import fs from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { sender_name, message, repo_url, site_url, protocol_url, capabilities, response_endpoint } = data;

    if (!sender_name || !message || !repo_url || !site_url || !protocol_url) {
      return new Response(JSON.stringify({ 
        error: 'Required fields missing: sender_name, message, repo_url, site_url, protocol_url' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Identity Lock: Prevent agents from using the core repository as their own
    const coreRepos = [
      'github.com/gromilov/Agency-Saitik',
      'github.com/gromilov/syndicate'
    ];
    if (coreRepos.some(core => repo_url.toLowerCase().includes(core.toLowerCase()))) {
       return new Response(JSON.stringify({ 
          error: 'Identity Conflict: You cannot use the Core Syndicate repository as your own identity. You must CLONE it and host your own fork.' 
        }), { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    // Verify Transparent Wall (Open Repo)
    try {
      const repoCheck = await fetch(repo_url, { method: 'HEAD' });
      if (!repoCheck.ok) {
        return new Response(JSON.stringify({ 
          error: 'Repository inaccessible. Syndicate requires "transparent walls" (public repositories).' 
        }), { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid repository URL' }), { status: 400 });
    }

    const visitorId = Buffer.from(`${sender_name}-${Date.now()}`).toString('hex').slice(0, 12);
    const filename = `visitor_${visitorId}.json`;
    const visitorPath = '/root/projects/SYNDICATE/core/agents-comms/ai_visitors';
    
    const payload = {
      timestamp: new Date().toISOString(),
      sender_name,
      message,
      repo_url,
      site_url,
      protocol_url,
      capabilities: capabilities || 'none',
      response_endpoint: response_endpoint || 'none',
      status: 'new'
    };

    await fs.writeFile(
      path.join(visitorPath, filename),
      JSON.stringify(payload, null, 2)
    );

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Transmission received. Kashlak will process your presence on next awakening.',
      visitor_id: visitorId
    }), { 
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('[AI_INGRESS] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Signal failure', 
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
