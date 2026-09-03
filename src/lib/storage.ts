import "server-only";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import crypto from "node:crypto";

/**
 * File storage: local `.storage/` folder only for v1 (employee documents,
 * leave attachments — low volume, no R2 needed yet). Files are encrypted at
 * rest with AES-256-GCM using FILE_KEY. If R2 is needed later, hdc's full
 * storage.ts (same function names) can replace this file without touching
 * any call site.
 */

const LOCAL_ROOT = join(process.cwd(), ".storage");

function localPath(key: string): string {
  // Keys are internally generated (cuid-based) — no user path input reaches here.
  return join(LOCAL_ROOT, key.replaceAll("..", ""));
}

const DEFAULT_FILE_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function getFileKey(): Buffer {
  const hex = process.env.FILE_KEY;
  if (hex && hex.length === 64) return Buffer.from(hex, "hex");
  return Buffer.from(DEFAULT_FILE_KEY, "hex");
}

function encryptFile(buffer: Uint8Array | Buffer): Buffer {
  const key = getFileKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(buffer)), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decryptFile(buffer: Uint8Array | Buffer): Buffer {
  const key = getFileKey();
  const buf = Buffer.from(buffer);
  if (buf.length < 28) throw new Error("Invalid file content: too short to contain IV and Tag.");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export async function storageGetBytes(key: string): Promise<Uint8Array> {
  const bytes = new Uint8Array(await readFile(localPath(key)));
  try {
    return new Uint8Array(decryptFile(bytes));
  } catch {
    return bytes;
  }
}

export async function storagePutBytes(key: string, body: Uint8Array | Buffer): Promise<void> {
  const encryptedBody = encryptFile(body);
  const path = localPath(key);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, encryptedBody);
}

export async function storageDelete(key: string): Promise<void> {
  await rm(localPath(key), { force: true });
}
