import { StorageCoreModule, StorageModuleAsyncOptions, StorageModuleOptions } from "@anchan828/nest-storage-common";
import { DynamicModule, Global, Module } from "@nestjs/common";
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

  public static registerAsync<Options extends StorageModuleAsyncOptions = StorageModuleAsyncOptions>(
    options: Options,
  ): DynamicModule {
    const providers = [StorageService];
    return {
      exports: providers,
      imports: [StorageCoreModule.registerAsync(options)],
      module: StorageModule,
      providers,
    };
  }
}
