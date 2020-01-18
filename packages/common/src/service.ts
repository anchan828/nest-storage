import { Inject } from "@nestjs/common";
import { existsSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { STORAGE_MODULE_OPTIONS } from "./constants";
import { StorageModuleOptions, StorageOptions } from "./interfaces";
import { BUCKET_NOT_DEFINED_MESSAGE } from "./messages";
export class CommonStorageService {
  constructor(@Inject(STORAGE_MODULE_OPTIONS) private readonly moduleOptions: StorageModuleOptions) {}

  public getBucket(options?: StorageOptions): string {
    if (options?.bucket) {
      return options.bucket;
    }

    if (this.moduleOptions.bucket) {
      return this.moduleOptions.bucket;
    }

    throw new Error(BUCKET_NOT_DEFINED_MESSAGE);
  }

  public getCacheDir(): string {
    const cacheDir = this.moduleOptions.cacheDir || join(tmpdir(), ",nest-storage");
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    return cacheDir;
  }
}
