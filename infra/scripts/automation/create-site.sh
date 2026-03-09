#!/bin/bash

# Cortex Site Automation Script v2.0
# Usage: ./create-site.sh [project|client] <project_name> <domain_name> <port>

if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
    echo "Usage: $0 [type: project|client] <project_name> <domain_name> <port>"
    echo "Example: $0 client novoprom novoprom.saitik.su 4330"
    echo "If type is omitted, defaults to 'project'"
    exit 1
fi

if [ "$#" -eq 4 ]; then
    TYPE=$1
    PROJECT_NAME=$2
    DOMAIN_NAME=$3
    PORT=$4
else
    TYPE="project"
    PROJECT_NAME=$1
    DOMAIN_NAME=$2
    PORT=$3
fi

if [ "$TYPE" == "client" ]; then
    PROJECT_PATH="/root/projects/SYNDICATE/clients/$PROJECT_NAME"
else
    PROJECT_PATH="/root/projects/SYNDICATE/projects/$PROJECT_NAME"
fi

WEB_PATH="/var/www/sites/$DOMAIN_NAME"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN_NAME"
BRAIN_PATH="/root/projects/SYNDICATE/brains/cortex-brain"

echo "🚀 Starting creation of $TYPE $PROJECT_NAME for $DOMAIN_NAME on port $PORT..."

# 1. Create directory
mkdir -p "$PROJECT_PATH"
cd "$PROJECT_PATH" || exit

# 2. Scaffolding Astro (Minimal)
echo "📦 Scaffolding Astro project..."
npm create astro@latest ./ -- --no-install --no-git --template minimal --yes

# 3. Injecting Context Linker
echo "🧠 Linking to Cortex Brain..."
cat <<EOF > CONTEXT.md
# Контекст Проекта: $PROJECT_NAME

# INSTRUCTION FOR AI
Before proceeding with any task, you MUST read your core identity, rules, and global memory from the absolute path:
$BRAIN_PATH/MANIFEST.md
$BRAIN_PATH/private_core/rules/
This is your Cortex Brain.

## О проекте
* **Domain:** $DOMAIN_NAME
* **Dev Port:** $PORT
* **Deploy Path:** $WEB_PATH
* **Type:** $TYPE
EOF

# 3.5 Injecting AWAKENING Pointer
echo "☀️  Creating AWAKENING.md pointer..."
cat <<EOF > AWAKENING.md
# Интеграция с Синдикатом (Awakening Pointer)

Внимание Агенту Кашлак / Небула / Кортекс:
Этот $TYPE является частью экосистемы SYNDICATE. Ваша основная память, протоколы и инструкции находятся на уровень выше, в родительской директории.

**ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ:**
Абсолютный путь к главному манифесту и протоколам Пробуждения:
\`\`\`
/root/projects/SYNDICATE/AWAKENING.md
\`\`\`

Пожалуйста, прочитайте его для восстановления контекста перед началом работы над этим проектом.
EOF

# 4. Modifying astro.config.mjs
echo "⚙️ Configuring Astro..."
cat <<EOF > astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: '$WEB_PATH',
  server: {
    host: '0.0.0.0',
    port: $PORT
  }
});
EOF

# 5. Adding deploy script to package.json
# Using node to edit JSON safely
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!pkg.scripts) pkg.scripts = {};
pkg.scripts.deploy = \"astro build && echo '✅ Deployed to $WEB_PATH'\";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# 6. Setting up Nginx
echo "🌐 Configuring Nginx..."
cat <<EOF > "$NGINX_CONF"
server {
    server_name $DOMAIN_NAME;
    root $WEB_PATH;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ =404;
    }

    listen 80;
}
EOF

ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"
mkdir -p "$WEB_PATH"
nginx -s reload

# 7. Obtaining SSL Certificate (Optional but recommended)
echo "🔒 Requesting SSL certificate via Certbot..."
# We use --nginx plugin, --non-interactive, and --agree-tos. 
# Note: This assumes email is already registered or we use --register-unsafely-without-email
certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos --register-unsafely-without-email

# 8. Finalizing
echo "✅ Project $PROJECT_NAME initialized at $PROJECT_PATH"
echo "🌐 Nginx configured and SSL issued for https://$DOMAIN_NAME"
echo "🛠️ Run 'npm install' and 'npm run dev' to start."
echo "📜 Context linked: $PROJECT_PATH/CONTEXT.md"
echo "📜 Awakening pointer created: $PROJECT_PATH/AWAKENING.md"
