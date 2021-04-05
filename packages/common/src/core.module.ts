import type { DynamicModule } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";
import { STORAGE_MODULE_OPTIONS, STORAGE_PROVIDER_MODULE_OPTIONS } from "./constants";
import type {
  StorageCoreModuleOptions,
  StorageModuleAsyncOptions,
  StorageProviderModuleAsyncOptions,
  StorageProviderModuleOptions,
} from "./interfaces";
import { createAsyncProviders } from "./providers";

@Global()
@Module({})
export class StorageCoreModule {
  public static register(options: StorageCoreModuleOptions): DynamicModule {
    const providers = [{ provide: STORAGE_MODULE_OPTIONS, useValue: options }];
    return {
      exports: providers,
      module: StorageCoreModule,
      providers,
    };
  }

  public static registerAsync(options: StorageModuleAsyncOptions<StorageCoreModuleOptions>): DynamicModule {
    const asyncProviders = createAsyncProviders(STORAGE_MODULE_OPTIONS, options);
    const providers = [...asyncProviders];
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
      module: StorageProviderCoreModule,
      providers,
    };
  }

  public static registerAsync(options: StorageProviderModuleAsyncOptions<StorageProviderModuleOptions>): DynamicModule {
    const asyncProviders = createAsyncProviders(STORAGE_PROVIDER_MODULE_OPTIONS, options);
    const providers = [...asyncProviders];
    return {
      exports: providers,
      imports: [...(options.imports || [])],
      module: StorageProviderCoreModule,
      providers,
    };
  }
}
