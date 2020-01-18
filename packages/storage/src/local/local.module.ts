import { CommonStorageService, StorageModuleOptions, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { Inject, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import * as multer from "multer";
import { join } from "path";
import { SIGNED_URL_CONTROLLER_PATH } from "./constants";
import { LocalStorage } from "./local.storage";
import { StorageDeleteMiddleware, StorageDownloadMiddleware, StorageUploadMiddleware } from "./middlewares";

@Module({
  providers: [StorageUploadMiddleware, StorageUploadMiddleware, StorageDeleteMiddleware],
})
export class LocalStorageModule implements NestModule {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS) private readonly moduleOptions: StorageModuleOptions,
    private readonly service: CommonStorageService,
  ) {}

  public configure(consumer: MiddlewareConsumer): void {
    if (!this.moduleOptions.storage || this.moduleOptions.storage instanceof LocalStorage) {
      const prefix = this.moduleOptions.signedUrlController?.path || SIGNED_URL_CONTROLLER_PATH;
      const path = `${prefix}/:bucket/*`;
      const upload = multer({ dest: join(this.service.getCacheDir(), ".multer") }).any();
      consumer.apply(StorageDownloadMiddleware).forRoutes({ method: RequestMethod.GET, path });
      consumer.apply(upload, StorageUploadMiddleware).forRoutes({ method: RequestMethod.PUT, path });
      consumer.apply(StorageDeleteMiddleware).forRoutes({ method: RequestMethod.DELETE, path });
    }
  }
}
