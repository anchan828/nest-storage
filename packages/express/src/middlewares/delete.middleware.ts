import type { SignedUrlActionType } from "@anchan828/nest-storage-common";
import { STORAGE_PROVIDER, STORAGE_PROVIDER_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { LocalStorageProviderModuleOptions } from "../interfaces";
import { LocalStorage } from "../local.storage";
import { StorageBaseMiddleware } from "./base.middleware";
@Injectable()
export class StorageDeleteMiddleware extends StorageBaseMiddleware {
  constructor(
    @Inject(STORAGE_PROVIDER_MODULE_OPTIONS) readonly moduleOptions: LocalStorageProviderModuleOptions,
    @Inject(STORAGE_PROVIDER) private readonly storage: LocalStorage,
  ) {
    super(moduleOptions);
  }

  getAction(): SignedUrlActionType {
    return "delete";
  }

  async handler(bucket: string, filename: string): Promise<void> {
    await this.storage.delete(filename, { bucket }).catch((e) => {
      throw new BadRequestException(e.message);
    });
  }
}
