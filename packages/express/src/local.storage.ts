import type { ParsedSignedUrl, SignedUrlOptions, StorageOptions } from "@anchan828/nest-storage-common";
import {
  AbstractStorage,
  CommonStorageUtils,
  FILE_NOT_FOUND,
  STORAGE_DEFAULT_SIGNED_URL_EXPIRES,
  STORAGE_MODULE_OPTIONS,
  STORAGE_PROVIDER_MODULE_OPTIONS,
  StorageCoreModuleOptions,
} from "@anchan828/nest-storage-common";
import { Inject, Injectable } from "@nestjs/common";
import { existsSync, unlinkSync } from "fs";
import * as jwt from "jsonwebtoken";
import { join } from "path";
import { URL } from "url";
import { SIGNED_URL_CONTROLLER_PATH, SIGNED_URL_CONTROLLER_TOKEN } from "./constants";
import { LocalStorageProviderModuleOptions } from "./interfaces";

@Injectable()
export class LocalStorage extends AbstractStorage {
  public provider = "local";

  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) protected readonly storageOptions: StorageCoreModuleOptions,
    @Inject(STORAGE_PROVIDER_MODULE_OPTIONS) protected readonly providerOptions: LocalStorageProviderModuleOptions,
  ) {
    super(storageOptions);
  }

  public async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string> {
    await this.copyFileAsync(dataPath, this.getDestinationCachePath(filename, options));
    return filename;
  }

  public async download(filename: string, options?: StorageOptions): Promise<string> {
    const destination = this.getDestinationCachePath(filename, options);

    if (!existsSync(destination)) {
      const { bucket, name } = CommonStorageUtils.parseBuketAndFilename(filename, this.storageOptions, options);
      throw new Error(FILE_NOT_FOUND(bucket, name));
    }

    return destination;
  }

  public async delete(filename: string, options?: StorageOptions): Promise<void> {
    const cacheDir = CommonStorageUtils.getCacheDir(this.storageOptions);
    const { bucket, name } = CommonStorageUtils.parseBuketAndFilename(filename, this.storageOptions, options);
    const dest = join(cacheDir, bucket, name);
    if (!existsSync(dest)) {
      throw new Error(FILE_NOT_FOUND(bucket, name));
    }

    unlinkSync(dest);
  }

  public async exists(filename: string, options?: StorageOptions): Promise<boolean> {
    const cacheDir = CommonStorageUtils.getCacheDir(this.storageOptions);
    const { bucket, name } = CommonStorageUtils.parseBuketAndFilename(filename, this.storageOptions, options);
    const dest = join(cacheDir, bucket, name);
    return existsSync(dest);
  }

  public async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string> {
    const { bucket, name } = CommonStorageUtils.parseBuketAndFilename(filename, this.storageOptions, options);
    if (!options.expires) {
      options.expires = STORAGE_DEFAULT_SIGNED_URL_EXPIRES;
    }

    const endpoint = this.providerOptions.signedUrlController?.endpoint;
    const controllerPath = this.providerOptions.signedUrlController?.path || SIGNED_URL_CONTROLLER_PATH;
    const token = this.providerOptions.signedUrlController?.token || SIGNED_URL_CONTROLLER_TOKEN;
    const signature = jwt.sign({ action: options.action, bucket, filename: name }, token, {
      expiresIn: options.expires,
    });

    return [endpoint, controllerPath, bucket, name].filter((x) => x).join("/") + `?signature=${signature}`;
  }

  public parseSignedUrl(url: string): ParsedSignedUrl {
    const urlObject = new URL(url);
    const controllerPath = this.providerOptions.signedUrlController?.path || SIGNED_URL_CONTROLLER_PATH;

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
