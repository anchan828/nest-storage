import type { StorageProviderModuleAsyncOptions } from "@anchan828/nest-storage-common";
import {
  CommonStorageUtils,
  StorageProviderCoreModule,
  STORAGE_PROVIDER,
  STORAGE_PROVIDER_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import type { ClassProvider, DynamicModule, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Inject, Module, RequestMethod } from "@nestjs/common";
import * as cors from "cors";
import * as multer from "multer";
import { join } from "path";
import { SIGNED_URL_CONTROLLER_PATH } from "./constants";
import type { LocalStorageProviderModuleOptions } from "./interfaces";
import { LocalStorage } from "./local.storage";
import { StorageDeleteMiddleware, StorageDownloadMiddleware, StorageUploadMiddleware } from "./middlewares";

const storageProvider = { provide: STORAGE_PROVIDER, useClass: LocalStorage } as ClassProvider;

@Module({})
export class LocalStorageProviderModule implements NestModule {
  public static register(options: LocalStorageProviderModuleOptions = {}): DynamicModule {
    return {
      exports: [storageProvider],
      imports: [StorageProviderCoreModule.register(options)],
      module: LocalStorageProviderModule,
      providers: [storageProvider, StorageUploadMiddleware, StorageUploadMiddleware, StorageDeleteMiddleware],
    };
  }

  public static registerAsync(
    options: StorageProviderModuleAsyncOptions<LocalStorageProviderModuleOptions> = {},
  ): DynamicModule {
    return {
      exports: [storageProvider],
      imports: [StorageProviderCoreModule.registerAsync(options)],
      module: LocalStorageProviderModule,
      providers: [storageProvider, StorageUploadMiddleware, StorageUploadMiddleware, StorageDeleteMiddleware],
    };
  }

  constructor(
    @Inject(STORAGE_PROVIDER_MODULE_OPTIONS) private readonly providerOptions: LocalStorageProviderModuleOptions,
  ) {}

  public configure(consumer: MiddlewareConsumer): void {
    const prefix = this.providerOptions.signedUrlController?.path || SIGNED_URL_CONTROLLER_PATH;
    const path = `${prefix}/:bucket/*`;
    const upload = multer({ dest: join(CommonStorageUtils.getCacheDir({}), ".multer") }).any();
    consumer
      .apply(cors({ credentials: true, origin: true }), StorageDownloadMiddleware)
      .forRoutes({ method: RequestMethod.GET, path });
    consumer
      .apply(cors({ credentials: true, origin: true }), upload, StorageUploadMiddleware)
      .forRoutes({ method: RequestMethod.PUT, path });
    consumer
      .apply(cors({ credentials: true, origin: true }), StorageDeleteMiddleware)
      .forRoutes({ method: RequestMethod.DELETE, path });
  }
}
