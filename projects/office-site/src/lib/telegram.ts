import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';

export async function sendTelegramMessage(message: string, button?: { text: string, url: string }, chatId?: string, imageUrl?: string, audioUrl?: string) {
  const token = import.meta.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = import.meta.env.ADMIN_TELEGRAM_ID;

  const targetChatId = chatId || adminChatId;

  if (!token || !targetChatId) {
    console.error('[TELEGRAM] Отсутствуют настройки BOT_TOKEN или ChatID');
    return { success: false, error: 'Missing configuration' };
  }

  // Определяем метод
  let method = 'sendMessage';
  if (audioUrl) method = 'sendAudio';
  else if (imageUrl) method = 'sendPhoto';

  const url = `https://api.telegram.org/bot${token}/${method}`;
  
  // Создаем FormData если это локальный файл
  const isLocalImage = imageUrl && imageUrl.startsWith('/');
  const isLocalAudio = audioUrl && audioUrl.startsWith('/');
  
  let body: any;
  let headers: any = { 'Content-Type': 'application/json' };

  if (isLocalImage || isLocalAudio) {
    const formData = new FormData();
    formData.append('chat_id', targetChatId);
    formData.append('parse_mode', 'Markdown');
    formData.append('caption', message);
    
    if (isLocalImage) {
      const filePath = path.join(process.cwd(), 'public', imageUrl!);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const blob = new Blob([fileBuffer]);
        formData.append(audioUrl ? 'thumbnail' : 'photo', blob, path.basename(filePath));
      }
    }

    if (isLocalAudio) {
      const filePath = path.join(process.cwd(), 'public', audioUrl!);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const blob = new Blob([fileBuffer]);
        formData.append('audio', blob, path.basename(filePath));
        body = formData;
        headers = {};
      }
    } else if (isLocalImage) {
        body = formData;
        headers = {};
    }
  } else {
    body = JSON.stringify({
      chat_id: targetChatId,
      parse_mode: 'Markdown',
      ...(audioUrl ? { audio: audioUrl, caption: message, thumb: imageUrl } : 
         (imageUrl ? { photo: imageUrl, caption: message } : { text: message })),
      ...(button ? { reply_markup: { inline_keyboard: [[ { text: button.text, url: button.url } ]] } } : {})
    });
  }

  if (isLocalImage && button) {
     // Добавляем кнопку в FormData если нужно (реализуем по необходимости)
     // Пока оставим базу
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });
    
    const result = await response.json();

    if (!response.ok) {
      console.error('[TELEGRAM] API Error Response:', result);
      return { success: false, error: result.description };
    }

    return { success: true, result: result.result };
  } catch (error) {
    console.error('[TELEGRAM] Ошибка отправки:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Генерация безопасного одноразового токена
 */
export function generateMagicToken() {
  return crypto.randomBytes(32).toString('hex');
}
