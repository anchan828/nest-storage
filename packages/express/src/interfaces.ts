import type {
  SignedUrlActionType,
  StorageProviderModuleAsyncOptions,
  StorageProviderModuleOptions,
  StorageProviderModuleOptionsFactory,
  StorageProviderSignedUrlOptions,
} from "@anchan828/nest-storage-common";

export interface LocalStorageProviderModuleOptions extends StorageProviderModuleOptions {
  /**
   * Set property if you upload file using signed url. LocalStorage provider only.
   *
   * @type {signedUrlOptions}
   * @memberof StorageCoreModuleOptions
   */
  signedUrlOptions?: signedUrlOptions;
}

export type LocalStorageProviderModuleAsyncOptions =
  StorageProviderModuleAsyncOptions<LocalStorageProviderModuleOptions>;
export type LocalStorageProviderModuleOptionsFactory =
  StorageProviderModuleOptionsFactory<LocalStorageProviderModuleOptions>;

export interface signedUrlOptions extends StorageProviderSignedUrlOptions {
  path?: string;
  token?: string;
}

export interface SignedUrlPayload {
  action: SignedUrlActionType;
  bucket: string;
  filename: string;

  responseDispositionFilename?: string;
}
export interface MiddlewareHandlerParams {
  bucket: string;
  filename: string;
  responseDispositionFilename?: string;
}
