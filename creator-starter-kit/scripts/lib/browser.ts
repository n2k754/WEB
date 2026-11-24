import { chromium, type Browser } from "playwright";
import { existsSync } from "node:fs";

/** Launches Chromium. Set PLAYWRIGHT_CHROMIUM_PATH to use a specific binary. */
export async function launchBrowser(): Promise<Browser> {
  const custom = process.env.PLAYWRIGHT_CHROMIUM_PATH;
  if (custom) return chromium.launch({ executablePath: custom, args: ["--no-sandbox"] });
  try {
    return await chromium.launch({ args: ["--no-sandbox"] });
  } catch (err) {
    const fallback = "/opt/pw-browsers/chromium";
    if (existsSync(fallback)) return chromium.launch({ executablePath: fallback, args: ["--no-sandbox"] });
    throw new Error(
      "Chromium not found. Run `npx playwright install chromium` or set PLAYWRIGHT_CHROMIUM_PATH.\n" + String(err),
    );
  }
}
