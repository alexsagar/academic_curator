/**
 * Storage entry point.
 *
 * Returns a singleton StorageProvider based on the `STORAGE_PROVIDER`
 * environment variable.  Defaults to the local filesystem adapter for
 * development convenience.
 */

import { getOptionalEnv } from "@/lib/env";
import type { StorageProvider } from "./types";

const globalForStorage = globalThis as unknown as {
  storageProvider: StorageProvider | undefined;
};

export function getStorage(): StorageProvider {
  if (globalForStorage.storageProvider) {
    return globalForStorage.storageProvider;
  }

  const provider = getOptionalEnv("STORAGE_PROVIDER") ?? "local";

  switch (provider) {
    case "s3": {
      // Dynamic import avoids loading the S3 SDK when using local storage.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { S3StorageProvider } = require("./s3") as typeof import("./s3");
      globalForStorage.storageProvider = new S3StorageProvider();
      break;
    }
    case "local": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { LocalStorageProvider } = require("./local") as typeof import("./local");
      globalForStorage.storageProvider = new LocalStorageProvider();
      break;
    }
    default:
      throw new Error(
        `Unknown STORAGE_PROVIDER "${provider}". Supported values: "local", "s3".`
      );
  }

  return globalForStorage.storageProvider!;
}

export type { StorageProvider } from "./types";
