#!/usr/bin/env node
/**
 * Writes downloads manifest + legacy version.json for next-meddef.
 * Usage: node scripts/sync-version-json.js [path-to-next-meddef-or-dist]
 *
 * Production site origin (no trailing slash): https://meddef.ekddigital.com
 * Manifest url/apkUrl: site-relative (/downloads/...) or absolute CDN URL (CI via ANDROID_APK_URL).
 * Published APK: https://meddef.ekddigital.com/downloads/meddef.apk
 * Manifest:     https://meddef.ekddigital.com/downloads/manifest.json
 * Legacy JSON:  https://meddef.ekddigital.com/downloads/version.json
 */
const PRODUCTION_SITE_ORIGIN = "https://meddef.ekddigital.com";
const fs = require("node:fs");
const path = require("node:path");

const mobileRoot = path.join(__dirname, "..");
const app = JSON.parse(
  fs.readFileSync(path.join(mobileRoot, "app.json"), "utf8"),
);
const version = app.expo.version ?? "1.0.0";
const parsedCode = parseInt(version.split(".").join(""), 10);
const versionCode =
  app.expo.android?.versionCode ??
  (Number.isFinite(parsedCode) ? parsedCode : 1);

/** Optional CI overrides (ekd-assets CDN URL, checksum, size). */
const envApkUrl = process.env.ANDROID_APK_URL?.trim();
const envSizeBytes = process.env.ANDROID_SIZE_BYTES?.trim();
const envSha256 = process.env.ANDROID_SHA256?.trim();
const apkUrl = envApkUrl || "/downloads/meddef.apk";
const sizeBytes =
  envSizeBytes != null && envSizeBytes !== ""
    ? Number(envSizeBytes)
    : null;
const sha256 = envSha256 || null;

const targetRoot =
  process.argv[2] ?? path.join(mobileRoot, "..", "next-meddef");
const downloadsDir = targetRoot.endsWith("downloads")
  ? targetRoot
  : path.join(targetRoot, "public", "downloads");

const manifestPath = path.join(downloadsDir, "manifest.json");
let manifest = {
  releaseDate: new Date().toISOString().slice(0, 10),
  releaseNotes:
    "MedDef client for ONNX imaging and optional text inference against your configured API.",
  platforms: {
    android: {
      version,
      versionCode,
      url: apkUrl,
      filename: "meddef.apk",
      format: "APK",
      status: "available",
      sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : null,
      sha256,
    },
    ios: {
      version,
      url: null,
      format: "IPA / TestFlight",
      status: "external",
      externalUrl: null,
      notes:
        "iOS builds are distributed via TestFlight or the App Store. Direct IPA downloads are not offered here.",
    },
    macos: {
      version: null,
      url: null,
      filename: "meddef-macos.dmg",
      format: "DMG",
      status: "coming_soon",
      notes: "macOS build pending CI.",
    },
    windows: {
      version: null,
      url: null,
      filename: "meddef-setup.exe",
      format: "EXE / MSIX",
      status: "coming_soon",
      notes: "Windows build pending CI.",
    },
    linux: {
      version: null,
      url: null,
      filename: null,
      format: "AppImage (planned)",
      status: "coming_soon",
      notes:
        "Linux is not available for download yet. Use Android, iOS, macOS, or Windows builds.",
    },
  },
};

if (fs.existsSync(manifestPath)) {
  const existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest = {
    ...existing,
    releaseDate: manifest.releaseDate,
    releaseNotes: manifest.releaseNotes,
    platforms: {
      ...existing.platforms,
      android: {
        ...existing.platforms?.android,
        ...manifest.platforms.android,
      },
    },
  };
}

fs.mkdirSync(downloadsDir, { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const legacy = {
  version: manifest.platforms.android.version,
  versionCode: manifest.platforms.android.versionCode,
  apkUrl: manifest.platforms.android.url,
  releaseNotes: manifest.releaseNotes,
};
fs.writeFileSync(
  path.join(downloadsDir, "version.json"),
  `${JSON.stringify(legacy, null, 2)}\n`,
);

console.log(`Wrote ${manifestPath}`);
console.log(`Wrote ${path.join(downloadsDir, "version.json")}`);
console.log(`Resolve artifact URLs under ${PRODUCTION_SITE_ORIGIN}`);
