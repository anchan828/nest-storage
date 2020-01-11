import { StorageModuleAsyncOptions, StorageModuleOptions, StorageOptions } from "@anchan828/nest-storage-common";
import { S3 } from "aws-sdk";

export interface S3StorageModuleOptions extends StorageModuleOptions, S3.ClientConfiguration {}

export type S3StorageModuleAsyncOptions = StorageModuleAsyncOptions<S3StorageModuleOptions>;

export interface S3StorageUploadOptions extends StorageOptions, Partial<S3.PutObjectRequest> {}

export interface S3StorageDownloadOptions extends StorageOptions, Partial<S3.GetObjectRequest> {}

export interface S3StorageDeleteOptions extends StorageOptions, Partial<S3.DeleteObjectRequest> {}
