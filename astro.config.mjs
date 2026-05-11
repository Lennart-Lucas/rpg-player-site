import { defineConfig } from 'astro/config';

// Omit [site] unless PUBLIC_PLAYER_SITE_URL is set (e.g. in Vercel → Environment
// Variables). A placeholder like https://example.com makes redirects and
// canonical URLs point at the wrong host.
const raw = process.env.PUBLIC_PLAYER_SITE_URL?.trim();
const site =
  raw && /^https:\/\//i.test(raw) ? raw.replace(/\/$/, '') : undefined;

// https://astro.build/config
export default defineConfig({
  ...(site ? { site } : {}),
  output: 'static',
});
