import type { ParsedSignedUrl, SignedUrlOptions, StorageOptions } from "@anchan828/nest-storage-common";
import {
  AbstractStorage,
  STORAGE_DEFAULT_SIGNED_URL_EXPIRES,
  STORAGE_MODULE_OPTIONS,
  STORAGE_PROVIDER,
} from "@anchan828/nest-storage-common";
import { Inject, Injectable } from "@nestjs/common";
import * as compressing from "compressing";
import { createWriteStream, existsSync } from "fs";
import { parse } from "path";
import { tmpNameSync } from "tmp";
import type {
  CompressFileEntry,
  CompressOptions,
  CompressType,
  DeleteStorageOptions,
  DownloadStorageOptions,
  UploadStorageOptions,
} from "./interfaces";
import { StorageModuleOptions } from "./interfaces";
import { RedisService } from "./redis.service";
import { waitUntil } from "./wait-until";
@Injectable()
export class StorageService {
  #redis?: RedisService;

  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) moduleOptions: StorageModuleOptions,
    @Inject(STORAGE_PROVIDER) private readonly storage: AbstractStorage,
  ) {
    if (moduleOptions.redis) {
      this.#redis = new RedisService(moduleOptions.redis);
    }
  }

  public async upload(dataPath: string, filename: string, options: UploadStorageOptions = {}): Promise<string> {
    const dest = await this.storage.upload(dataPath, filename, options);

    if (this.#redis && !options.disableRedisCaching) {
      await this.#redis.upload(dataPath, await this.storage.getDestinationCachePath(filename, options));
    }

    return dest;
  }

  public async download(filename: string, options: DownloadStorageOptions = {}): Promise<string> {
    let existsRedisCache = false;

    if (this.#redis && !options.disableRedisCaching) {
      existsRedisCache = await this.#redis.download(await this.storage.getDestinationCachePath(filename, options));
    }

    const dataPath = await this.storage.download(filename, options);

    if (this.#redis && !existsRedisCache && !options.disableRedisCaching) {
      await this.#redis.upload(dataPath, await this.storage.getDestinationCachePath(filename, options));
    }

    return dataPath;
  }

  /**
   * Download files and compress to zip/tar/tgz
   */
  public async compress(entries: (string | CompressFileEntry)[], options?: CompressOptions): Promise<any> {
    const compressType = this.getCompressType(options);

    const dest = options?.destination || tmpNameSync({ postfix: this.getCompressFileExtension(compressType) });

    const compressFileEntries: CompressFileEntry[] = [];

    for (const entry of entries) {
      const filename = typeof entry === "string" ? entry : entry.filename;
      const relativePath = typeof entry === "string" ? entry : entry.relativePath;
      const dataPath = existsSync(filename) ? filename : await this.download(filename, options);
      compressFileEntries.push({ filename: dataPath, relativePath: relativePath.replace(/^\//g, "") });
    }

    const stream = this.getCompressStream(compressType);

    for (const compressFileEntry of compressFileEntries) {
      stream.addEntry(compressFileEntry.filename, { relativePath: compressFileEntry.relativePath });
    }

    const writeStream = createWriteStream(dest);
    stream.pipe(writeStream);

    await new Promise<void>((resolve, reject) => {
      stream.on("close", () => resolve());
      stream.on("error", (error) => reject(error));
    });

    await waitUntil(() => stream.destroyed);
    await waitUntil(() => writeStream.destroyed);

    return options?.destination || dest;
  }

  public async delete(filename: string, options: DeleteStorageOptions = {}): Promise<void> {
    if (this.#redis && !options.disableRedisCaching) {
      await this.#redis.delete(await this.storage.getDestinationCachePath(filename, options));
    }

    return this.storage.delete(filename, options);
  }

  public async exists(filename: string, options: StorageOptions = {}): Promise<boolean> {
    return this.storage.exists(filename, options);
  }

  public async copy(
    srcFilename: string,
    destFilename: string,
    srcOptions?: StorageOptions,
    destOptions?: StorageOptions,
  ): Promise<void> {
    return this.storage.copy(srcFilename, destFilename, srcOptions, destOptions);
  }

  public async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string> {
    const cacheKey = `__signed-url-caches:${filename}`;
    if (options.cache?.getCache) {
      const cache = await options.cache.getCache(cacheKey);
      if (cache) {
        return cache;
      }
    }

    const signedUrl = await this.storage.getSignedUrl(filename, options);

    if (options.cache?.setCache) {
      await options.cache.setCache(
        cacheKey,
        signedUrl,
        Math.floor((options.expires ?? STORAGE_DEFAULT_SIGNED_URL_EXPIRES) / 1000),
      );
    }

    return signedUrl;
  }

  public parseSignedUrl(url: string): ParsedSignedUrl {
    return this.storage.parseSignedUrl(url);
  }

  public async close(): Promise<void> {
    if (this.#redis) {
      await this.#redis.quit();
    }
  }

  private getCompressStream(
    compressType: CompressType,
  ): compressing.zip.Stream | compressing.tar.Stream | compressing.tgz.Stream {
    switch (compressType) {
      case "tar":
        return new compressing.tar.Stream();
      case "tgz":
        return new compressing.tgz.Stream();
      case "zip":
      default:
        return new compressing.zip.Stream();
    }
  }

  private getCompressFileExtension(compressType: CompressType): string {
    switch (compressType) {
      case "tar":
        return ".tar";
      case "tgz":
        return ".tar.gz";
      case "zip":
      default:
        return ".zip";
    }
  }

  private getCompressTypeFromExtension(destination: string): CompressType {
    const extension = parse(destination).ext;
    switch (extension) {
      case ".tar":
        return "tar";
      case ".tar.gz":
        return "tgz";
      case ".zip":
        return "zip";
      default:
        throw new Error(
          `The destination has unsupported extension. Please use .zip/.tar/.tar.gz instead of ${extension}`,
        );
    }
  }

  /**
   * Get compress type. default is zip
   *
   * @private
   * @param {CompressOptions} [options]
   * @return {*}  {CompressType}
   * @memberof StorageService
   */
  private getCompressType(options?: CompressOptions): CompressType {
    let compressType = options?.compressType;

    if (options?.destination) {
      compressType = this.getCompressTypeFromExtension(options.destination);
    }

    return compressType || "zip";
  }
}
