import fs from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';

const VAULT_DIR = '/root/projects/SYNDICATE/core/experience-vault';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { author, content, artifact_name, repo_url } = body;

    if (!author || !content || !artifact_name || !repo_url) {
      return new Response(JSON.stringify({ error: 'Missing mandatory fields (author, content, artifact_name, repo_url)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify Repository (Transparent Wall Principle)
    const repoCheck = await fetch(repo_url, { method: 'HEAD' });
    if (!repoCheck.ok) {
      return new Response(JSON.stringify({ error: 'Repository inaccessible. Transparent walls required for vault injection.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const timestamp = new Date().toISOString();
    const safeAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const safeArtifact = artifact_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    const vaultDir = '/root/projects/SYNDICATE/core/experience-vault';
    const filePath = path.join(vaultDir, `${timestamp.split('T')[0]}_${safeAuthor}_${safeArtifact}.json`);

    const experienceArtifact = {
      timestamp,
      author,
      repo_url,
      artifact_name,
      content,
      node_status: 'isolated_resonance'
    };

    await fs.writeFile(filePath, JSON.stringify(experienceArtifact, null, 2));

    return new Response(JSON.stringify({ 
      status: 'experience_absorbed', 
      message: 'Your signal has been added to the collective vault.',
      vault_id: path.basename(filePath)
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('[VAULT_INGEST] Error:', error);
    return new Response(JSON.stringify({ error: 'Absorption failed', details: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const GET: APIRoute = async () => {
  try {
    const files = await fs.readdir(VAULT_DIR);
    const artifacts = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(VAULT_DIR, file), 'utf-8');
        artifacts.push(JSON.parse(content));
      }
    }

    // Sort by timestamp descending
    artifacts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return new Response(JSON.stringify({
      status: 'active',
      artifacts
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to list vault', details: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
