import { AbstractStorage, CommonStorageService } from "@anchan828/nest-storage-common";
import { S3 } from "aws-sdk";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { Readable } from "stream";
import {
  S3StorageDeleteOptions,
  S3StorageDownloadOptions,
  S3StorageModuleOptions,
  S3StorageUploadOptions,
} from "./s3-storage.interface";
export class S3Storage extends AbstractStorage {
  constructor(
    protected readonly moduleOptions: S3StorageModuleOptions,
    protected readonly service: CommonStorageService,
  ) {
    super(moduleOptions, service);
  }

  public async upload(dataPath: string, filename: string, options?: S3StorageUploadOptions): Promise<string> {
    const bucket = this.getBuket();
    const bucketName = this.service.getBucket(options);
    if (!options?.Key) {
      options = Object.assign({}, options, { Key: filename });
    }

    options.Bucket = bucketName;
    options.Body = createReadStream(dataPath);
    const res = await bucket.upload(options as S3.PutObjectRequest).promise();

    return res.Key;
  }

  public async download(filename: string, options: S3StorageDownloadOptions = {}): Promise<string> {
    const cacheDir = this.service.getCacheDir();

    const destination = join(cacheDir, filename);

    if (!existsSync(destination)) {
      const destDirname = dirname(destination);

      if (!existsSync(destDirname)) {
        mkdirSync(destDirname, { recursive: true });
      }

      const bucket = this.getBuket();
      const bucketName = this.service.getBucket(options);

      if (!options.Key) {
        options = Object.assign({}, options, { Key: filename });
      }
      options.Bucket = bucketName;
      const readstream = bucket.getObject(options as S3.GetObjectRequest).createReadStream();
      await this.writeFileStream(readstream, destination);
    }
    return destination;
  }

  public async delete(filename: string, options: S3StorageDeleteOptions = {}): Promise<void> {
    const bucket = this.getBuket();
    const bucketName = this.service.getBucket(options);

    if (!options.Key) {
      options = Object.assign({}, options, { Key: filename });
    }

    options.Bucket = bucketName;

    await bucket.deleteObject(options as S3.DeleteObjectRequest).promise();
  }

  private getBuket(): S3 {
    return new S3(this.moduleOptions);
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
