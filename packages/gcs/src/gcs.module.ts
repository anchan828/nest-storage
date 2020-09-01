import { StorageProviderCoreModule, STORAGE_PROVIDER } from "@anchan828/nest-storage-common";
import type { ClassProvider, DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type {
  GoogleCloudStorageProviderModuleAsyncOptions,
  GoogleCloudStorageProviderModuleOptions,
} from "./gcs-storage.interface";
import { GoogleCloudStorage } from "./gcs.storage";

const storageProvider = { provide: STORAGE_PROVIDER, useClass: GoogleCloudStorage } as ClassProvider;

@Module({})
export class GoogleCloudStorageProviderModule {
  public static register(options: GoogleCloudStorageProviderModuleOptions = {}): DynamicModule {
    return {
      exports: [storageProvider],
      imports: [StorageProviderCoreModule.register(options)],
      module: GoogleCloudStorageProviderModule,
      providers: [storageProvider],
    };
  }

  public static registerAsync(options: GoogleCloudStorageProviderModuleAsyncOptions = {}): DynamicModule {
    return {
      exports: [storageProvider],
      imports: [StorageProviderCoreModule.registerAsync(options)],
      module: GoogleCloudStorageProviderModule,
      providers: [storageProvider],
    };
  }
}
