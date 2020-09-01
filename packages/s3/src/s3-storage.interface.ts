import type { StorageProviderModuleAsyncOptions, StorageProviderModuleOptions } from "@anchan828/nest-storage-common";
import type { S3 } from "aws-sdk";

export interface S3StorageProviderModuleOptions extends StorageProviderModuleOptions, S3.ClientConfiguration {}

export type S3StorageProviderModuleAsyncOptions = StorageProviderModuleAsyncOptions<S3StorageProviderModuleOptions>;
