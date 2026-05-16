#!/usr/bin/env node
/**
 * Upload meddef.apk to EKD Digital Assets (GitHub Actions / local CI).
 *
 * Env:
 *   EKD_DIGITAL_ASSETS_API_URL  — optional, default https://www.assets.andgroupco.com/api/v1/assets
 *   EKD_DIGITAL_ASSETS_API_SECRET or EKD_DIGITAL_ASSETS_API_KEY — Bearer token (sk_…)
 *
 * Usage: node scripts/ekd-assets-upload-apk.js <path-to.apk>
 *
 * Prints one JSON line to stdout: { download_url, asset_id, file_size, mime_type }
 * Sets GITHUB_OUTPUT when running in Actions (download_url, asset_id, file_size).
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const API_BASE = (
  process.env.EKD_DIGITAL_ASSETS_API_URL ||
  "https://www.assets.andgroupco.com/api/v1/assets"
).replace(/\/+$/, "");

const API_KEY =
  process.env.EKD_DIGITAL_ASSETS_API_SECRET ||
  process.env.EKD_DIGITAL_ASSETS_API_KEY ||
  "";

const CHUNK_SIZE = 5 * 1024 * 1024;
const CHUNKED_THRESHOLD = 10 * 1024 * 1024;

function sha256hex(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function writeGithubOutput(kv) {
  const out = process.env.GITHUB_OUTPUT;
  if (!out) return;
  const lines = Object.entries(kv)
    .map(([k, v]) => `${k}=${String(v).replace(/\n/g, "%0A")}`)
    .join("\n");
  fs.appendFileSync(out, `${lines}\n`);
}

async function uploadSimple(apkPath, buffer, base, origin, authBearer) {
  const blob = new Blob([buffer], {
    type: "application/vnd.android.package-archive",
  });
  const form = new FormData();
  form.append("file", blob, path.basename(apkPath));
  form.append("asset_type", "documents");
  form.append("project_name", "MedDef");
  form.append("client_id", "meddef");
  form.append("tags", "meddef,android,apk,release");

  const res = await fetch(`${base}/upload`, {
    method: "POST",
    headers: { Authorization: authBearer },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  const downloadUrl =
    data.download_url || `${origin}/api/v1/assets/${data.id}/download`;
  return {
    download_url: downloadUrl,
    asset_id: data.id || "",
    file_size: data.file_size || buffer.length,
    mime_type: data.mime_type || "application/vnd.android.package-archive",
  };
}

async function uploadChunked(apkPath, buffer, base, origin, authBearer) {
  const uploadId = crypto.randomUUID();
  const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
  const mimeType = "application/vnd.android.package-archive";
  const filename = path.basename(apkPath);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, buffer.length);
    const chunkBuf = buffer.subarray(start, end);
    const checksum = sha256hex(chunkBuf);

    const fd = new FormData();
    fd.append("chunk", new Blob([chunkBuf], { type: mimeType }));
    fd.append("uploadId", uploadId);
    fd.append("chunkId", String(i));
    fd.append("checksum", checksum);
    fd.append("totalChunks", String(totalChunks));

    const chunkRes = await fetch(`${base}/upload/chunk`, {
      method: "POST",
      headers: { Authorization: authBearer },
      body: fd,
    });
    if (!chunkRes.ok) {
      throw new Error(
        `Chunk ${i + 1}/${totalChunks} failed (${chunkRes.status}): ${await chunkRes.text()}`,
      );
    }
  }

  const finalRes = await fetch(`${base}/upload/finalize`, {
    method: "POST",
    headers: {
      Authorization: authBearer,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uploadId,
      totalChunks,
      totalSize: buffer.length,
      filename,
      mimeType,
      clientId: "meddef",
      projectName: "MedDef",
    }),
  });
  if (!finalRes.ok) {
    throw new Error(
      `Finalize failed (${finalRes.status}): ${await finalRes.text()}`,
    );
  }
  const data = await finalRes.json();
  if (!data.success) {
    throw new Error(data.error || "Finalize returned failure");
  }
  const downloadUrl = data.downloadUrl?.startsWith("http")
    ? data.downloadUrl
    : `${origin}${data.downloadUrl ?? `/assets/${data.assetId}`}`;

  return {
    download_url: downloadUrl,
    asset_id: data.assetId || "",
    file_size: data.fileSize || buffer.length,
    mime_type: data.mimeType || mimeType,
  };
}

async function main() {
  const apkPath = process.argv[2];
  if (!apkPath || !fs.existsSync(apkPath)) {
    console.error("Usage: node scripts/ekd-assets-upload-apk.js <path-to.apk>");
    process.exit(1);
  }
  if (!API_KEY) {
    console.error("EKD_DIGITAL_ASSETS_API_SECRET is not set");
    process.exit(1);
  }

  const buffer = fs.readFileSync(apkPath);
  const base = API_BASE;
  const origin = new URL(base).origin;
  const authBearer = `Bearer ${API_KEY}`;

  const result =
    buffer.length >= CHUNKED_THRESHOLD
      ? await uploadChunked(apkPath, buffer, base, origin, authBearer)
      : await uploadSimple(apkPath, buffer, base, origin, authBearer);

  console.log(JSON.stringify(result));
  writeGithubOutput({
    download_url: result.download_url,
    asset_id: result.asset_id,
    file_size: result.file_size,
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
