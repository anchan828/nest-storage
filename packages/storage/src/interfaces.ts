import type { StorageCoreModuleOptions, StorageOptions } from "@anchan828/nest-storage-common";
import type { RedisOptions } from "ioredis";
export type CompressType = "zip" | "tar" | "tgz";

export interface CompressOptions extends StorageOptions {
  compressType?: CompressType;
  destination?: string;
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
