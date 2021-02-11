import { existsSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { StorageCoreModuleOptions, StorageOptions } from "./interfaces";
import { BUCKET_NOT_DEFINED_MESSAGE } from "./messages";
export class CommonStorageUtils {
  public static parseBuketAndFilename(
    filename: string,
    storageOptions: StorageCoreModuleOptions,
    options?: StorageOptions,
  ): { bucket: string; name: string } {
    if (options?.bucket) {
      return { bucket: options.bucket, name: filename };
    }

    if (storageOptions.bucket) {
      return { bucket: storageOptions.bucket, name: filename };
    }

    const [bucket, ...names] = filename.split("/");

    if (bucket && names.length !== 0) {
      return { bucket, name: names.join("/") };
    }

    throw new Error(BUCKET_NOT_DEFINED_MESSAGE);
  }

  public static getCacheDir(storageOptions: StorageCoreModuleOptions): string {
    const cacheDir = storageOptions.cacheDir || join(tmpdir(), "nest-storage");
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    return cacheDir;
  }
}
