import * as SplashScreen from "expo-splash-screen";

/** Hard cap so native splash never stays forever if JS hangs or hideAsync fails. */
export const SPLASH_MAX_MS = 5000;

const SPLASH_MIN_MS = 600;

let hidden = false;
let failsafeScheduled = false;

export async function hideSplashScreen(): Promise<void> {
  if (hidden) return;
  hidden = true;
  try {
    await SplashScreen.hideAsync();
  } catch {
    /* already hidden or native module unavailable */
  }
}

/** Call once from index.ts before React mounts. */
export function scheduleSplashFailsafe(): void {
  if (failsafeScheduled) return;
  failsafeScheduled = true;
  setTimeout(() => {
    void hideSplashScreen();
  }, SPLASH_MAX_MS);
}

/** Hide after UI is laid out, respecting a short minimum display time. */
export function hideSplashAfterReady(): void {
  setTimeout(() => {
    void hideSplashScreen();
  }, SPLASH_MIN_MS);
}
