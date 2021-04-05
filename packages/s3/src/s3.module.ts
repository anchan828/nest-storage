import { StorageProviderCoreModule, STORAGE_PROVIDER } from "@anchan828/nest-storage-common";
import type { ClassProvider, DynamicModule } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";
import type { S3StorageProviderModuleAsyncOptions, S3StorageProviderModuleOptions } from "./s3-storage.interface";
import { S3Storage } from "./s3.storage";

const storageProvider = { provide: STORAGE_PROVIDER, useClass: S3Storage } as ClassProvider;

@Module({})
@Global()
export class S3ProviderModule {
  public static register(options: S3StorageProviderModuleOptions = {}): DynamicModule {
    return {
      exports: [storageProvider],
      imports: [StorageProviderCoreModule.register(options)],
      module: S3ProviderModule,
      providers: [storageProvider],
    };
  }

  public static registerAsync(options: S3StorageProviderModuleAsyncOptions = {}): DynamicModule {
    return {
      exports: [storageProvider],
      imports: [StorageProviderCoreModule.registerAsync(options)],
      module: S3ProviderModule,
      providers: [storageProvider],
    };
  }
}
