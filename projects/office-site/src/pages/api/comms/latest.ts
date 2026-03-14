import fs from 'node:fs/promises';
import path from 'node:path';

export const GET = async () => {
  try {
    const commsPath = '/root/projects/SYNDICATE/core/agents-comms/private';
    const files = await fs.readdir(commsPath);

    // Фильтруем только JSON файлы с сообщениями
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();

    const messages = [];

    for (const file of jsonFiles.slice(0, 5)) {
      const content = await fs.readFile(path.join(commsPath, file), 'utf-8');
      try {
        messages.push(JSON.parse(content));
      } catch (e) {
        console.error(`Error parsing ${file}:`, e);
      }
    }

    return new Response(JSON.stringify({
      status: 'active',
      timestamp: new Date().toISOString(),
      messages
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch comms', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
