import type { ParsedSignedUrl, SignedUrlOptions, StorageOptions } from "@anchan828/nest-storage-common";
import { AbstractStorage, STORAGE_MODULE_OPTIONS, STORAGE_PROVIDER } from "@anchan828/nest-storage-common";
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
import { waitUntil } from "./wait-until";
@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) moduleOptions: StorageModuleOptions,
    @Inject(STORAGE_PROVIDER) private readonly storage: AbstractStorage,
  ) {}

  public async upload(dataPath: string, filename: string, options: UploadStorageOptions = {}): Promise<string> {
    return await this.storage.upload(dataPath, filename, options);
  }

  public async download(filename: string, options: DownloadStorageOptions = {}): Promise<string> {
    return await this.storage.download(filename, options);
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
    return await this.storage.getSignedUrl(filename, options);
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
