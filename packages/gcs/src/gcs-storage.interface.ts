import { StorageProviderModuleAsyncOptions, StorageProviderModuleOptions } from "@anchan828/nest-storage-common";
import { StorageOptions as GCSStorageOptions } from "@google-cloud/storage";
export interface GoogleCloudStorageProviderModuleOptions extends StorageProviderModuleOptions, GCSStorageOptions {}

export type GoogleCloudStorageProviderModuleAsyncOptions = StorageProviderModuleAsyncOptions<
  GoogleCloudStorageProviderModuleOptions
>;
