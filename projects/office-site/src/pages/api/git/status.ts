import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { APIRoute } from 'astro';

const execAsync = promisify(exec);

export const GET: APIRoute = async () => {
  try {
    // Current directory is where the server runs, we need the root of SYNDICATE
    const cwd = '/root/projects/SYNDICATE';
    
    // 1. Get current branch
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd });
    
    // 2. Get last commit short hash
    const { stdout: hash } = await execAsync('git rev-parse --short HEAD', { cwd });
    
    // 3. Get last commit message
    const { stdout: message } = await execAsync('git log -1 --pretty=%B', { cwd });
    
    // 4. Check for uncommitted changes
    const { stdout: status } = await execAsync('git status --porcelain', { cwd });
    const hasUncommitted = status.trim().length > 0;
    
    // 5. Get last sync time (approximate, based on last fetch or push)
    const { stdout: lastSync } = await execAsync('git log -1 --format=%cd --date=iso', { cwd });

    return new Response(JSON.stringify({
      status: 'online',
      branch: branch.trim(),
      hash: hash.trim(),
      lastCommit: message.trim(),
      isDirty: hasUncommitted,
      lastSync: lastSync.trim(),
      node: 'OFFICE_NODE_01'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('[GIT_STATUS] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Query failed', 
      details: error.message 
    }), { 
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
