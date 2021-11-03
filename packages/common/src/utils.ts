import { existsSync, promises } from "fs";
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
      return { bucket: options.bucket, name: filename.replace(new RegExp(`^${options.bucket}\/`, "g"), "") };
    }

    if (storageOptions.bucket) {
      return {
        bucket: storageOptions.bucket,
        name: filename.replace(new RegExp(`^${storageOptions.bucket}\/`, "g"), ""),
      };
    }

    const [bucket, ...names] = filename.split("/");

    if (bucket && names.length !== 0) {
      return { bucket, name: names.join("/") };
    }

    throw new Error(BUCKET_NOT_DEFINED_MESSAGE);
  }

  public static async getCacheDir(storageOptions: StorageCoreModuleOptions): Promise<string> {
    const cacheDir = storageOptions.cacheDir || join(tmpdir(), "nest-storage");
    if (!existsSync(cacheDir)) {
      await promises.mkdir(cacheDir, { recursive: true });
    }
    return cacheDir;
  }
}
