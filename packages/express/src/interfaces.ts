import type {
  StorageProviderModuleAsyncOptions,
  StorageProviderModuleOptions,
  StorageProviderModuleOptionsFactory,
} from "@anchan828/nest-storage-common";

export interface LocalStorageProviderModuleOptions extends StorageProviderModuleOptions {
  /**
   * Set property if you upload file using signed url. LocalStorage provider only.
   *
   * @type {SignedUrlController}
   * @memberof StorageCoreModuleOptions
   */
  signedUrlController?: SignedUrlController;
}

export type LocalStorageProviderModuleAsyncOptions = StorageProviderModuleAsyncOptions<LocalStorageProviderModuleOptions>;
export type LocalStorageProviderModuleOptionsFactory = StorageProviderModuleOptionsFactory<LocalStorageProviderModuleOptions>;

export interface SignedUrlController {
  endpoint: string;
  path?: string;
  token?: string;
}
