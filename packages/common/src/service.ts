import { Inject } from "@nestjs/common";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
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
    return this.moduleOptions.cacheDir || mkdtempSync(tmpdir() + "/");
  }
}
