import {
  CommonStorageService,
  StorageOptions,
  StorageService,
  STORAGE_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import { Bucket, Storage } from "@google-cloud/storage";
import { Inject } from "@nestjs/common";
import { existsSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import {
  DeleteOptions,
  DownloadOptions,
  GoogleCloudStorageModuleOptions,
  UploadOptions,
} from "./gcs-storage.interface";
export class GoogleCloudStorageService extends StorageService {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) private readonly options: GoogleCloudStorageModuleOptions,
    private readonly service: CommonStorageService,
  ) {
    super();
  }

  public async upload(dataPath: string, filename: string, options?: UploadOptions): Promise<string> {
    const bucket = this.getBuket(options);
    const destination = join(this.service.getPrefix(options), filename);

    if (!options?.destination) {
      options = Object.assign({}, options, { destination });
    }

    const res = await bucket.upload(dataPath, options);
    return res[0].name;
  }

  public async download(filename: string, options: DownloadOptions = {}): Promise<string> {
    const cacheDir = this.options.cacheDir || tmpdir();

    const bucket = this.getBuket(options);
    const srcFilename = join(this.service.getPrefix(options), filename);
    const destination = join(cacheDir, this.service.getPrefix(options), filename);

    if (!existsSync(destination)) {
      const destDirname = dirname(destination);

      if (!existsSync(destDirname)) {
        mkdirSync(destDirname, { recursive: true });
      }

      if (!options.downloadOptions?.destination) {
        options.downloadOptions = Object.assign({}, options.downloadOptions, { destination });
      }

      await bucket.file(srcFilename, options.fileOptions).download(options.downloadOptions);
    }
    return destination;
  }

  public async delete(filename: string, options: DeleteOptions = {}): Promise<void> {
    const bucket = this.getBuket(options);
    const srcFilename = join(this.service.getPrefix(options), filename);
    await bucket.file(srcFilename, options.fileOptions).delete(options.deleteOptions);
  }

  private getBuket(options: StorageOptions = {}): Bucket {
    const storage = new Storage(this.options);
    const bucketName = this.service.getBucket(options);
    return storage.bucket(bucketName);
  }
}
