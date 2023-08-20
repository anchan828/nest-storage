import { promises } from "fs";
import { dirname, join } from "path";
import type { ParsedSignedUrl, SignedUrlOptions, StorageCoreModuleOptions, StorageOptions } from "./interfaces";
import { CommonStorageUtils } from "./utils";
export abstract class AbstractStorage {
  constructor(protected readonly storageOptions: StorageCoreModuleOptions) {}

  public async getDestinationCachePath(filename: string, options?: StorageOptions): Promise<string> {
    const cacheDir = await CommonStorageUtils.getCacheDir(this.storageOptions);

    const { bucket, name } = CommonStorageUtils.parseBuketAndFilename(filename, this.storageOptions, options);

    const destination = join(cacheDir, bucket, name);

    await promises.mkdir(dirname(destination), { recursive: true });

    return destination;
  }

  public abstract provider: string;

  public abstract upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string>;

  public abstract download(filename: string, options?: StorageOptions): Promise<string>;

  public abstract delete(filename: string, options?: StorageOptions): Promise<void>;

  public abstract exists(filename: string, options?: StorageOptions): Promise<boolean>;

  public abstract copy(
    srcFilename: string,
    destFilename: string,
    srcOptions?: StorageOptions,
    destOptions?: StorageOptions,
  ): Promise<void>;

  public abstract getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string>;

  public abstract parseSignedUrl(url: string): ParsedSignedUrl;
}
