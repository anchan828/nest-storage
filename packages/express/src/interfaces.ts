import type { StorageProviderModuleOptions } from "@anchan828/nest-storage-common";

export interface LocalStorageProviderModuleOptions extends StorageProviderModuleOptions {
  /**
   * Set property if you upload file using signed url. LocalStorage provider only.
   *
   * @type {SignedUrlController}
   * @memberof StorageModuleOptions
   */
  signedUrlController?: SignedUrlController;
}

export interface SignedUrlController {
  endpoint?: string;
  path?: string;
  token?: string;
}
