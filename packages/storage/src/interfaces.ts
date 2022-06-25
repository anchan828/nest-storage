import type {
  StorageCoreModuleOptions,
  StorageCoreModuleOptionsFactory,
  StorageOptions,
} from "@anchan828/nest-storage-common";
export type CompressType = "zip" | "tar" | "tgz";

export interface CompressOptions extends StorageOptions {
  compressType?: CompressType;
  destination?: string;
}

export type UploadStorageOptions = StorageOptions;

export type DownloadStorageOptions = StorageOptions;

export type DeleteStorageOptions = StorageOptions;

export interface CompressFileEntry {
  filename: string;
  relativePath: string;
}

export type StorageModuleOptions = StorageCoreModuleOptions;

export type StorageModuleOptionsFactory = StorageCoreModuleOptionsFactory<StorageModuleOptions>;
