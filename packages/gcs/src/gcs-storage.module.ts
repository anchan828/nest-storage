import { StorageCoreModule } from "@anchan828/nest-storage-common";
import { DynamicModule, Global, Module } from "@nestjs/common";
import { GoogleCloudStorageModuleAsyncOptions, GoogleCloudStorageModuleOptions } from "./gcs-storage.interface";
import { GoogleCloudStorageService } from "./gcs-storage.service";

@Global()
@Module({})
export class GoogleCloudStorageModule {
  public static register(options: GoogleCloudStorageModuleOptions): DynamicModule {
    const providers = [GoogleCloudStorageService];
    return {
      exports: providers,
      imports: [StorageCoreModule.register(options)],
      module: GoogleCloudStorageModule,
      providers,
    };
  }

  public static registerAsync(options: GoogleCloudStorageModuleAsyncOptions): DynamicModule {
    const providers = [GoogleCloudStorageService];
    return {
      exports: providers,
      imports: [StorageCoreModule.registerAsync(options)],
      module: GoogleCloudStorageModule,
      providers,
    };
  }
}
