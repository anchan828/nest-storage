import { DynamicModule, Module } from "@nestjs/common";
import { STORAGE_MODULE_OPTIONS } from "./constants";
import { StorageModuleAsyncOptions, StorageModuleOptions } from "./interfaces";
import { createAsyncProviders } from "./providers";
import { CommonStorageService } from "./service";
@Module({})
export class StorageCoreModule {
  public static register(options: StorageModuleOptions): DynamicModule {
    const providers = [{ provide: STORAGE_MODULE_OPTIONS, useValue: options }, CommonStorageService];
    return {
      exports: providers,
      module: StorageCoreModule,
      providers,
    };
  }

  public static registerAsync(options: StorageModuleAsyncOptions): DynamicModule {
    const asyncProviders = createAsyncProviders(options);
    const providers = [...asyncProviders, CommonStorageService];
    return {
      exports: providers,
      imports: [...(options.imports || [])],
      module: StorageCoreModule,
      providers,
    };
  }
}
