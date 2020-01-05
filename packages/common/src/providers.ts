import { Provider, Type } from "@nestjs/common";
import { ClassProvider, FactoryProvider } from "@nestjs/common/interfaces";
import { STORAGE_MODULE_OPTIONS } from "./constants";
import { StorageModuleAsyncOptions, StorageModuleOptions, StorageModuleOptionsFactory } from "./interfaces";

export function createAsyncOptionsProvider(options: StorageModuleAsyncOptions): FactoryProvider {
  if (options.useFactory) {
    return {
      inject: options.inject || [],
      provide: STORAGE_MODULE_OPTIONS,
      useFactory: options.useFactory,
    };
  }
  return {
    inject: [options.useClass || options.useExisting].filter(
      (x): x is Type<StorageModuleOptionsFactory> => x !== undefined,
    ),
    provide: STORAGE_MODULE_OPTIONS,
    useFactory: async (optionsFactory: StorageModuleOptionsFactory): Promise<StorageModuleOptions> =>
      await optionsFactory.createStorageModuleOptions(),
  };
}

export function createAsyncProviders(options: StorageModuleAsyncOptions): Provider[] {
  const asyncOptionsProvider = createAsyncOptionsProvider(options);
  if (options.useExisting || options.useFactory) {
    return [asyncOptionsProvider];
  }
  return [
    asyncOptionsProvider,
    {
      provide: options.useClass,
      useClass: options.useClass,
    } as ClassProvider,
  ];
}
