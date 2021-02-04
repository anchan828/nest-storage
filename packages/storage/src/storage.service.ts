import type {
  AbstractStorage,
  ParsedSignedUrl,
  SignedUrlOptions,
  StorageOptions,
} from "@anchan828/nest-storage-common";
import { STORAGE_DEFAULT_SIGNED_URL_EXPIRES, STORAGE_PROVIDER } from "@anchan828/nest-storage-common";
import { Inject, Injectable } from "@nestjs/common";
import * as compressing from "compressing";
import { createWriteStream } from "fs";
import { tmpNameSync } from "tmp";
import type { CompressFileEntry, CompressOptions, CompressType } from "./interfaces";
@Injectable()
export class StorageService {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: AbstractStorage) {}

  public async upload(dataPath: string, filename: string, options: StorageOptions = {}): Promise<string> {
    return this.storage.upload(dataPath, filename, options);
  }

  public async download(filename: string, options: StorageOptions = {}): Promise<string> {
    return this.storage.download(filename, options);
  }

  /**
   * Download files and compress to zip/tar/tgz
   */
  public async compress(entries: (string | CompressFileEntry)[], options?: CompressOptions): Promise<any> {
    const compressType = options?.compressType || "zip";
    const stream = this.getCompressStream(compressType);
    const dest = tmpNameSync({ postfix: this.getCompressFileExtension(compressType) });

    for (const entry of entries) {
      const filename = typeof entry === "string" ? entry : entry.filename;
      const relativePath = typeof entry === "string" ? entry : entry.relativePath;
      const dataPath = await this.storage.download(filename, options);
      stream.addEntry(dataPath, { relativePath: relativePath.replace(/^\//g, "") });
    }

    stream.pipe(createWriteStream(dest));

    await new Promise<void>((resolve, reject) => {
      stream.on("end", () => resolve());
      stream.on("error", (error) => reject(error));
    });

    return dest;
  }

  public async delete(filename: string, options: StorageOptions = {}): Promise<void> {
    return this.storage.delete(filename, options);
  }

  public async exists(filename: string, options: StorageOptions = {}): Promise<boolean> {
    return this.storage.exists(filename, options);
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
}
