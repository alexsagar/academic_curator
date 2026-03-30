/**
 * S3-compatible object storage adapter.
 *
 * Works with AWS S3, Cloudflare R2, MinIO, and any endpoint that speaks
 * the S3 API.  Configure via environment variables (see DEPLOYMENT.md).
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { requireEnv, getOptionalEnv } from "@/lib/env";
import type { StorageProvider } from "./types";

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrlBase: string;

  constructor() {
    const region = getOptionalEnv("S3_REGION") ?? "auto";
    const endpoint = getOptionalEnv("S3_ENDPOINT") ?? undefined;

    this.bucket = requireEnv("S3_BUCKET");
    this.publicUrlBase = this.resolvePublicBase(endpoint, region);

    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
      },
      // Force path-style for MinIO/R2 compatibility
      forcePathStyle: !!endpoint,
    });
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch {
      // Best-effort deletion — the object may not exist.
    }
  }

  getUrl(key: string): string {
    return `${this.publicUrlBase}/${key}`;
  }

  /** Build the base URL used to construct public object URLs. */
  private resolvePublicBase(endpoint: string | undefined, region: string): string {
    const explicit = getOptionalEnv("S3_PUBLIC_URL_BASE");
    if (explicit) {
      return explicit.replace(/\/+$/, "");
    }

    // R2 / custom endpoint — assume bucket is path-prefixed
    if (endpoint) {
      return `${endpoint.replace(/\/+$/, "")}/${this.bucket}`;
    }

    // Standard AWS S3
    return `https://${this.bucket}.s3.${region}.amazonaws.com`;
  }
}
