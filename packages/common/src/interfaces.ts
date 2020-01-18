import { Type } from "@nestjs/common";
import { ModuleMetadata } from "@nestjs/common/interfaces";
import { CommonStorageService } from "./service";

export abstract class AbstractStorage {
  constructor(
    protected readonly moduleOptions: StorageModuleOptions,
    protected readonly service: CommonStorageService,
  ) {}

  public abstract async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string>;

  public abstract async download(filename: string, options?: StorageOptions): Promise<string>;

  public abstract async delete(filename: string, options?: StorageOptions): Promise<void>;

  public abstract async getSignedUrl(filename: string, options: SignedUrlOptions): Promise<string>;

  public abstract parseSignedUrl(url: string): ParsedSignedUrl;
}

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
