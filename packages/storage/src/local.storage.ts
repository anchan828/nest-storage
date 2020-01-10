import {
  AbstractStorage,
  CommonStorageService,
  FILE_NOT_FOUND,
  StorageModuleOptions,
  StorageOptions,
} from "@anchan828/nest-storage-common";
import { Injectable } from "@nestjs/common";
import { copyFile, existsSync, mkdirSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { promisify } from "util";
const copyFileAsync = promisify(copyFile);
@Injectable()
export class LocalStorage extends AbstractStorage {
  constructor(
    protected readonly moduleOptions: StorageModuleOptions,
    protected readonly service: CommonStorageService,
  ) {
    super(moduleOptions, service);
  }

  public async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string> {
    const cacheDir = this.service.getCacheDir();
    const bucket = this.service.getBucket(options);
    const dest = join(cacheDir, bucket, filename);
    const destDirname = dirname(dest);
    if (!existsSync(destDirname)) {
      mkdirSync(destDirname, { recursive: true });
    }
    await copyFileAsync(dataPath, dest);
    return filename;
  }

  public async download(filename: string, options?: StorageOptions): Promise<string> {
    const cacheDir = this.service.getCacheDir();
    const bucket = this.service.getBucket(options);
    const dest = join(cacheDir, bucket, filename);

    if (!existsSync(dest)) {
      throw new Error(FILE_NOT_FOUND(bucket, filename));
    }

    return dest;
  }

  public async delete(filename: string, options?: StorageOptions): Promise<void> {
    const cacheDir = this.service.getCacheDir();
    const bucket = this.service.getBucket(options);
    const dest = join(cacheDir, bucket, filename);

    if (!existsSync(dest)) {
      throw new Error(FILE_NOT_FOUND(bucket, filename));
    }

    unlinkSync(dest);
  }
}
