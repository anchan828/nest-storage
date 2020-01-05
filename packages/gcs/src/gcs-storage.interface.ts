import { StorageModuleAsyncOptions, StorageModuleOptions } from "@anchan828/nest-storage-common";

export interface GoogleCloudStorageModuleOptions extends StorageModuleOptions {
  keyFilename?: string;
}

export type GoogleCloudStorageModuleAsyncOptions = StorageModuleAsyncOptions<GoogleCloudStorageModuleOptions>;
