import { CommonStorageService, StorageService, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { Inject } from "@nestjs/common";
import { GoogleCloudStorageModuleOptions } from "./gcs-storage.interface";
export class GoogleCloudStorageService extends StorageService {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) private readonly options: GoogleCloudStorageModuleOptions,
    private readonly service: CommonStorageService,
  ) {
    super();
  }
}
