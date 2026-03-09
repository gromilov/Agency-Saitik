import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  const token = url.searchParams.get('token');
  
  if (!token) {
    return new Response('Missing token', { status: 400 });
  }

  // 1. В реальной системе здесь должна быть проверка токена в БД/кэше
  // 2. Если токен валиден — создаем сессию
  
  console.log(`[AUTH] Верификация токена: ${token}`);
  
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  // Устанавливаем временную куку сессии для тестов
  cookies.set('syndicate_session', 'admin_active', {
    path: '/',
    httpOnly: true,
    secure: !isLocal, // Отключаем secure на localhost для работы HTTP
    sameSite: 'lax',   // 'lax' лучше подходит для редиректов извне (из ТГ)
    maxAge: 60 * 60 * 24 // 1 день
  });

  // Перенаправляем в админку (которую мы скоро создадим)
  return redirect('/admin');
};
