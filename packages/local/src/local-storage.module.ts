import { StorageCoreModule } from "@anchan828/nest-storage-common";
import { DynamicModule, Module } from "@nestjs/common";
import { LocalStorageModuleAsyncOptions, LocalStorageModuleOptions } from "./local-storage.interface";
import { LocalStorageService } from "./local-storage.service";

@Module({})
export class LocalStorageModule {
  public static register(options: LocalStorageModuleOptions): DynamicModule {
    const providers = [LocalStorageService];
    return {
      exports: providers,
      imports: [StorageCoreModule.register(options)],
      module: LocalStorageModule,
      providers,
    };
  }

  public static registerAsync(options: LocalStorageModuleAsyncOptions): DynamicModule {
    const providers = [LocalStorageService];
    return {
      exports: providers,
      imports: [StorageCoreModule.registerAsync(options)],
      module: LocalStorageModule,
      providers,
    };
  }
}
