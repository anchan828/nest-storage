import type {
  StorageCoreModuleOptions,
  StorageCoreModuleOptionsFactory,
  StorageOptions,
} from "@anchan828/nest-storage-common";
import type { RedisOptions } from "ioredis";
export type CompressType = "zip" | "tar" | "tgz";

export interface CompressOptions extends StorageOptions {
  compressType?: CompressType;
  destination?: string;
}

export interface UploadStorageOptions extends StorageOptions {
  disableRedisCaching?: boolean;
}

export interface DownloadStorageOptions extends StorageOptions {
  disableRedisCaching?: boolean;
}

export interface CompressFileEntry {
  filename: string;
  relativePath: string;
}

export interface StorageRedisOptions {
  options: RedisOptions;
  ttl?: number;
  prefixKey?: string;
}

export interface StorageModuleOptions extends StorageCoreModuleOptions {
  redis?: StorageRedisOptions;
}

export type StorageModuleOptionsFactory = StorageCoreModuleOptionsFactory<StorageModuleOptions>;
