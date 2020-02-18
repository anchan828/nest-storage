import {
  AbstractStorage,
  CommonStorageService,
  ParsedSignedUrl,
  SignedUrlOptions,
  StorageModuleOptions,
  StorageOptions,
  STORAGE_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import { Inject, Injectable, Type } from "@nestjs/common";
import { LocalStorage } from "./local/local.storage";

@Injectable()
export class StorageService {
  private readonly storage: AbstractStorage;

  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) private readonly options: StorageModuleOptions,
    private readonly service: CommonStorageService,
  ) {
    if (!options.storage) {
      this.options.storage = new LocalStorage(options, service);
    } else {
      this.options.storage = new (options.storage as Type<AbstractStorage>)(options, service) as AbstractStorage;
    }
    this.storage = this.options.storage;
  }

  public async upload(dataPath: string, filename: string, options: StorageOptions = {}): Promise<string> {
    return this.storage.upload(dataPath, filename, options);
  }

  public async download(filename: string, options: StorageOptions = {}): Promise<string> {
    return this.storage.download(filename, options);
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
}
