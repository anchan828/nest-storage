import {
  AbstractStorage,
  ParsedSignedUrl,
  SignedUrlOptions,
  StorageOptions,
  STORAGE_PROVIDER,
} from "@anchan828/nest-storage-common";
import { Inject, Injectable } from "@nestjs/common";
import * as compressing from "compressing";
import { createWriteStream } from "fs";
import * as pMap from "p-map";
import { tmpNameSync } from "tmp";
import { CompressFileEntry, CompressOptions, CompressType } from "./interfaces";
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
    if (!options?.compressType) {
      options = Object.assign({}, options, { compressType: "zip" });
    }
    const stream = this.getCompressStream(options.compressType);
    const dest = tmpNameSync({ postfix: this.getCompressFileExtension(options.compressType) });

    await pMap(entries, async (entry) => {
      const filename = typeof entry === "string" ? entry : entry.filename;
      const relativePath = typeof entry === "string" ? entry : entry.relativePath;
      const dataPath = await this.storage.download(filename, options);
      stream.addEntry(dataPath, { relativePath: relativePath.replace(/^\//g, "") });
    });

    stream.pipe(createWriteStream(dest));

    await new Promise((resolve, reject) => {
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
    return this.storage.getSignedUrl(filename, options);
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
