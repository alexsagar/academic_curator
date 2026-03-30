/**
 * Local filesystem storage — development only.
 *
 * Writes files under `public/uploads/` so Next.js can serve them as
 * static assets.  Do NOT use in multi-instance production deployments.
 */

import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider } from "./types";

export class LocalStorageProvider implements StorageProvider {
  private readonly basePath: string;

  constructor() {
    this.basePath = path.join(process.cwd(), "public", "uploads");
  }

  async upload(key: string, body: Buffer, _contentType: string): Promise<string> {
    const filePath = path.join(this.basePath, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(path.join(this.basePath, key));
    } catch {
      // Ignore missing files — object may already have been removed.
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
