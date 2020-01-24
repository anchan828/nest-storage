import {
  AbstractStorage,
  CommonStorageService,
  ParsedSignedUrl,
  SignedUrlActionType,
  SignedUrlOptions,
  StorageOptions,
  STORAGE_DEFAULT_SIGNED_URL_EXPIRES,
} from "@anchan828/nest-storage-common";
import * as s3UriParser from "amazon-s3-uri";
import { S3 } from "aws-sdk";
import { createReadStream, createWriteStream, existsSync, unlinkSync } from "fs";
import { Readable } from "stream";
import { S3StorageModuleOptions } from "./s3-storage.interface";

export class S3Storage extends AbstractStorage {
  public provider = "s3";

  constructor(
    protected readonly moduleOptions: S3StorageModuleOptions,
    protected readonly service: CommonStorageService,
  ) {
    super(moduleOptions, service);
  }

  public async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string> {
    const bucket = this.getBuket();
    const res = await bucket
      .upload({
        Body: createReadStream(dataPath),
        Bucket: this.service.getBucket(options),
        Key: filename,
      })
      .promise();
    await this.copyFileAsync(dataPath, this.getDestinationCachePath(filename, options));
    return res.Key;
  }

  public async download(filename: string, options?: StorageOptions): Promise<string> {
    const destination = this.getDestinationCachePath(filename, options);

    if (!existsSync(destination)) {
      const bucketName = this.service.getBucket(options);
      const bucket = this.getBuket();
      const readstream = bucket.getObject({ Bucket: bucketName, Key: filename }).createReadStream();
      await this.writeFileStream(readstream, destination);
    }
    return destination;
  }

  public async delete(filename: string, options?: StorageOptions): Promise<void> {
    const bucket = this.getBuket();
    await bucket.deleteObject({ Bucket: this.service.getBucket(options), Key: filename }).promise();
    unlinkSync(this.getDestinationCachePath(filename, options));
  }

  public async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string> {
    const bucket = this.getBuket();
    const bucketName = this.service.getBucket(options);
    const { action, expires } = options;

    return bucket.getSignedUrlPromise(this.getOperation(action), {
      Bucket: bucketName,
      Expires: this.getExpires(expires),
      Key: filename,
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
    return new S3({ ...this.moduleOptions, maxRetries: 5, signatureVersion: "v4" });
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
        .on("error", error => reject(error))
        .pipe(createWriteStream(destination))
        .on("error", error => reject(error))
        .on("close", () => resolve());
    });
  }
}
