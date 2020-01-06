import { StorageModuleAsyncOptions, StorageModuleOptions, StorageOptions } from "@anchan828/nest-storage-common";
import {
  DeleteFileOptions,
  DownloadOptions as GCSDownloadOptions,
  FileOptions,
  StorageOptions as GCSStorageOptions,
  UploadOptions as GCSUploadOptions,
} from "@google-cloud/storage";
export interface GoogleCloudStorageModuleOptions extends StorageModuleOptions, GCSStorageOptions {
  cacheDir?: string;
}

export type GoogleCloudStorageModuleAsyncOptions = StorageModuleAsyncOptions<GoogleCloudStorageModuleOptions>;

export interface UploadOptions extends StorageOptions, GCSUploadOptions {}
export interface DownloadOptions extends StorageOptions {
  fileOptions?: FileOptions;
  downloadOptions?: GCSDownloadOptions;
}

export interface DeleteOptions extends StorageOptions, DeleteFileOptions {
  fileOptions?: FileOptions;
  deleteOptions?: DeleteFileOptions;
}
