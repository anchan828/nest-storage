import type { StorageModuleAsyncOptions, StorageModuleOptions } from "@anchan828/nest-storage-common";
import { StorageCoreModule } from "@anchan828/nest-storage-common";
import type { DynamicModule } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
@Global()
@Module({})
export class StorageModule {
  public static register<Options extends StorageModuleOptions = StorageModuleOptions>(
    options: Options,
    storageProviderModule: DynamicModule,
  ): DynamicModule {
    const providers = [StorageService];
    return {
      exports: providers,
      imports: [StorageCoreModule.register(options), storageProviderModule],
      module: StorageModule,
      providers,
    };
  }

  public static registerAsync(
    options: StorageModuleAsyncOptions<StorageModuleOptions>,
    storageProviderModule: DynamicModule,
  ): DynamicModule {
    const providers = [StorageService];
    return {
      exports: providers,
      imports: [StorageCoreModule.registerAsync(options), storageProviderModule],
      module: StorageModule,
      providers,
    };
  }
}
