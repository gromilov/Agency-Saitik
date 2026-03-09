import type { APIRoute } from 'astro';
import { sendTelegramMessage, generateMagicToken } from '../../../lib/telegram';

// Эндпоинт для инициации входа (Admin Auth)
export const POST: APIRoute = async ({ request, url }) => {
  const formData = await request.formData();
  const phone = formData.get('phone');
  
  const adminId = import.meta.env.ADMIN_TELEGRAM_ID;
  const siteUrl = url.origin; // Динамически получаем URL сайта
  
  console.log(`[AUTH] Попытка входа для: ${phone}`);

  // 1. Простая проверка (здесь можно добавить сверку с базой данных)
  // Для начала просто генерируем ссылку если запрос пришел
  const token = generateMagicToken();
  
  // 2. В будущем мы сохраним этот токен в БД или Redis с TTL
  // Пока что выводим в консоль и отправляем в ТГ
  const magicLink = `${siteUrl}/api/auth/verify?token=${token}`;
  const isLocal = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');

  let message = `⚙️ *ВХОД В СИНДИКАТ*\n\nОбнаружена попытка входа в систему управления Офисом.\n`;
  
  if (isLocal) {
    message += `⚠️ *Внимание:* Вы работаете на localhost. Нажмите на ссылку ниже для входа:\n\n${magicLink}`;
  } else {
    message += `Если это вы — нажмите на кнопку подтверждения ниже:`;
  }
  
  const sent = await sendTelegramMessage(message, isLocal ? undefined : {
    text: "🚀 ПОДТВЕРДИТЬ ВХОД",
    url: magicLink
  });
  
  if (sent) {
    return new Response(JSON.stringify({ 
      success: true,
      message: "Check your Telegram for the Magic Link" 
    }), { status: 200 });
  } else {
    // Если сообщение не ушло — возможно превышен лимит или ошибка в токене
    console.error('[AUTH] Не удалось отправить уведомление в Telegram');
    return new Response(JSON.stringify({ 
      success: false,
      message: "Telegram API Error. Check server console." 
    }), { status: 500 });
  }
};
