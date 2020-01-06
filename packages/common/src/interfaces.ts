import { Type } from "@nestjs/common";
import { ModuleMetadata } from "@nestjs/common/interfaces";

export abstract class StorageService {
  public abstract async upload(dataPath: string, filename: string, options?: StorageOptions): Promise<string>;

  public abstract async download(filename: string, options?: StorageOptions): Promise<string>;

  public abstract async delete(filename: string, options?: StorageOptions): Promise<void>;
}

export interface StorageOptions {
  bucket?: string;
  prefix?: string;
}

export interface StorageModuleOptions {
  bucket?: string;
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
