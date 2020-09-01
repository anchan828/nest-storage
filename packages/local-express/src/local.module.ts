import {
  CommonStorageService,
  LocalStorageProviderModuleOptions,
  StorageProviderCoreModule,
  StorageProviderModuleAsyncOptions,
  STORAGE_PROVIDER,
  STORAGE_PROVIDER_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import {
  ClassProvider,
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import * as cors from "cors";
import * as multer from "multer";
import { join } from "path";
import { SIGNED_URL_CONTROLLER_PATH } from "./constants";
import { LocalStorage } from "./local.storage";
import { StorageDeleteMiddleware, StorageDownloadMiddleware, StorageUploadMiddleware } from "./middlewares";

const storageProvider = { provide: STORAGE_PROVIDER, useClass: LocalStorage } as ClassProvider;

@Module({})
export class LocalStorageModule implements NestModule {
  public static register(options: LocalStorageProviderModuleOptions = {}): DynamicModule {
    return {
      exports: [storageProvider],
      imports: [StorageProviderCoreModule.register(options)],
      module: LocalStorageModule,
      providers: [storageProvider, StorageUploadMiddleware, StorageUploadMiddleware, StorageDeleteMiddleware],
    };
  }

  public static registerAsync(
    options: StorageProviderModuleAsyncOptions<LocalStorageProviderModuleOptions> = {},
  ): DynamicModule {
    return {
      exports: [storageProvider],
      imports: [StorageProviderCoreModule.registerAsync(options)],
      module: LocalStorageModule,
      providers: [storageProvider, StorageUploadMiddleware, StorageUploadMiddleware, StorageDeleteMiddleware],
    };
  }

  constructor(
    @Inject(STORAGE_PROVIDER_MODULE_OPTIONS) private readonly moduleOptions: LocalStorageProviderModuleOptions,
    private readonly service: CommonStorageService,
  ) {}

  public configure(consumer: MiddlewareConsumer): void {
    const prefix = this.moduleOptions.signedUrlController?.path || SIGNED_URL_CONTROLLER_PATH;
    const path = `${prefix}/:bucket/*`;
    const upload = multer({ dest: join(this.service.getCacheDir(), ".multer") }).any();
    consumer.apply(cors(), StorageDownloadMiddleware).forRoutes({ method: RequestMethod.GET, path });
    consumer.apply(cors(), upload, StorageUploadMiddleware).forRoutes({ method: RequestMethod.PUT, path });
    consumer.apply(cors(), StorageDeleteMiddleware).forRoutes({ method: RequestMethod.DELETE, path });
  }
}
