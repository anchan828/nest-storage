import { existsSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { StorageModuleOptions, StorageOptions } from "./interfaces";
import { BUCKET_NOT_DEFINED_MESSAGE } from "./messages";
export class CommonStorageUtils {
  public static getBucket(storageOptions: StorageModuleOptions, options?: StorageOptions): string {
    if (options?.bucket) {
      return options.bucket;
    }

    if (storageOptions.bucket) {
      return storageOptions.bucket;
    }

    throw new Error(BUCKET_NOT_DEFINED_MESSAGE);
  }

  public static getCacheDir(storageOptions: StorageModuleOptions): string {
    const cacheDir = storageOptions.cacheDir || join(tmpdir(), "nest-storage");
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    return cacheDir;
  }
}
