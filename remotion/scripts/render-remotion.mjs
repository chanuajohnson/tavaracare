import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FINAL_OUT = "/mnt/documents/tavara-tiktok-village-v5.mp4";
const TMP_OUT = "/tmp/tavara-tiktok-village-v5.raw.mp4";

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
console.log("done:", FINAL_OUT);
