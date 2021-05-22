import type {
  ParsedSignedUrl,
  SignedUrlActionType,
  SignedUrlOptions,
  StorageOptions,
} from "@anchan828/nest-storage-common";
import {
  AbstractStorage,
  CommonStorageUtils,
  StorageCoreModuleOptions,
  STORAGE_DEFAULT_SIGNED_URL_EXPIRES,
  STORAGE_MODULE_OPTIONS,
  STORAGE_PROVIDER_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import { Inject, Injectable } from "@nestjs/common";
import * as s3UriParser from "amazon-s3-uri";
import { S3 } from "aws-sdk";
import { createReadStream, createWriteStream, existsSync, promises } from "fs";
import { basename } from "path";
import type { Readable } from "stream";
import { S3StorageProviderModuleOptions } from "./s3-storage.interface";

@Injectable()
export class S3Storage extends AbstractStorage {
  public provider = "s3";

  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) protected readonly storageOptions: StorageCoreModuleOptions,
    @Inject(STORAGE_PROVIDER_MODULE_OPTIONS) protected readonly providerOptions: S3StorageProviderModuleOptions,
  ) {
    super(storageOptions);
  }

  public async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string> {
    const bucket = this.getBuket();
    const { bucket: Bucket, name: Key } = CommonStorageUtils.parseBuketAndFilename(
      filename,
      this.storageOptions,
      options,
    );
    const res = await bucket
      .upload({
        Body: createReadStream(dataPath),
        Bucket,
        Key,
      })
      .promise();
    await promises.copyFile(dataPath, await this.getDestinationCachePath(filename, options));
    return res.Key;
  }

  public async download(filename: string, options?: StorageOptions): Promise<string> {
    const destination = await this.getDestinationCachePath(filename, options);

    if (!existsSync(destination)) {
      const { bucket: Bucket, name: Key } = CommonStorageUtils.parseBuketAndFilename(
        filename,
        this.storageOptions,
        options,
      );
      const bucket = this.getBuket();
      const readstream = bucket.getObject({ Bucket, Key }).createReadStream();
      await this.writeFileStream(readstream, destination);
    }
    return destination;
  }

  public async delete(filename: string, options?: StorageOptions): Promise<void> {
    const bucket = this.getBuket();
    const { bucket: Bucket, name: Key } = CommonStorageUtils.parseBuketAndFilename(
      filename,
      this.storageOptions,
      options,
    );
    await bucket.deleteObject({ Bucket, Key }).promise();
    await promises.unlink(await this.getDestinationCachePath(filename, options));
  }

  public async exists(filename: string, options?: StorageOptions): Promise<boolean> {
    const bucket = this.getBuket();
    try {
      const { bucket: Bucket, name: Key } = CommonStorageUtils.parseBuketAndFilename(
        filename,
        this.storageOptions,
        options,
      );
      await bucket.headObject({ Bucket, Key }).promise();
      return true;
    } catch {
      return false;
    }
  }

  public async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string> {
    const bucket = this.getBuket();
    const { bucket: Bucket, name: Key } = CommonStorageUtils.parseBuketAndFilename(
      filename,
      this.storageOptions,
      options,
    );
    const { action, expires } = options;

    return bucket.getSignedUrlPromise(this.getOperation(action), {
      Bucket,
      Expires: this.getExpires(expires),
      Key,
      ResponseContentDisposition: options.responseDispositionFilename
        ? `attachment; filename="${basename(options.responseDispositionFilename)}"`
        : undefined,
    });
  }

  public parseSignedUrl(url: string): ParsedSignedUrl {
    const urlObject = s3UriParser(url);
    return {
      bucket: urlObject.bucket,
      filename: urlObject.key,
    } as ParsedSignedUrl;
  }

  private getBuket(): S3 {
    return new S3({ ...this.providerOptions, maxRetries: 5, signatureVersion: "v4" });
  }

  private getOperation(action: SignedUrlActionType): string {
    switch (action) {
      case "upload":
        return "putObject";
      case "download":
        return "getObject";
      case "delete":
        return "deleteObject";
    }
  }

  private getExpires(expires?: number): number {
    return (expires ? expires : STORAGE_DEFAULT_SIGNED_URL_EXPIRES) / 1000;
  }

  private writeFileStream(readstream: Readable, destination: string): Promise<void> {
    return new Promise((resolve, reject) => {
      readstream
        .on("error", (error) => reject(error))
        .pipe(createWriteStream(destination))
        .on("error", (error) => reject(error))
        .on("close", () => resolve());
    });
  }
}
