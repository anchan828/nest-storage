import { StorageModuleAsyncOptions, StorageModuleOptions, StorageOptions } from "@anchan828/nest-storage-common";
import {
  DeleteFileOptions,
  DownloadOptions as GCSDownloadOptions,
  FileOptions,
  StorageOptions as GCSStorageOptions,
  UploadOptions as GCSUploadOptions,
} from "@google-cloud/storage";
export interface GoogleCloudStorageModuleOptions extends StorageModuleOptions, GCSStorageOptions {}

export type GoogleCloudStorageModuleAsyncOptions = StorageModuleAsyncOptions<GoogleCloudStorageModuleOptions>;

export interface GoogleCloudStorageUploadOptions extends StorageOptions, GCSUploadOptions {}
export interface GoogleCloudStorageDownloadOptions extends StorageOptions {
  fileOptions?: FileOptions;
  downloadOptions?: GCSDownloadOptions;
}

export interface GoogleCloudStorageDeleteOptions extends StorageOptions, DeleteFileOptions {
  fileOptions?: FileOptions;
  deleteOptions?: DeleteFileOptions;
}
