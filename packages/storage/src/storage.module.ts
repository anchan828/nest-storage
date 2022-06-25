import type { StorageCoreModuleOptions, StorageModuleAsyncOptions } from "@anchan828/nest-storage-common";
import { StorageCoreModule } from "@anchan828/nest-storage-common";
import type { DynamicModule } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";
import type { StorageModuleOptions } from "./interfaces";
import { StorageService } from "./storage.service";
@Global()
@Module({})
export class StorageModule {
  public static register<Options extends StorageModuleOptions = StorageModuleOptions>(options: Options): DynamicModule {
    const providers = [StorageService];
    return {
      exports: providers,
      imports: [StorageCoreModule.register(options)],
      module: StorageModule,
      providers,
    };
  }

  public static registerAsync(options: StorageModuleAsyncOptions<StorageCoreModuleOptions>): DynamicModule {
    const providers = [StorageService];

    return {
      exports: providers,
      imports: [StorageCoreModule.registerAsync(options)],
      module: StorageModule,
      providers,
    };
  }
}
