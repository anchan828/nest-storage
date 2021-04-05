import type {
  StorageProviderModuleAsyncOptions,
  StorageProviderModuleOptions,
  StorageProviderModuleOptionsFactory,
} from "@anchan828/nest-storage-common";
import type { StorageOptions as GCSStorageOptions } from "@google-cloud/storage";
export interface GoogleCloudStorageProviderModuleOptions extends StorageProviderModuleOptions, GCSStorageOptions {}
export type GoogleCloudStorageProviderModuleAsyncOptions = StorageProviderModuleAsyncOptions<GoogleCloudStorageProviderModuleOptions>;
export type GoogleCloudStorageProviderModuleOptionsFactory = StorageProviderModuleOptionsFactory<GoogleCloudStorageProviderModuleOptions>;
