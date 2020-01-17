import { StorageModuleAsyncOptions, StorageModuleOptions } from "@anchan828/nest-storage-common";
import { S3 } from "aws-sdk";

export interface S3StorageModuleOptions extends StorageModuleOptions, S3.ClientConfiguration {}

export type S3StorageModuleAsyncOptions = StorageModuleAsyncOptions<S3StorageModuleOptions>;
