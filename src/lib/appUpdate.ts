import Constants from "expo-constants";
import { Linking } from "react-native";
import { API_BASE_URL } from "@/config/api";

export type RemoteVersionInfo = {
  version: string;
  versionCode?: number;
  apkUrl: string;
  releaseNotes?: string;
};

type ManifestPlatform = {
  version?: string | null;
  versionCode?: number;
  url?: string | null;
  status?: string;
};

type DownloadsManifest = {
  releaseNotes?: string;
  platforms?: { android?: ManifestPlatform };
};

const VERSION_PATHS = [
  "/downloads/manifest.json",
  "/api/downloads-manifest",
  "/downloads/version.json",
  "/api/mobile-version",
] as const;

export function getLocalAppVersion(): string {
  return Constants.expoConfig?.version ?? "0.0.0";
}

export function isRemoteVersionNewer(
  localVersion: string,
  remoteVersion: string,
): boolean {
  const parse = (v: string) =>
    v
      .trim()
      .replace(/^v/i, "")
      .split(/[.+_-]/)
      .map((p) => parseInt(p, 10))
      .map((n) => (Number.isFinite(n) ? n : 0));

  const a = parse(localVersion);
  const b = parse(remoteVersion);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (bv > av) return true;
    if (bv < av) return false;
  }
  return false;
}

function resolveDownloadUrl(baseUrl: string, apkUrl: string): string {
  if (/^https?:\/\//i.test(apkUrl)) return apkUrl;
  const base = baseUrl.replace(/\/+$/, "");
  const path = apkUrl.startsWith("/") ? apkUrl : `/${apkUrl}`;
  return `${base}${path}`;
}

function parseRemotePayload(data: unknown): RemoteVersionInfo | null {
  if (!data || typeof data !== "object") return null;

  const d = data as Record<string, unknown>;

  if (d.platforms && typeof d.platforms === "object") {
    const manifest = data as DownloadsManifest;
    const android = manifest.platforms?.android;
    if (android?.version && android.url) {
      return {
        version: android.version,
        versionCode: android.versionCode,
        apkUrl: android.url,
        releaseNotes: manifest.releaseNotes,
      };
    }
    return null;
  }

  if (typeof d.version === "string" && typeof d.apkUrl === "string") {
    return data as RemoteVersionInfo;
  }

  return null;
}

export async function fetchRemoteVersion(
  baseUrl: string,
): Promise<RemoteVersionInfo | null> {
  const origin = baseUrl.replace(/\/+$/, "");
  for (const path of VERSION_PATHS) {
    try {
      const res = await fetch(`${origin}${path}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const parsed = parseRemotePayload(await res.json());
      if (parsed) return parsed;
    } catch {
      /* try next path */
    }
  }
  return null;
}

export async function openApkDownload(
  baseUrl: string,
  remote: RemoteVersionInfo,
): Promise<void> {
  const url = resolveDownloadUrl(baseUrl || API_BASE_URL, remote.apkUrl);
  await Linking.openURL(url);
}
