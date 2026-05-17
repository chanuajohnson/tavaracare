// Post-build Vite plugin: emits per-route index.html shells with correct
// SEO head tags. Does NOT execute React in Node — the SPA still hydrates
// normally on top. Crawlers (WhatsApp/LinkedIn/Slack/Facebook) that do
// not run JS see correct title/description/canonical/og/jsonld per route.
//
// Lovable static hosting serves real files when they exist and falls back
// to /index.html otherwise. So dist/care/port-of-spain/index.html is
// served verbatim to crawlers and humans alike.

import fs from 'node:fs';
import path from 'node:path';
import { ROUTES, buildHead } from './seo-routes.mjs';

// Tags in the default index.html head we replace per route. The static
// fallbacks in index.html stay as the safety net for any non-prerendered
// route (e.g. a new blog post before re-deploy).
const REMOVE_TAG_RES = [
  /\s*<title>[\s\S]*?<\/title>/i,
  /\s*<meta\s+name="description"[^>]*>/i,
  /\s*<link\s+rel="canonical"[^>]*>/gi,
  /\s*<meta\s+property="og:[^"]+"[^>]*>/gi,
  /\s*<meta\s+name="twitter:[^"]+"[^>]*>/gi,
  // Strip sitewide JSON-LD Organization + LocalBusiness — per-route schema replaces them
  /\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi,
];

function rewriteHead(template, route) {
  let html = template;
  for (const re of REMOVE_TAG_RES) html = html.replace(re, '');
  const headOpen = html.indexOf('</head>');
  if (headOpen === -1) return html;
  const injected = '\n' + buildHead(route) + '\n  ';
  return html.slice(0, headOpen) + injected + html.slice(headOpen);
}

export default function seoPrerender({ verbose = true } = {}) {
  let outDir = 'dist';
  return {
    name: 'tavara-seo-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir || 'dist';
    },
    closeBundle() {
      const indexPath = path.resolve(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        this.warn(`[seo-prerender] ${indexPath} not found, skipping.`);
        return;
      }
      const template = fs.readFileSync(indexPath, 'utf8');
      let count = 0;
      for (const route of ROUTES) {
        const html = rewriteHead(template, route);
        const targetDir =
          route.path === '/' ? outDir : path.resolve(outDir, route.path.replace(/^\//, ''));
        // Don't overwrite the root index.html — rewrite it in place with homepage head
        if (route.path === '/') {
          fs.writeFileSync(indexPath, html, 'utf8');
        } else {
          fs.mkdirSync(targetDir, { recursive: true });
          fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
        }
        count++;
        if (verbose) console.log(`[seo-prerender] ${route.path}`);
      }
      console.log(`[seo-prerender] wrote ${count} prerendered routes to ${outDir}/`);
    },
  };
}
