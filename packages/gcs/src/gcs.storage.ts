import type {
  ParsedSignedUrl,
  SignedUrlActionType,
  SignedUrlOptions,
  StorageModuleOptions,
  StorageOptions,
} from "@anchan828/nest-storage-common";
import {
  AbstractStorage,
  CommonStorageUtils,
  STORAGE_DEFAULT_SIGNED_URL_EXPIRES,
  STORAGE_MODULE_OPTIONS,
  STORAGE_PROVIDER_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import type { Bucket } from "@google-cloud/storage";
import { Storage } from "@google-cloud/storage";
import { Inject } from "@nestjs/common";
import { existsSync, unlinkSync } from "fs";
import { URL } from "url";
import type { GoogleCloudStorageProviderModuleOptions } from "./gcs-storage.interface";
export class GoogleCloudStorage extends AbstractStorage {
  public provider = "gcs";

  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) protected readonly storageOptions: StorageModuleOptions,
    @Inject(STORAGE_PROVIDER_MODULE_OPTIONS)
    protected readonly providerOptions: GoogleCloudStorageProviderModuleOptions,
  ) {
    super(storageOptions);
  }

  public async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string> {
    const bucket = this.getBuket(filename, options);
    const [file] = await bucket.upload(dataPath, { destination: filename, gzip: true, resumable: false });
    await this.copyFileAsync(dataPath, this.getDestinationCachePath(filename, options));
    return file.name;
  }

  public async download(filename: string, options?: StorageOptions): Promise<string> {
    const destination = this.getDestinationCachePath(filename, options);

    if (!existsSync(destination)) {
      const bucket = this.getBuket(filename, options);
      await bucket.file(filename).download({ destination });
    }
    return destination;
  }

  public async delete(filename: string, options?: StorageOptions): Promise<void> {
    const bucket = this.getBuket(filename, options);
    await bucket.file(filename).delete();
    unlinkSync(this.getDestinationCachePath(filename, options));
  }

  public async exists(filename: string, options?: StorageOptions): Promise<boolean> {
    const bucket = this.getBuket(filename, options);
    return bucket
      .file(filename)
      .exists()
      .then((res) => res[0]);
  }

  public async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string> {
    const bucket = this.getBuket(filename, options);
    const { action, contentType } = options;
    const expires = options.expires || STORAGE_DEFAULT_SIGNED_URL_EXPIRES;
    const [url] = await bucket.file(filename).getSignedUrl({
      action: this.getAction(action),
      contentType,
      expires: Date.now() + expires,
      version: "v4",
    });
    return url;
  }

  private getAction(action: SignedUrlActionType): "delete" | "read" | "write" | "resumable" {
    switch (action) {
      case "upload":
        return "write";
      case "download":
        return "read";
      case "delete":
        return "delete";
    }
  }

  public parseSignedUrl(url: string): ParsedSignedUrl {
    const urlObject = new URL(url);
    const endopint = new URL(new Storage({ ...this.providerOptions, autoRetry: true, maxRetries: 5 }).apiEndpoint);

    if (urlObject.host !== endopint.host) {
      throw new Error(`Invalid endopint '${urlObject.host}'. endpoint should be ${endopint.host}`);
    }

    if (!urlObject.pathname || this.countString("/", urlObject.pathname) < 2) {
      throw new Error(`Invalid pathname '${urlObject.pathname}'. pathname should be '/bucket/path/to/filename.txt'`);
    }

    const [, bucket, ...filename] = urlObject.pathname.split("/");

    const result = { bucket, filename: filename.join("/") } as ParsedSignedUrl;

    if (!result.filename) {
      throw new Error(`Invalid filename. filename was empty.`);
    }

    return result;
  }

  private getBuket(filename: string, options: StorageOptions = {}): Bucket {
    const storage = new Storage(this.providerOptions);
    const bucketName = CommonStorageUtils.getBucket(filename, this.storageOptions, options);
    return storage.bucket(bucketName);
  }

  private countString(target: string, str: string): number {
    return str.split(target).length - 1;
  }
}
