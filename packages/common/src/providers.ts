import type { Provider, Type } from "@nestjs/common";
import type { ClassProvider, FactoryProvider } from "@nestjs/common/interfaces";
import type { AsyncOptions, StorageCoreModuleOptions, StorageCoreModuleOptionsFactory } from "./interfaces";

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
      (x): x is Type<StorageCoreModuleOptionsFactory<any>> => x !== undefined,
    ),
    provide: provide,
    useFactory: async (optionsFactory: StorageCoreModuleOptionsFactory<any>): Promise<StorageCoreModuleOptions> =>
      await optionsFactory.createStorageCoreModuleOptions(),
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
