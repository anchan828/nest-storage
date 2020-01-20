import {
  AbstractStorage,
  CommonStorageService,
  FILE_NOT_FOUND,
  ParsedSignedUrl,
  SignedUrlOptions,
  StorageModuleOptions,
  StorageOptions,
  STORAGE_DEFAULT_SIGNED_URL_EXPIRES,
} from "@anchan828/nest-storage-common";
import { copyFile, existsSync, mkdirSync, unlinkSync } from "fs";
import * as jwt from "jsonwebtoken";
import { dirname, join } from "path";
import { parse } from "url";
import { promisify } from "util";
import { SIGNED_URL_CONTROLLER_PATH, SIGNED_URL_CONTROLLER_TOKEN } from "./constants";
const copyFileAsync = promisify(copyFile);
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

  public async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string> {
    const bucket = this.service.getBucket(options);
    if (!options.expires) {
      options.expires = STORAGE_DEFAULT_SIGNED_URL_EXPIRES;
    }

    const endpoint = this.moduleOptions.signedUrlController?.endpoint;
    const controllerPath = this.moduleOptions.signedUrlController?.path || SIGNED_URL_CONTROLLER_PATH;
    const token = this.moduleOptions.signedUrlController?.token || SIGNED_URL_CONTROLLER_TOKEN;
    const signature = jwt.sign({ ...options, bucket, filename }, token, { expiresIn: options.expires });
    return `${join(endpoint || "", controllerPath, bucket, filename)}?signature=${signature}`;
  }

  public parseSignedUrl(url: string): ParsedSignedUrl {
    const urlObject = parse(url);
    const controllerPath = this.moduleOptions.signedUrlController?.path || SIGNED_URL_CONTROLLER_PATH;

    if (!urlObject.pathname || this.countString("/", urlObject.pathname) < 3) {
      throw new Error(
        `Invalid pathname '${urlObject.pathname}'. pathname should be '${controllerPath}/bucket/path/to/filename.txt'`,
      );
    }
    const [, bucket, ...filename] = urlObject.pathname.replace(new RegExp(`^/?${controllerPath}`), "").split("/");

    return {
      bucket,
      filename: filename.join("/"),
    } as ParsedSignedUrl;
  }

  private countString(target: string, str: string): number {
    return str.split(target).length - 1;
  }
}
