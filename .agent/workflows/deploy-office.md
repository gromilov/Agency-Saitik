---
description: [SYNDICATE] Deploy Office Site
---
Этот воркфлоу выполнит полную сборку и запуск Офиса Синдиката, а также настроит Nginx.

1. Удалить старый билд и зависимости
```bash
cd /root/projects/SYNDICATE/office-site && rm -rf dist node_modules && npm install
```

2. Собрать проект
// turbo
```bash
cd /root/projects/SYNDICATE/office-site && npm run build
```

3. Запустить сервер в фоне через PM2
// turbo
```bash
cd /root/projects/SYNDICATE/office-site && pm2 delete office-site || true && pm2 start dist/server/entry.mjs --name office-site --env PORT=4321 && pm2 save
```

4. Активировать конфигурацию Nginx
// turbo
```bash
ln -sf /etc/nginx/sites-available/office.saitik.su /etc/nginx/sites-enabled/office.saitik.su
```

5. Проверить конфигурацию и перезапустить Nginx
// turbo
```bash
nginx -t && nginx -s reload
```

6. Выпустить SSL сертификат (если еще не сделано)
```bash
certbot --nginx -d office.saitik.su --non-interactive --agree-tos -m admin@saitik.su
```
