/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly TELEGRAM_BOT_TOKEN: string;
  readonly ADMIN_TELEGRAM_ID: string;
  readonly SESSION_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
