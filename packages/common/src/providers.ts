import type { Provider, Type } from "@nestjs/common";
import type { ClassProvider, FactoryProvider } from "@nestjs/common/interfaces";
import type { AsyncOptions, StorageModuleOptions, StorageModuleOptionsFactory } from "./interfaces";

export function createAsyncOptionsProvider(provide: string, options: AsyncOptions): FactoryProvider {
  if (options.useFactory) {
    return {
      inject: options.inject || [],
      provide: provide,
      useFactory: options.useFactory,
    };
  }
  return {
    inject: [options.useClass || options.useExisting].filter(
      (x): x is Type<StorageModuleOptionsFactory<any>> => x !== undefined,
    ),
    provide: provide,
    useFactory: async (optionsFactory: StorageModuleOptionsFactory<any>): Promise<StorageModuleOptions> =>
      await optionsFactory.createStorageModuleOptions(),
  };
}

export function createAsyncProviders(provide: string, options: AsyncOptions): Provider[] {
  const asyncOptionsProvider = createAsyncOptionsProvider(provide, options);
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
