import type {
  StorageProviderModuleAsyncOptions,
  StorageProviderModuleOptions,
  StorageProviderModuleOptionsFactory,
} from "@anchan828/nest-storage-common";
import type { S3 } from "aws-sdk";

export interface S3StorageProviderModuleOptions extends StorageProviderModuleOptions, S3.ClientConfiguration {}
export type S3StorageProviderModuleAsyncOptions = StorageProviderModuleAsyncOptions<S3StorageProviderModuleOptions>;
export type S3StorageProviderModuleOptionsFactory = StorageProviderModuleOptionsFactory<S3StorageProviderModuleOptions>;
