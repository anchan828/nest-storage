import { copyFile, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { promisify } from "util";
import type { ParsedSignedUrl, SignedUrlOptions, StorageCoreModuleOptions, StorageOptions } from "./interfaces";
import { CommonStorageUtils } from "./utils";
const copyFileAsync = promisify(copyFile);
export abstract class AbstractStorage {
  constructor(protected readonly storageOptions: StorageCoreModuleOptions) {}

  protected getDestinationCachePath(filename: string, options?: StorageOptions): string {
    const cacheDir = CommonStorageUtils.getCacheDir(this.storageOptions);

    const { bucket, name } = CommonStorageUtils.parseBuketAndFilename(filename, this.storageOptions, options);

    const destination = join(cacheDir, bucket, name);

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

  public abstract upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string>;

  public abstract download(filename: string, options?: StorageOptions): Promise<string>;

  public abstract delete(filename: string, options?: StorageOptions): Promise<void>;

  public abstract exists(filename: string, options?: StorageOptions): Promise<boolean>;

  public abstract getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string>;

  public abstract parseSignedUrl(url: string): ParsedSignedUrl;
}
