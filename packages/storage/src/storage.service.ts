import {
  AbstractStorage,
  CommonStorageService,
  StorageModuleOptions,
  StorageOptions,
  STORAGE_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import { Inject, Injectable } from "@nestjs/common";
import { LocalStorage } from "./local.storage";

@Injectable()
export class StorageService {
  private readonly storage: AbstractStorage;

  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) private readonly options: StorageModuleOptions,
    private readonly service: CommonStorageService,
  ) {
    if (!options.storage) {
      this.storage = new LocalStorage(options, service);
    } else {
      this.storage = new options.storage(options, service);
    }
  }

  public async upload<Options extends StorageOptions = StorageOptions>(
    dataPath: string,
    filename: string,
    options?: Options,
  ): Promise<string> {
    return this.storage.upload(dataPath, filename, options);
  }

  public async download<Options extends StorageOptions = StorageOptions>(
    filename: string,
    options?: Options,
  ): Promise<string> {
    return this.storage.download(filename, options);
  }

  public async delete<Options extends StorageOptions = StorageOptions>(
    filename: string,
    options?: Options,
  ): Promise<void> {
    return this.storage.delete(filename, options);
  }
}
