import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { isAuthenticated } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'image' | 'audio';

    if (!file || !type) {
      return new Response('File and type are required', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || (type === 'image' ? '.jpg' : '.mp3');
    
    // Transliteration helper for Russian names
    const translit = (str: string) => {
        const ru = {
            'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'e', 'ж':'zh', 'з':'z', 'и':'i', 'й':'y', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'h', 'ц':'c', 'ч':'ch', 'ш':'sh', 'щ':'shch', 'ъ':'', 'ы':'y', 'ь':'', 'э':'e', 'ю':'yu', 'я':'ya'
        };
        return str.toLowerCase().split('').map(c => (ru as any)[c] || c).join('');
    };

    const transcoded = translit(path.basename(file.name, fileExt));
    const originalBase = transcoded.replace(/[^a-z0-9_-]/gi, '_').replace(/_{2,}/g, '_').replace(/^_|_$/g, '').substring(0, 30) || 'upload';
    const fileName = `${originalBase}_${nanoid(4)}${fileExt}`;
    
    const subDir = type === 'image' ? 'private_images' : 'private_audio';
    const uploadDir = path.join(process.cwd(), 'public', subDir);
    
    // Ensure dir exists
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicPath = `/${subDir}/${fileName}`;
    
    return new Response(JSON.stringify({ 
      success: true, 
      url: publicPath,
      originalName: file.name
    }), { status: 200 });

  } catch (error) {
    console.error('[UPLOAD-API] Error saving file:', error);
    return new Response('Internal error', { status: 500 });
  }
};
