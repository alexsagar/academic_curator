/**
 * Storage provider abstraction.
 *
 * All file persistence goes through this interface so the underlying
 * backend (local disk, S3, R2, MinIO …) can be swapped via config.
 */

export interface StorageProvider {
  /** Upload a file and return its publicly-accessible URL. */
  upload(key: string, body: Buffer, contentType: string): Promise<string>;

  /** Delete a previously-uploaded object by key. Best-effort; does not throw on missing keys. */
  delete(key: string): Promise<void>;

  /** Resolve a storage key to a full public URL. */
  getUrl(key: string): string;
}
