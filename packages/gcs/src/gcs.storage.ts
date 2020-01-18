import {
  AbstractStorage,
  CommonStorageService,
  ParsedSignedUrl,
  SignedUrlActionType,
  SignedUrlOptions,
  StorageOptions,
  STORAGE_DEFAULT_SIGNED_URL_EXPIRES,
} from "@anchan828/nest-storage-common";
import { Bucket, Storage } from "@google-cloud/storage";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { parse as parseUrl } from "url";
import { GoogleCloudStorageModuleOptions } from "./gcs-storage.interface";
export class GoogleCloudStorage extends AbstractStorage {
  constructor(
    protected readonly moduleOptions: GoogleCloudStorageModuleOptions,
    protected readonly service: CommonStorageService,
  ) {
    super(moduleOptions, service);
  }

  public async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string> {
    const bucket = this.getBuket(options);

    const [file] = await bucket.upload(dataPath, { destination: filename, gzip: true });
    return file.name;
  }

  public async download(filename: string, options?: StorageOptions): Promise<string> {
    const cacheDir = this.service.getCacheDir();

    const bucket = this.getBuket(options);
    const destination = join(cacheDir, filename);

    if (!existsSync(destination)) {
      const destDirname = dirname(destination);

      if (!existsSync(destDirname)) {
        mkdirSync(destDirname, { recursive: true });
      }

      await bucket.file(filename).download({ destination });
    }
    return destination;
  }

  public async delete(filename: string, options?: StorageOptions): Promise<void> {
    const bucket = this.getBuket(options);
    await bucket.file(filename).delete();
  }

  public async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string> {
    const bucket = this.getBuket(options);
    const { action, contentType } = options;
    const expires = options.expires || STORAGE_DEFAULT_SIGNED_URL_EXPIRES;
    const [url] = await bucket.file(filename).getSignedUrl({
      action: this.getAction(action),
      contentType,
      expires: Date.now() + expires,
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
    const urlObject = parseUrl(url);
    const endopint = new Storage(this.moduleOptions).apiEndpoint;

    if (urlObject.host !== endopint) {
      throw new Error(`Invalid endopint '${urlObject.host}'. endpoint should be ${endopint}`);
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

  private getBuket(options: StorageOptions = {}): Bucket {
    const storage = new Storage(this.moduleOptions);
    const bucketName = this.service.getBucket(options);
    return storage.bucket(bucketName);
  }

  private countString(target: string, str: string): number {
    return str.split(target).length - 1;
  }
}
