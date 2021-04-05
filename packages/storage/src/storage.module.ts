import type { StorageCoreModuleOptions, StorageModuleAsyncOptions } from "@anchan828/nest-storage-common";
import { StorageCoreModule } from "@anchan828/nest-storage-common";
import type { DynamicModule, OnModuleDestroy } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";
import type { StorageModuleOptions } from "./interfaces";
import { StorageService } from "./storage.service";
@Global()
@Module({})
export class StorageModule implements OnModuleDestroy {
  constructor(private readonly service: StorageService) {}

  async onModuleDestroy(): Promise<void> {
    await this.service.close();
  }

  public static register<Options extends StorageModuleOptions = StorageModuleOptions>(
    options: Options,
    storageProviderModule: DynamicModule,
  ): DynamicModule {
    const providers = [StorageService];
    return {
      exports: providers,
      imports: [
        StorageCoreModule.registerAsync({
          imports: [storageProviderModule],
          useFactory: () => options,
        }),
      ],
      module: StorageModule,
      providers,
    };
  }

  public static registerAsync(
    options: StorageModuleAsyncOptions<StorageCoreModuleOptions>,
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
