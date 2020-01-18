import { StorageModuleAsyncOptions, StorageModuleOptions } from "@anchan828/nest-storage-common";
import { StorageOptions as GCSStorageOptions } from "@google-cloud/storage";
export interface GoogleCloudStorageModuleOptions extends StorageModuleOptions, GCSStorageOptions {}

export type GoogleCloudStorageModuleAsyncOptions = StorageModuleAsyncOptions<GoogleCloudStorageModuleOptions>;
