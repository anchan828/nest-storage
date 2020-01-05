import { StorageModuleAsyncOptions, StorageModuleOptions } from "@anchan828/nest-storage-common";

export interface LocalStorageModuleOptions extends StorageModuleOptions {
  dir: string;
}

export type LocalStorageModuleAsyncOptions = StorageModuleAsyncOptions<LocalStorageModuleOptions>;
