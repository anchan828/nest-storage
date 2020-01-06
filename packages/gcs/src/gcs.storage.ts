import { AbstractStorage, CommonStorageService, StorageOptions } from "@anchan828/nest-storage-common";
import { Bucket, Storage } from "@google-cloud/storage";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import {
  GoogleCloudStorageDeleteOptions,
  GoogleCloudStorageDownloadOptions,
  GoogleCloudStorageModuleOptions,
  GoogleCloudStorageUploadOptions,
} from "./gcs-storage.interface";
export class GoogleCloudStorage extends AbstractStorage {
  constructor(
    protected readonly moduleOptions: GoogleCloudStorageModuleOptions,
    protected readonly service: CommonStorageService,
  ) {
    super(moduleOptions, service);
  }

  public async upload(dataPath: string, filename: string, options?: GoogleCloudStorageUploadOptions): Promise<string> {
    const bucket = this.getBuket(options);

    if (!options?.destination) {
      options = Object.assign({}, options, { destination: filename });
    }

    const res = await bucket.upload(dataPath, options);
    return res[0].name;
  }

  public async download(filename: string, options: GoogleCloudStorageDownloadOptions = {}): Promise<string> {
    const cacheDir = this.service.getCacheDir();

    const bucket = this.getBuket(options);
    const destination = join(cacheDir, filename);

    if (!existsSync(destination)) {
      const destDirname = dirname(destination);

      if (!existsSync(destDirname)) {
        mkdirSync(destDirname, { recursive: true });
      }

      if (!options.downloadOptions?.destination) {
        options.downloadOptions = Object.assign({}, options.downloadOptions, { destination });
      }

      await bucket.file(filename, options.fileOptions).download(options.downloadOptions);
    }
    return destination;
  }

  public async delete(filename: string, options: GoogleCloudStorageDeleteOptions = {}): Promise<void> {
    const bucket = this.getBuket(options);
    await bucket.file(filename, options.fileOptions).delete(options.deleteOptions);
  }

  private getBuket(options: StorageOptions = {}): Bucket {
    const storage = new Storage(this.moduleOptions);
    const bucketName = this.service.getBucket(options);
    return storage.bucket(bucketName);
  }
}
