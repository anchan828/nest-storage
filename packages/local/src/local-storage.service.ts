import {
  CommonStorageService,
  FILE_NOT_FOUND,
  StorageOptions,
  StorageService,
  STORAGE_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import { Inject } from "@nestjs/common";
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { LocalStorageModuleOptions } from "./local-storage.interface";
export class LocalStorageService extends StorageService {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) private readonly options: LocalStorageModuleOptions,
    private readonly service: CommonStorageService,
  ) {
    super();
  }

  public async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string> {
    const bucket = this.service.getBucket(options);
    const dest = join(this.options.dir, bucket, this.service.getPrefix(options), filename);
    const destDirname = dirname(dest);

    if (!existsSync(destDirname)) {
      mkdirSync(destDirname, { recursive: true });
    }

    copyFileSync(dataPath, dest);
    return dest;
  }

  public async download(filename: string, options?: StorageOptions): Promise<string> {
    const bucket = this.service.getBucket(options);
    const dest = join(this.options.dir, bucket, this.service.getPrefix(options), filename);

    if (!existsSync(dest)) {
      throw new Error(FILE_NOT_FOUND(bucket, filename));
    }

    return dest;
  }

  public async delete(filename: string, options?: StorageOptions): Promise<void> {
    const bucket = this.service.getBucket(options);
    const dest = join(this.options.dir, bucket, this.service.getPrefix(options), filename);

    if (!existsSync(dest)) {
      throw new Error(FILE_NOT_FOUND(bucket, filename));
    }

    unlinkSync(dest);
  }
}
