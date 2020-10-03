import type { ModuleMetadata, Type } from "@nestjs/common";
export interface StorageOptions {
  bucket?: string;
}

export interface StorageModuleOptions {
  bucket?: string;
  cacheDir?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StorageProviderModuleOptions extends StorageOptions {}

export interface AsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useClass?: Type<any>;
  useExisting?: Type<any>;
  useFactory?: (...args: any[]) => Promise<any> | any;
  inject?: Array<Type<StorageModuleOptionsFactory<any>> | string | any>;
}

export interface StorageModuleAsyncOptions<T> extends AsyncOptions {
  useClass?: Type<StorageModuleOptionsFactory<T>>;

  useExisting?: Type<StorageModuleOptionsFactory<T>>;
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: Array<Type<StorageModuleOptionsFactory<T>> | string | any>;
}

export interface StorageModuleOptionsFactory<T> {
  createStorageModuleOptions(): Promise<T> | T;
}

export interface StorageProviderModuleAsyncOptions<T> extends AsyncOptions {
  useClass?: Type<StorageProviderModuleOptionsFactory<T>>;
  useExisting?: Type<StorageProviderModuleOptionsFactory<T>>;
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: Array<Type<StorageProviderModuleOptionsFactory<T>> | string | any>;
}

export interface StorageProviderModuleOptionsFactory<T> {
  createStorageProviderModuleOptions(): Promise<T> | T;
}
export type SignedUrlActionType = "upload" | "download" | "delete";

export interface SignedUrlOptions extends StorageOptions {
  action: SignedUrlActionType;

  // Milliseconds. default is 900000 = 15 mins
  expires?: number;

  contentType?: string;

  /**
   * This is used to cache the retrieved URLs.
   */
  cache?: CacheService;
}

interface CacheService {
  getCache: (key: string) => Promise<string | undefined>;
  setCache: (key: string, signedUrl: string, ttl?: number) => Promise<void>;
}

export interface ParsedSignedUrl {
  bucket: string;
  filename: string;
}
