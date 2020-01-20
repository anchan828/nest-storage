import { Type } from "@nestjs/common";
import { ModuleMetadata } from "@nestjs/common/interfaces";
import { AbstractStorage } from "./base.storage";
export interface StorageOptions {
  bucket?: string;
}

export interface StorageModuleOptions {
  bucket?: string;
  cacheDir?: string;

  storage?: Type<AbstractStorage>;

  /**
   * Set property if you upload file using signed url. LocalStorage provider only.
   *
   * @type {SignedUrlController}
   * @memberof StorageModuleOptions
   */
  signedUrlController?: SignedUrlController;
}

export interface SignedUrlController {
  endpoint?: string;
  path?: string;
  token?: string;
}

export interface StorageModuleAsyncOptions<T extends StorageModuleOptions = StorageModuleOptions>
  extends Pick<ModuleMetadata, "imports"> {
  useClass?: Type<StorageModuleOptionsFactory<T>>;
  useExisting?: Type<StorageModuleOptionsFactory<T>>;
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: Array<Type<StorageModuleOptionsFactory<T>> | string | any>;
}

export interface StorageModuleOptionsFactory<T extends StorageModuleOptions = StorageModuleOptions> {
  createStorageModuleOptions(): Promise<T> | T;
}

export type SignedUrlActionType = "upload" | "download" | "delete";

export interface SignedUrlOptions extends StorageOptions {
  action: SignedUrlActionType;

  // Milliseconds. default is 900000 = 15 mins
  expires?: number;

  contentType?: string;
}

export interface ParsedSignedUrl {
  bucket: string;
  filename: string;
}
