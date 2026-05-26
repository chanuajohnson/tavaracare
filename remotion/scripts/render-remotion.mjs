import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCRIPT_ID = process.env.VIDEO_SCRIPT_ID || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TITLE_SLUG = (process.env.VIDEO_SLUG || "tavara-tiktok-village-v5")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "") || "tavara-video";

const FINAL_OUT = `/mnt/documents/${TITLE_SLUG}.mp4`;
const TMP_OUT = `/tmp/${TITLE_SLUG}.raw.mp4`;

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
});

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  pixelFormat: "yuv420p",
  x264Preset: "medium",
  outputLocation: TMP_OUT,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
});

await browser.close({ silent: false });

// Remux with +faststart so QuickTime can play the file
console.log("Remuxing with +faststart for QuickTime compatibility...");
execSync(`ffmpeg -y -i "${TMP_OUT}" -c copy -movflags +faststart "${FINAL_OUT}"`, {
  stdio: "inherit",
});
fs.unlinkSync(TMP_OUT);
console.log("local file written:", FINAL_OUT);

// Optional: upload to Supabase storage + flip script row to ready
if (SCRIPT_ID && SUPABASE_URL && SERVICE_ROLE) {
  console.log(`Uploading to video-renders bucket for script ${SCRIPT_ID}...`);
  const fileBytes = fs.readFileSync(FINAL_OUT);
  const objectPath = `${SCRIPT_ID}/${TITLE_SLUG}.mp4`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/video-renders/${objectPath}`;

  const upRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
      "Content-Type": "video/mp4",
      "x-upsert": "true",
      "Cache-Control": "3600",
    },
    body: fileBytes,
  });
  if (!upRes.ok) {
    const txt = await upRes.text();
    throw new Error(`Upload failed (${upRes.status}): ${txt}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/video-renders/${objectPath}`;

  const updRes = await fetch(
    `${SUPABASE_URL}/rest/v1/video_scripts?id=eq.${SCRIPT_ID}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        apikey: SERVICE_ROLE,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        rendered_url: publicUrl,
        render_status: "ready",
      }),
    },
  );
  if (!updRes.ok) {
    const txt = await updRes.text();
    throw new Error(`DB update failed (${updRes.status}): ${txt}`);
  }
  console.log("uploaded + script marked ready:", publicUrl);
} else {
  console.log(
    "skip upload (set VIDEO_SCRIPT_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY to push to storage)",
  );
}

console.log("done:", FINAL_OUT);
