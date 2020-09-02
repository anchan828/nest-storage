import { copyFile, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { promisify } from "util";
import type { ParsedSignedUrl, SignedUrlOptions, StorageModuleOptions, StorageOptions } from "./interfaces";
import { CommonStorageUtils } from "./utils";
const copyFileAsync = promisify(copyFile);
export abstract class AbstractStorage {
  constructor(protected readonly storageOptions: StorageModuleOptions) {}

  protected getDestinationCachePath(filename: string, options?: StorageOptions): string {
    const cacheDir = CommonStorageUtils.getCacheDir(this.storageOptions);

    const bucket = CommonStorageUtils.getBucket(this.storageOptions, options);

    const destination = join(cacheDir, bucket, filename);

    if (!existsSync(destination)) {
      const destDirname = dirname(destination);

      if (!existsSync(destDirname)) {
        mkdirSync(destDirname, { recursive: true });
      }
    }

    return destination;
  }

  protected async copyFileAsync(srcPath: string, destPath: string): Promise<void> {
    await copyFileAsync(srcPath, destPath);
  }

  public abstract provider: string;

  public abstract async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string>;

  public abstract async download(filename: string, options?: StorageOptions): Promise<string>;

  public abstract async delete(filename: string, options?: StorageOptions): Promise<void>;

  public abstract async exists(filename: string, options?: StorageOptions): Promise<boolean>;

  public abstract async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string>;

  public abstract parseSignedUrl(url: string): ParsedSignedUrl;
}
