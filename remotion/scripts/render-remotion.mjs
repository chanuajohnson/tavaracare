import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCRIPT_ID = process.env.VIDEO_SCRIPT_ID || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const RENDER_UPLOAD_TOKEN = process.env.RENDER_UPLOAD_TOKEN || "";
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

const inputProps = process.env.VIDEO_SCENES_JSON
  ? { scenes: JSON.parse(process.env.VIDEO_SCENES_JSON) }
  : {};

const composition = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
  inputProps,
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
  inputProps,
});

await browser.close({ silent: false });

// Remux with +faststart so QuickTime can play the file
console.log("Remuxing with +faststart for QuickTime compatibility...");
execSync(`ffmpeg -y -i "${TMP_OUT}" -c copy -movflags +faststart "${FINAL_OUT}"`, {
  stdio: "inherit",
});
fs.unlinkSync(TMP_OUT);
console.log("local file written:", FINAL_OUT);

// Optional: upload to Supabase storage + flip script row to ready, via edge function
if (SCRIPT_ID && SUPABASE_URL && RENDER_UPLOAD_TOKEN) {
  console.log(`Uploading to video-renders bucket for script ${SCRIPT_ID} via edge function...`);
  const fileBytes = fs.readFileSync(FINAL_OUT);
  const fnUrl = `${SUPABASE_URL}/functions/v1/upload-video-render`;
  const upRes = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "video/mp4",
      "x-render-token": RENDER_UPLOAD_TOKEN,
      "x-script-id": SCRIPT_ID,
      "x-slug": TITLE_SLUG,
    },
    body: fileBytes,
  });
  const txt = await upRes.text();
  if (!upRes.ok) {
    throw new Error(`Upload failed (${upRes.status}): ${txt}`);
  }
  console.log("uploaded + script marked ready:", txt);
} else {
  console.log(
    "skip upload (set VIDEO_SCRIPT_ID, SUPABASE_URL, RENDER_UPLOAD_TOKEN to push to storage)",
  );
}

console.log("done:", FINAL_OUT);
