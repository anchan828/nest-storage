import { DynamicModule, Global, Module } from "@nestjs/common";
import { STORAGE_MODULE_OPTIONS, STORAGE_PROVIDER_MODULE_OPTIONS } from "./constants";
import {
  StorageModuleAsyncOptions,
  StorageModuleOptions,
  StorageProviderModuleAsyncOptions,
  StorageProviderModuleOptions,
} from "./interfaces";
import { createAsyncProviders } from "./providers";
import { CommonStorageService } from "./service";

@Global()
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

  public static registerAsync(options: StorageModuleAsyncOptions<StorageModuleOptions>): DynamicModule {
    const asyncProviders = createAsyncProviders(STORAGE_MODULE_OPTIONS, options);
    const providers = [...asyncProviders, CommonStorageService];
    return {
      exports: providers,
      imports: [...(options.imports || [])],
      module: StorageCoreModule,
      providers,
    };
  }
}

@Global()
@Module({})
export class StorageProviderCoreModule {
  public static register(options: StorageProviderModuleOptions): DynamicModule {
    const providers = [{ provide: STORAGE_PROVIDER_MODULE_OPTIONS, useValue: options }];
    return {
      exports: providers,
      module: StorageCoreModule,
      providers,
    };
  }

  public static registerAsync(options: StorageProviderModuleAsyncOptions<StorageProviderModuleOptions>): DynamicModule {
    const asyncProviders = createAsyncProviders(STORAGE_PROVIDER_MODULE_OPTIONS, options);
    const providers = [...asyncProviders];
    return {
      exports: providers,
      imports: [...(options.imports || [])],
      module: StorageCoreModule,
      providers,
    };
  }
}
