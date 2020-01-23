import {
  AbstractStorage,
  CommonStorageService,
  StorageModuleOptions,
  STORAGE_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import { Inject, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import * as cros from "cors";
import * as multer from "multer";
import { join } from "path";
import { SIGNED_URL_CONTROLLER_PATH } from "./constants";
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
    const storage = this.moduleOptions.storage as AbstractStorage;

    if (!storage || storage.provider === "local") {
      const prefix = this.moduleOptions.signedUrlController?.path || SIGNED_URL_CONTROLLER_PATH;
      const path = `${prefix}/:bucket/*`;
      const upload = multer({ dest: join(this.service.getCacheDir(), ".multer") }).any();
      consumer.apply(cros(), StorageDownloadMiddleware).forRoutes({ method: RequestMethod.GET, path });
      consumer.apply(cros(), upload, StorageUploadMiddleware).forRoutes({ method: RequestMethod.PUT, path });
      consumer.apply(cros(), StorageDeleteMiddleware).forRoutes({ method: RequestMethod.DELETE, path });
    }
  }
}
